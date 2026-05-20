// BookingScreen — two modes selected by route params:
//
// 1. List mode (no matchId): renders the Meetings Log against
//    useAppStore.meetingsList. Untouched from Session 1.
//
// 2. Book mode (matchId carries the candidateTwinId from
//    CompatibilityReportScreen). Four phases, all wired against real backend:
//      a) Wali form — backend /book/initiate REQUIRES user+candidate wali
//         (name, phone, relation). Prefill from Zustand if previously entered.
//      b) Initiating — POST /book/initiate, subscribe to /stream/:flowId via
//         useTraceStream. Show live phase as the book_meeting workplan emits
//         load_context → wali_brief → propose_slots → persist_proposal.
//      c) Choosing — workplan.finished outcome carries
//         {proposal: {proposals: SlotProposal[]}, waliBrief: {briefs[]}}.
//         Render slot list + expandable wali brief panel. User picks an
//         index, POSTs /book/confirm with {meetingId, slotIndex}.
//      d) Receipt — meeting locked. Show meeting card, route back to log.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MeetingStackParamList } from '../navigation/types';
import { api } from '../api/client';
import {
  ApiError,
  type BookMeetingInitiateOutcome,
  type BookConfirmResponse,
  type SlotProposal,
  type WaliBriefBundle,
  type WaliRelation,
} from '../api/types';
import * as Haptics from 'expo-haptics';
import { useTraceStream } from '../hooks/useTraceStream';
import { useAppStore, type BookingWaliInfo } from '../store/useAppStore';
import { Skeleton } from '../components/Skeleton';

const lightHaptic = () => {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

type Props = {
  navigation: NativeStackNavigationProp<MeetingStackParamList, 'Booking'>;
  route: RouteProp<MeetingStackParamList, 'Booking'>;
};

type BookingPhase = 'wali_form' | 'initiating' | 'choosing' | 'confirmed';

const RELATIONS: WaliRelation[] = ['father', 'uncle', 'brother', 'guardian'];

export const BookingScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { matchId, matchName } = route.params || {};

  // ─────────────────────────────────────────────────────────────────────────
  // List mode — no matchId → render the meetings log (Session 1 UI).
  // ─────────────────────────────────────────────────────────────────────────
  if (!matchId) {
    return <MeetingsLog navigation={navigation} insets={insets} />;
  }

  return (
    <BookMode
      candidateTwinId={matchId}
      matchName={matchName ?? '(candidate)'}
      navigation={navigation}
      insets={insets}
    />
  );
};

// =========================================================================
// BookMode — the wali form / SSE / slot picker / receipt machine.
// =========================================================================

