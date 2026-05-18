// SSE wrapper around react-native-sse.
//
// Backend /stream/:flowId emits one of:
//   - TraceEvent (workplan.started, task.started, agent.observation,
//     agent.decision, tool.call, tool.result, agent.message,
//     dimension.scored, recovery, task.finished, workplan.finished)
//   - { type: 'heartbeat', ts }                  — first event for demo_* flows
//   - { type: 'error', message }                 — unknown flowId or server abort
//
// We accept all three but only forward parsed TraceEvents to onEvent. Heartbeat
// + error get separate callbacks so the UI can render "connecting…" /
// "stream errored" affordances without polluting the timeline.
//
// Lifecycle contract: subscribe() returns an unsubscribe fn that closes the
// EventSource. The wrapper ALSO closes the EventSource automatically when a
// workplan.finished event arrives. Callers MUST still invoke unsubscribe()
// on unmount to handle the cancellation path (user backs out mid-debate).

import EventSource from 'react-native-sse';
import { buildStreamUrl } from './client';
import { getAuthTokenSync } from './auth';
import type { TraceEvent, TraceEventType } from './types';

export type SseStatus = 'connecting' | 'streaming' | 'finished' | 'error';

export type StreamErrorPayload = { message: string };

export type SseSubscribeOpts = {
  onEvent: (e: TraceEvent) => void;
  onOpen?: () => void;
  onError?: (err: Error) => void;
  /** Backend `{type:'error'}` envelope — separate from network errors. */
  onStreamError?: (err: StreamErrorPayload) => void;
  /** Optional — fires when workplan.finished arrives. */
  onFinished?: (outcome: unknown) => void;
};

export function subscribe(flowId: string, opts: SseSubscribeOpts): () => void {
  const url = buildStreamUrl(flowId);
  const token = getAuthTokenSync();
  const headers: Record<string, string> = { Accept: 'text/event-stream' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // react-native-sse: pollingInterval is the gap BEFORE reconnecting after the
  // server closes the stream. We rely on our explicit close() (fired on
  // workplan.finished) to stop reconnects entirely — close() flips status to
  // CLOSED and the library bails out of any in-flight poll loop. The library
  // default (5s) is fine as a transient-error safety net.
  const es = new EventSource(url, { headers });

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    try {
      es.removeAllEventListeners();
      es.close();
    } catch {
      // ignore — close errors are not actionable
    }
  };

  es.addEventListener('open', () => {
    if (closed) return;
    opts.onOpen?.();
  });

  es.addEventListener('message', (event) => {
    if (closed) return;
    if (!event.data) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(event.data as string);
    } catch (err) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[sse] non-JSON message dropped:', event.data);
      }
      return;
    }
    if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) return;

    const ev = parsed as { type: string } & Record<string, unknown>;

    if (ev.type === 'heartbeat') {
      // Demo / keepalive — ignore for the timeline, but useful as a "connection
      // alive" signal upstream if anyone wants it later.
      return;
    }

    if (ev.type === 'error') {
      const msg = typeof ev.message === 'string' ? ev.message : 'Stream error';
      opts.onStreamError?.({ message: msg });
      close();
      return;
    }

    if (isTraceEvent(ev)) {
      opts.onEvent(ev);
      if (ev.type === 'workplan.finished') {
        opts.onFinished?.(ev.outcome);
        // Backend has already ended its side of the connection; close ours.
        close();
      }
    }
  });

  es.addEventListener('error', (event) => {
    if (closed) return;
    const msg = describeSseError(event);
    opts.onError?.(new Error(msg));
  });

  return close;
}

const TRACE_EVENT_TYPES: ReadonlySet<TraceEventType> = new Set<TraceEventType>([
  'workplan.started',
  'task.started',
  'agent.observation',
  'agent.decision',
  'tool.call',
  'tool.result',
  'agent.message',
  'dimension.scored',
  'recovery',
  'task.finished',
  'workplan.finished',
]);

function isTraceEvent(ev: { type: string }): ev is TraceEvent {
  return TRACE_EVENT_TYPES.has(ev.type as TraceEventType);
}

function describeSseError(event: unknown): string {
  if (event && typeof event === 'object') {
    const e = event as Record<string, unknown>;
    if (typeof e.message === 'string') return e.message;
    if (typeof e.xhrStatus === 'number') return `SSE error (HTTP ${e.xhrStatus})`;
  }
  return 'SSE connection error';
}