const BookMode = ({
  candidateTwinId,
  matchName,
  navigation,
  insets,
}: {
  candidateTwinId: string;
  matchName: string;
  navigation: NativeStackNavigationProp<MeetingStackParamList, 'Booking'>;
  insets: { top: number; bottom: number };
}) => {
  const bookingWaliInfo = useAppStore((s) => s.bookingWaliInfo);
  const setBookingWaliInfo = useAppStore((s) => s.setBookingWaliInfo);
  const addMeeting = useAppStore((s) => s.addMeeting);

  // ─── Wali form state ─────────────────────────────────────────────────────
  // We only collect the USER's wali — the candidate's wali is server-defaulted
  // since the user doesn't realistically know their match's wali contact.
  const [userWaliName, setUserWaliName] = useState(bookingWaliInfo?.userWaliName ?? '');
  const [userWaliRelation, setUserWaliRelation] = useState<WaliRelation>(
    bookingWaliInfo?.userWaliRelation ?? 'father'
  );
  const [userWaliPhone, setUserWaliPhone] = useState(
    bookingWaliInfo?.userWaliPhone ?? '+92'
  );
  const [area, setArea] = useState(bookingWaliInfo?.area ?? '');

  // ─── Flow state ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<BookingPhase>('wali_form');
  const [flowId, setFlowId] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [initiateErr, setInitiateErr] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [confirmedOutcome, setConfirmedOutcome] = useState<BookConfirmResponse | null>(null);
  const [confirming, setConfirming] = useState(false);

  // React 19 strict-mode gate.
  const initiateFired = useRef(false);

  const trace = useTraceStream(flowId);

  // The workplan.finished outcome carries the proposal + wali briefs. Type it
  // through `unknown` first because trace.outcome is `unknown`.
  const outcome: BookMeetingInitiateOutcome | null =
    trace.status === 'finished' && trace.outcome
      ? (trace.outcome as BookMeetingInitiateOutcome)
      : null;

  // When the outcome lands, transition to choosing phase.
  useEffect(() => {
    if (outcome && phase === 'initiating') setPhase('choosing');
  }, [outcome, phase]);

  // ─── Submit wali form → /book/initiate ──────────────────────────────────
  const onSubmitWaliForm = useCallback(async () => {
    if (initiateFired.current) return;
    // Basic E.164 validation locally — backend enforces same regex.
    if (!/^\+\d{7,15}$/.test(userWaliPhone)) {
      Alert.alert('Phone format', 'Your wali phone must be E.164 (e.g. +923001234567).');
      return;
    }
    if (userWaliName.trim().length === 0) {
      Alert.alert('Missing name', 'Your wali name is required.');
      return;
    }

    initiateFired.current = true;
    setInitiateErr(null);
    setPhase('initiating');

    const info: BookingWaliInfo = {
      userWaliName: userWaliName.trim(),
      userWaliRelation,
      userWaliPhone: userWaliPhone.trim(),
      ...(area.trim().length > 0 ? { area: area.trim() } : {}),
    };
    setBookingWaliInfo(info);

    try {
      // candidateWaliName / candidateWaliPhone are server-defaulted.
      const res = await api.book.initiate({
        candidateTwinId,
        ...info,
      });
      setFlowId(res.flowId);
      setMeetingId(res.meetingId);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? `${err.code}: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Could not initiate booking.';
      setInitiateErr(msg);
      setPhase('wali_form');
      initiateFired.current = false;
    }
  }, [
    candidateTwinId,
    userWaliName,
    userWaliRelation,
    userWaliPhone,
    area,
    setBookingWaliInfo,
  ]);

  // ─── Confirm selected slot → /book/confirm ──────────────────────────────
  const onConfirmSlot = useCallback(async () => {
    if (selectedIndex === null || meetingId === null || confirming) return;
    setConfirming(true);
    try {
      const res = await api.book.confirm({ meetingId, slotIndex: selectedIndex });
      setConfirmedOutcome(res);
      // Update the local meetings list with the new confirmed meeting.
      const slot = outcome?.proposal.proposals[selectedIndex];
      addMeeting({
        id: res.meetingId,
        matchName,
        slotDay: res.finalized.slotHuman,
        slotTime: '',
        type: 'In-Person',
        location: `${res.finalized.venue.name}, ${res.finalized.venue.area}`,
        status: 'scheduled',
      });
      void slot; // silence unused
      setPhase('confirmed');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not confirm meeting.';
      Alert.alert('Confirmation failed', msg);
    } finally {
      setConfirming(false);
    }
  }, [selectedIndex, meetingId, confirming, outcome, matchName, addMeeting]);

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View
          className={`w-2 h-2 rounded-full mr-2 ${
            phase === 'confirmed'
              ? 'bg-emerald-600'
              : phase === 'initiating'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
          }`}
        />
        <Text className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1" numberOfLines={1}>
          AG-TRACE // BOOK_MEETING · {phase.toUpperCase().replace('_', ' ')}
          {flowId ? ` · ${trace.events.length} EVENTS` : ''}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-2 mb-6">
            <Text className="text-primary font-bold text-[10px] uppercase tracking-[0.25em] mb-1">
              Halal Reveal
            </Text>
            <Text className="text-slate-900 font-serif text-3xl font-bold">
              {phase === 'confirmed' ? 'Meeting Confirmed' : 'Schedule Meeting'}
            </Text>
            <Text className="text-slate-500 text-sm mt-1">with {matchName}</Text>
          </View>

          {phase === 'wali_form' ? (
            <WaliForm
              userWaliName={userWaliName}
              setUserWaliName={setUserWaliName}
              userWaliRelation={userWaliRelation}
              setUserWaliRelation={setUserWaliRelation}
              userWaliPhone={userWaliPhone}
              setUserWaliPhone={setUserWaliPhone}
              area={area}
              setArea={setArea}
              error={initiateErr}
              onSubmit={onSubmitWaliForm}
            />
          ) : null}

          {phase === 'initiating' ? (
            <InitiatingState
              phaseLabel={taskToHumanLabel(trace.events)}
              eventCount={trace.events.length}
            />
          ) : null}

          {phase === 'choosing' && outcome ? (
            <>
              <SlotPicker
                proposals={outcome.proposal.proposals}
                city={outcome.proposal.city}
                area={outcome.proposal.area}
                selectedIndex={selectedIndex}
                onSelect={(i) => {
                  lightHaptic();
                  setSelectedIndex(i);
                }}
              />
              <WaliBriefPanel briefs={outcome.waliBrief.briefs} />
              <TouchableOpacity
                disabled={selectedIndex === null || confirming}
                onPress={() => {
                  lightHaptic();
                  void onConfirmSlot();
                }}
                accessibilityRole="button"
                accessibilityLabel="Confirm booking with selected slot"
                accessibilityState={{ disabled: selectedIndex === null || confirming }}
                className={`py-5 rounded-2xl items-center shadow-md mt-4 ${
                  selectedIndex !== null && !confirming
                    ? 'bg-primary shadow-primary/10'
                    : 'bg-slate-200'
                }`}
              >
                {confirming ? (
                  <ActivityIndicator color="#fdfbf7" />
                ) : (
                  <Text
                    className={`font-bold text-xs tracking-widest uppercase ${
                      selectedIndex !== null ? 'text-surface' : 'text-slate-400'
                    }`}
                  >
                    Confirm Booking
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : null}

          {phase === 'confirmed' && confirmedOutcome ? (
            <Receipt
              outcome={confirmedOutcome}
              matchName={matchName}
              onDone={() =>
                navigation.navigate('Booking', {
                  matchId: undefined,
                  matchName: undefined,
                } as never)
              }
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// =========================================================================
// WaliForm — collects the 5 mandatory fields backend requires.
// =========================================================================

const WaliForm = ({
  userWaliName,
  setUserWaliName,
  userWaliRelation,
  setUserWaliRelation,
  userWaliPhone,
  setUserWaliPhone,
  area,
  setArea,
  error,
  onSubmit,
}: {
  userWaliName: string;
  setUserWaliName: (v: string) => void;
  userWaliRelation: WaliRelation;
  setUserWaliRelation: (v: WaliRelation) => void;
  userWaliPhone: string;
  setUserWaliPhone: (v: string) => void;
  area: string;
  setArea: (v: string) => void;
  error: string | null;
  onSubmit: () => void;
}) => (
  <>
    <View className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 mb-5">
      <Text className="text-emerald-800 font-bold text-[10px] uppercase tracking-widest mb-1">
        Why we need this
      </Text>
      <Text className="text-emerald-900/80 text-xs leading-relaxed">
        Your wali receives an auto-generated brief in two languages plus an SMS
        preview — you can share these without their reply. The candidate's
        side is handled by us. Booking proceeds either way.
      </Text>
    </View>

    {error ? (
      <View className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-4">
        <Text className="text-rose-700 text-xs leading-relaxed">{error}</Text>
      </View>
    ) : null}

    <Text className="text-slate-800 font-serif text-lg font-bold mb-3">Your Wali</Text>
    <Field label="Name" value={userWaliName} onChange={setUserWaliName} placeholder="Asad Khan" />
    <View className="mb-4">
      <Text className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-2">
        Relation
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {RELATIONS.map((r) => {
          const active = userWaliRelation === r;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setUserWaliRelation(r)}
              accessibilityRole="radio"
              accessibilityLabel={`Wali relation: ${r}`}
              accessibilityState={{ selected: active }}
              className={`px-3.5 py-1.5 rounded-full border ${
                active ? 'bg-primary border-primary' : 'bg-surface border-slate-200'
              }`}
            >
              <Text
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  active ? 'text-surface' : 'text-slate-600'
                }`}
              >
                {r}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
    <Field
      label="Phone (E.164)"
      value={userWaliPhone}
      onChange={setUserWaliPhone}
      placeholder="+923001234567"
      keyboardType="phone-pad"
    />

    <Text className="text-slate-800 font-serif text-lg font-bold mb-3 mt-2">Meeting area (optional)</Text>
    <Field
      label="Area or neighborhood"
      value={area}
      onChange={setArea}
      placeholder="e.g. DHA Phase 6"
    />

    <TouchableOpacity
      onPress={onSubmit}
      accessibilityRole="button"
      accessibilityLabel="Submit wali information and build booking"
      className="bg-primary py-5 rounded-2xl items-center shadow-md shadow-primary/10 mt-4"
    >
      <Text className="text-surface font-bold text-xs tracking-widest uppercase">
        Build my booking →
      </Text>
    </TouchableOpacity>
  </>
);

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad';
}) => (
  <View className="bg-surface border border-slate-200 rounded-2xl p-4 mb-3 shadow-sm">
    <Text className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1.5">
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      keyboardType={keyboardType ?? 'default'}
      autoCorrect={false}
      autoCapitalize="words"
      className="text-slate-800 text-base"
    />
  </View>
);

// =========================================================================
// InitiatingState — while the workplan runs (typically 6-10s).
// =========================================================================

const InitiatingState = ({ phaseLabel, eventCount }: { phaseLabel: string; eventCount: number }) => (
  <View>
    {/* Live phase indicator on top */}
    <View className="bg-surface border border-slate-200 shadow-sm rounded-3xl p-5 items-center mb-4">
      <View className="flex-row items-center mb-2">
        <ActivityIndicator size="small" color="#059669" />
        <Text className="text-slate-900 font-serif text-base ml-3">
          Building your booking
        </Text>
      </View>
      <Text className="text-slate-500 text-[12px] text-center mb-3 leading-relaxed">
        The Wali agent is writing briefs while the Booking agent picks slots
        and venues. Usually ~10 seconds.
      </Text>
      <View className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
        <Text className="text-emerald-800 font-mono text-[10px] uppercase tracking-widest text-center">
          {phaseLabel}
        </Text>
        <Text className="text-emerald-700/70 text-[11px] text-center mt-1">
          {eventCount} trace events
        </Text>
      </View>
    </View>

    {/* Slot list skeleton — 3 rows */}
    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em] mb-2">
      Slots loading
    </Text>
    {[0, 1, 2].map((i) => (
      <View
        key={i}
        className="bg-surface border border-slate-200 rounded-2xl p-5 mb-3 shadow-sm"
      >
        <View className="flex-row justify-between mb-3">
          <Skeleton width="55%" height={18} />
          <Skeleton width={26} height={14} />
        </View>
        <View className="flex-row items-center">
          <Skeleton width={20} height={20} rounded={6} />
          <View className="ml-2 flex-1">
            <Skeleton width="70%" height={14} />
            <View style={{ height: 6 }} />
            <Skeleton width="45%" height={12} />
          </View>
        </View>
      </View>
    ))}

    {/* Wali brief panel collapsed-state skeleton */}
    <View className="bg-surface border border-slate-200 shadow-sm rounded-3xl mt-2 px-5 py-4">
      <Skeleton width="35%" height={10} />
      <View style={{ height: 6 }} />
      <Skeleton width="55%" height={14} />
    </View>
  </View>
);

// Map the most recent task.started to a human label.
function taskToHumanLabel(events: { type: string; task?: string }[]): string {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const ev = events[i];
    if (ev && ev.type === 'task.started') {
      const t = (ev as { task: string }).task;
      switch (t) {
        case 'load_context':
          return 'Loading your Twin + report';
        case 'wali_brief':
          return 'Writing wali brief';
        case 'persist_proposal':
          return 'Saving the proposal';
        default:
          if (t.startsWith('propose_slots')) return 'Choosing slots + venues';
          return t.replace(/_/g, ' ');
      }
    }
  }
  return 'Initiating';
}

// =========================================================================
// SlotPicker — renders the proposal list (3 typically).
// =========================================================================

const SlotPicker = ({
  proposals,
  city,
  area,
  selectedIndex,
  onSelect,
}: {
  proposals: SlotProposal[];
  city: string;
  area: string;
  selectedIndex: number | null;
  onSelect: (i: number) => void;
}) => (
  <>
    <View className="flex-row items-center mb-3">
      <Text className="text-slate-800 font-serif text-lg font-bold flex-1">
        Proposed Slots
      </Text>
      <View className="bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
        <Text className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
          {proposals.length} options · {city} / {area}
        </Text>
      </View>
    </View>

    {proposals.map((p) => {
      const isSelected = selectedIndex === p.index;
      return (
        <TouchableOpacity
          key={p.index}
          onPress={() => onSelect(p.index)}
          accessibilityRole="radio"
          accessibilityLabel={`Slot ${p.index + 1}: ${p.slot.slotHuman} at ${p.venue.name}`}
          accessibilityState={{ selected: isSelected }}
          className={`rounded-2xl p-5 mb-3 border ${
            isSelected
              ? 'bg-primary/5 border-primary shadow-sm'
              : 'bg-surface border-slate-200 shadow-sm'
          }`}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text
              className={`font-bold text-base ${
                isSelected ? 'text-primary' : 'text-slate-800'
              }`}
            >
              {p.slot.slotHuman}
            </Text>
            <Text
              className={`font-mono text-[10px] font-bold ${
                isSelected ? 'text-primary' : 'text-slate-400'
              }`}
            >
              #{p.index + 1}
            </Text>
          </View>
          <View className="mb-2">
            <Text className="text-slate-700 font-bold text-sm">{p.venue.name}</Text>
            <Text className="text-slate-500 text-xs">
              {p.venue.area}
              {p.venue.rating ? `  •  ★ ${p.venue.rating.toFixed(1)}` : ''}
              {p.venueFromFallback ? '  •  curated' : ''}
            </Text>
          </View>

          {/* Inline map thumbnail — tap to open in Google Maps. Renders only
              when backend supplied a Static Maps URL (requires GOOGLE_MAPS_API_KEY). */}
          {p.venue.staticMapUrl ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                Linking.openURL(p.venue.mapsUrl).catch(() => {});
              }}
              accessibilityRole="link"
              accessibilityLabel={`Open ${p.venue.name} in Google Maps`}
              activeOpacity={0.85}
              className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
            >
              <Image
                source={{ uri: p.venue.staticMapUrl }}
                style={{ width: '100%', height: 120 }}
                resizeMode="cover"
              />
              <View className="absolute bottom-1.5 right-1.5 bg-white/95 rounded-full px-2.5 py-1 border border-slate-200">
                <Text className="text-primary text-[10px] font-bold uppercase tracking-widest">
                  Open in Maps ↗
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      );
    })}
  </>
);

// =========================================================================
// WaliBriefPanel — expandable, per-language. Lazy-loads audio on play.
// =========================================================================

const WaliBriefPanel = ({ briefs }: { briefs: WaliBriefBundle[] }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeLang, setActiveLang] = useState<string>(
    briefs[0]?.language ?? 'en'
  );
  const active = briefs.find((b) => b.language === activeLang) ?? briefs[0];

  return (
    <View className="bg-surface border border-slate-200 shadow-sm rounded-3xl mt-5 mb-1 overflow-hidden">
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center px-5 py-4"
      >
        <View className="flex-1">
          <Text className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">
            Optional
          </Text>
          <Text className="text-slate-900 font-bold text-sm">Wali Brief</Text>
          <Text className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
            Share with your wali — you can proceed without their reply.
          </Text>
        </View>
        <Text className="text-slate-400 text-lg ml-2">{expanded ? '▾' : '▸'}</Text>
      </TouchableOpacity>

      {expanded && active ? (
        <View className="px-5 pb-5 border-t border-slate-100">
          {/* Language tabs */}
          {briefs.length > 1 ? (
            <View className="flex-row gap-2 mt-3 mb-4">
              {briefs.map((b) => {
                const isActive = b.language === activeLang;
                return (
                  <TouchableOpacity
                    key={b.language}
                    onPress={() => setActiveLang(b.language)}
                    className={`px-3 py-1.5 rounded-full border ${
                      isActive
                        ? 'bg-primary border-primary'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isActive ? 'text-surface' : 'text-slate-600'
                      }`}
                    >
                      {b.language === 'en' ? 'English' : b.language === 'ur' ? 'اردو' : 'Roman Urdu'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          <BriefBody bundle={active} />
        </View>
      ) : null}
    </View>
  );
};

const BriefBody = ({ bundle }: { bundle: WaliBriefBundle }) => {
  const audio = bundle.audio;
  const sms = bundle.walisSms.body;
  return (
    <>
      {/* Document */}
      <Text className="text-slate-900 font-bold text-sm mb-2 leading-snug">
        {bundle.document.headline}
      </Text>
      <Text className="text-slate-700 text-xs leading-relaxed mb-3">
        {bundle.document.candidate_summary}
      </Text>

      {bundle.document.alignment_points.length > 0 ? (
        <View className="mb-3">
          <Text className="text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-1.5">
            Alignment
          </Text>
          {bundle.document.alignment_points.map((p, i) => (
            <View key={i} className="flex-row mb-1">
              <Text className="text-emerald-600 mr-2 text-xs">✓</Text>
              <Text className="text-slate-700 text-xs flex-1 leading-relaxed">{p}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {bundle.document.discussion_points.length > 0 ? (
        <View className="mb-3">
          <Text className="text-amber-700 text-[10px] font-bold uppercase tracking-widest mb-1.5">
            Worth discussing
          </Text>
          {bundle.document.discussion_points.map((p, i) => (
            <View key={i} className="flex-row mb-1">
              <Text className="text-amber-600 mr-2 text-xs">•</Text>
              <Text className="text-slate-700 text-xs flex-1 leading-relaxed">{p}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="bg-emerald-50/40 border-l-2 border-primary p-3 rounded-md mb-4">
        <Text className="text-emerald-800/90 text-xs leading-relaxed italic">
          {bundle.document.recommended_next_step}
        </Text>
      </View>

      {/* Audio */}
      {audio.audioDataUri && !audio.textOnly ? (
        <AudioPlayer dataUri={audio.audioDataUri} bytes={audio.audioBytes} />
      ) : (
        <View className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-4">
          <Text className="text-slate-500 text-[11px]">
            Audio unavailable for this brief
            {audio.skipReason ? ` (${audio.skipReason})` : ''}.
          </Text>
        </View>
      )}

      {/* SMS preview */}
      {sms.length > 0 ? (
        <View className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <View className="flex-row items-center mb-1.5">
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex-1">
              📱 SMS preview · {bundle.walisSms.segments} seg
            </Text>
            <TouchableOpacity
              onPress={() => void Share.share({ message: sms })}
              className="bg-primary/10 border border-primary/30 px-2 py-1 rounded-md"
            >
              <Text className="text-primary text-[10px] font-bold uppercase">Share</Text>
            </TouchableOpacity>
          </View>
          <Text selectable className="text-slate-700 text-xs italic leading-relaxed">
            {sms}
          </Text>
        </View>
      ) : null}
    </>
  );
};

// expo-av Audio.Sound only spins up when the user actually taps Play — data
// URIs can be hundreds of KB and the panel might never be expanded.
const AudioPlayer = ({ dataUri, bytes }: { dataUri: string; bytes: number }) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      // Unload on unmount.
      void soundRef.current?.unloadAsync().catch(() => undefined);
      soundRef.current = null;
    };
  }, []);

  const toggle = async () => {
    if (loading) return;
    try {
      if (!soundRef.current) {
        setLoading(true);
        const { sound } = await Audio.Sound.createAsync(
          { uri: dataUri },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if ('isPlaying' in status) setPlaying(status.isPlaying);
          if ('didJustFinish' in status && status.didJustFinish) {
            setPlaying(false);
          }
        });
        setLoading(false);
        setPlaying(true);
        return;
      }
      if (playing) {
        await soundRef.current.pauseAsync();
        setPlaying(false);
      } else {
        await soundRef.current.replayAsync();
        setPlaying(true);
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Audio error', err instanceof Error ? err.message : 'Could not play audio.');
    }
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      className="flex-row items-center bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-3 mb-4"
    >
      <Text className="text-2xl mr-3">{playing ? '⏸' : '▶︎'}</Text>
      <View className="flex-1">
        <Text className="text-emerald-800 font-bold text-xs uppercase tracking-widest">
          {loading ? 'Loading audio…' : playing ? 'Playing wali brief' : 'Play wali brief'}
        </Text>
        <Text className="text-emerald-700/70 text-[11px]">
          {Math.round(bytes / 1024)} KB · TTS-synthesized
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// =========================================================================
// Receipt — final state after /book/confirm.
// =========================================================================

const Receipt = ({
  outcome,
  matchName,
  onDone,
}: {
  outcome: BookConfirmResponse;
  matchName: string;
  onDone: () => void;
}) => (
  <>
    <View className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-5">
      <Text className="text-emerald-800 font-bold text-[10px] uppercase tracking-widest mb-2">
        ✓ Meeting locked
      </Text>
      <Text className="text-slate-900 font-serif text-xl font-bold mb-2 leading-snug">
        {outcome.finalized.slotHuman}
      </Text>
      <Text className="text-slate-700 text-sm leading-relaxed mb-1">
        with {matchName} at <Text className="font-bold">{outcome.finalized.venue.name}</Text>
      </Text>
      <Text className="text-slate-500 text-xs">
        {outcome.finalized.venue.address}, {outcome.finalized.venue.city}
      </Text>
    </View>

    <View className="bg-surface border border-slate-200 shadow-sm rounded-2xl p-4 mb-5">
      <Text className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-2">
        Reminders scheduled
      </Text>
      {outcome.finalized.reminders.map((r, i) => (
        <Text key={i} className="text-slate-700 text-xs mb-0.5">
          • {r.hoursBefore}h before → {r.audience.replace(/_/g, ' ')} via {r.channel}
        </Text>
      ))}
    </View>

    <View className="bg-surface border border-slate-200 shadow-sm rounded-2xl p-4 mb-5">
      <Text className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-2">
        Confirmation SMS · {outcome.confirmationSms.length} rendered (mock)
      </Text>
      {outcome.confirmationSms.map((s, i) => (
        <View key={i} className="mb-2 last:mb-0">
          <Text className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">
            {s.template.replace(/_/g, ' ')}
          </Text>
          <Text selectable className="text-slate-700 text-xs italic">"{s.body}"</Text>
        </View>
      ))}
    </View>

    <TouchableOpacity
      onPress={onDone}
      accessibilityRole="button"
      accessibilityLabel="View meetings log"
      className="bg-primary py-5 rounded-2xl items-center shadow-md shadow-primary/10"
    >
      <Text className="text-surface font-bold text-xs tracking-widest uppercase">
        View Meetings Log →
      </Text>
    </TouchableOpacity>
  </>
);

// =========================================================================
// MeetingsLog — list mode (no matchId). Preserved from Session 1 with
// an empty-state replacing the mock-seeded copy.
// =========================================================================

const MeetingsLog = ({
  navigation,
  insets,
}: {
  navigation: NativeStackNavigationProp<MeetingStackParamList, 'Booking'>;
  insets: { top: number; bottom: number };
}) => {
  const meetingsList = useAppStore((s) => s.meetingsList);
  const scheduledMeetings = useMemo(
    () => meetingsList.filter((m) => m.status === 'scheduled'),
    [meetingsList]
  );
  const pendingMeetings = useMemo(
    () => meetingsList.filter((m) => m.status === 'pending_feedback'),
    [meetingsList]
  );
  const pastMeetings = useMemo(
    () => meetingsList.filter((m) => m.status === 'done'),
    [meetingsList]
  );

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
        <Text className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1">
          AG-TRACE // LOG AGENT: MEETING HISTORIES + SCHEDULES
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6 mb-8">
          <Text className="text-primary font-bold text-[10px] uppercase tracking-[0.25em] mb-1">
            Rishta Matrimonials
          </Text>
          <Text className="text-slate-900 font-serif text-3xl font-bold">Meetings Log</Text>
          <Text className="text-slate-500 text-sm mt-1">
            Track your moderator-guided meetings and chaperone schedules.
          </Text>
        </View>

        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <Text className="text-slate-800 font-serif text-xl font-bold flex-1">
              🕒 Scheduled
            </Text>
            <View className="bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
              <Text className="text-amber-800 font-bold text-[9px] uppercase tracking-wider">
                {scheduledMeetings.length} pending
              </Text>
            </View>
          </View>

          {scheduledMeetings.length === 0 ? (
            <View className="bg-surface border border-slate-100 rounded-3xl p-6 items-center shadow-sm">
              <Text className="text-4xl mb-3">📅</Text>
              <Text className="text-slate-700 font-serif font-bold text-sm text-center mb-1">
                No upcoming meetings
              </Text>
              <Text className="text-slate-400 text-xs text-center leading-relaxed">
                Tap "Initiate Halal Reveal" on a compatibility report to
                schedule a chaperoned meeting.
              </Text>
            </View>
          ) : (
            scheduledMeetings.map((meeting) => (
              <View
                key={meeting.id}
                className="bg-surface border border-slate-200 rounded-3xl p-5 mb-4 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-slate-900 font-bold text-base">{meeting.matchName}</Text>
                    <Text className="text-slate-500 text-xs mt-0.5 font-mono">
                      {meeting.slotDay}
                      {meeting.slotTime ? ` @ ${meeting.slotTime}` : ''}
                    </Text>
                  </View>
                  <View className="bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                    <Text className="text-blue-600 text-[9px] font-bold uppercase">Scheduled</Text>
                  </View>
                </View>
                {meeting.location ? (
                  <Text className="text-slate-400 text-xs mb-3">📍 {meeting.location}</Text>
                ) : null}
                <View className="flex-row gap-2 mt-2">
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('FeedbackSurvey', { meetingId: meeting.id })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Rate the meeting with ${meeting.matchName} after it happens`}
                    className="flex-1 bg-emerald-800/10 border border-emerald-800/20 py-2.5 rounded-xl items-center"
                  >
                    <Text className="text-emerald-800 text-[10px] font-bold uppercase tracking-widest">
                      Rate after meeting
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('DisputeForm', {
                        matchId: meeting.id,
                        matchName: meeting.matchName,
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Report an issue with ${meeting.matchName}`}
                    className="flex-1 border border-rose-200 bg-rose-50/50 py-2.5 rounded-xl items-center"
                  >
                    <Text className="text-rose-700 text-[10px] font-bold uppercase tracking-widest">
                      Report issue
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {pendingMeetings.length > 0 ? (
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Text className="text-slate-800 font-serif text-xl font-bold flex-1">⚠️ Action Needed</Text>
              <View className="bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                <Text className="text-amber-800 font-bold text-[9px] uppercase tracking-wider">
                  {pendingMeetings.length} pending feedback
                </Text>
              </View>
            </View>

            {pendingMeetings.map((meeting) => (
              <View
                key={meeting.id}
                className="bg-amber-50/50 border border-amber-200 rounded-3xl p-5 mb-4 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-slate-900 font-bold text-base">{meeting.matchName}</Text>
                    <Text className="text-slate-500 text-xs mt-0.5 font-mono">
                      {meeting.slotDay}
                    </Text>
                  </View>
                  <View className="bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-md">
                    <Text className="text-amber-800 text-[9px] font-bold uppercase">Rate Later</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('FeedbackSurvey', { meetingId: meeting.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`Rate meeting with ${meeting.matchName} now`}
                  className="bg-amber-600 py-3 rounded-2xl items-center mt-2 shadow-sm shadow-amber-900/10"
                >
                  <Text className="text-white text-xs font-extrabold uppercase tracking-widest">
                    Rate now ⭐
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {pastMeetings.length > 0 ? (
          <View className="mb-12">
            <View className="flex-row items-center mb-4">
              <Text className="text-slate-800 font-serif text-xl font-bold flex-1">
                ✅ Concluded
              </Text>
              <View className="bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                <Text className="text-emerald-800 font-bold text-[9px] uppercase tracking-wider">
                  {pastMeetings.length} done
                </Text>
              </View>
            </View>

            {pastMeetings.map((meeting) => (
              <View
                key={meeting.id}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-5 mb-4 opacity-85"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-slate-800 font-bold text-base line-through">
                      {meeting.matchName}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-0.5 font-mono">
                      {meeting.slotDay}
                    </Text>
                  </View>
                  <View className="bg-emerald-800/10 px-2.5 py-1 rounded-full">
                    <Text className="text-emerald-800 font-extrabold text-[9px] uppercase tracking-wider">
                      Completed ⭐
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};
