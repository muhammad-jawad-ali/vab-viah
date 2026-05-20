// Typed API client.
//
// Single fetch helper + one typed wrapper per backend endpoint (MASTERPLAN §4).
// Endpoints used in later sessions are stubbed with the right type signature
// but a real implementation — they will not throw at runtime, they just hit
// the path and unwrap. Sessions 2-4 may revisit each wrapper to adjust query
// params, body shape, or response unwrapping once the route handler is read.
//
// Envelope: backend always returns { ok, data?, error? }. apiFetch unwraps
// data on success, throws ApiError on { ok: false } or HTTP >= 400. Callers
// only ever see the data shape.

import { Platform } from 'react-native';
import {
  ApiError,
  type ApiResponse,
  type BaselineMatchResponse,
  type BookConfirmRequest,
  type BookConfirmResponse,
  type BookInitiateRequest,
  type BookInitiateResponse,
  type DisputeFileRequest,
  type DisputeFileResponse,
  type FeedbackRequest,
  type FeedbackResponse,
  type FinalizeRequest,
  type FinalizeResponse,
  type Layer1Request,
  type Layer1Response,
  type Layer2Request,
  type Layer2Response,
  type Layer3Request,
  type Layer3Response,
  type MatchRequestResponse,
  type MatchResultsResponse,
  type OtpStartRequest,
  type OtpStartResponse,
  type OtpVerifyRequest,
  type OtpVerifyResponse,
  type TranscribeRequest,
  type TranscribeResponse,
  type TwinMeResponse,
  type WaliRequest,
  type WaliResponse,
} from './types';
import { clearAuth, getAuthTokenSync } from './auth';

// ---------------------------------------------------------------------------
// Base URL resolution. EXPO_PUBLIC_API_URL is inlined at bundle time.
//
// Fallback is the Railway production URL (not localhost). Reasoning: EAS
// Update bundles published from a machine where Metro doesn't pick up the
// local .env (which happens on some CI/non-shell invocations) would otherwise
// ship a localhost URL to every teammate's phone — surfacing as the "Network
// error" the team hit during demo prep. Railway-as-default means the bundle
// always lands on a reachable host; the dev-loop override via .env still
// works locally and the dev-only console.warn surfaces the silent fallback.
// ---------------------------------------------------------------------------
const PROD_FALLBACK_URL = 'https://lab-viah-production.up.railway.app';
const RAW_BASE = process.env.EXPO_PUBLIC_API_URL ?? PROD_FALLBACK_URL;
export const API_BASE_URL = RAW_BASE.replace(/\/$/, '');

if (!process.env.EXPO_PUBLIC_API_URL && __DEV__) {
  // eslint-disable-next-line no-console
  console.warn(
    `[api] EXPO_PUBLIC_API_URL not set — defaulting to ${PROD_FALLBACK_URL}. ` +
      'Set EXPO_PUBLIC_API_URL in .env to point at a local backend during dev.'
  );
}

// ---------------------------------------------------------------------------
// Core fetch helper.
// ---------------------------------------------------------------------------
type FetchOpts = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean; // default true; pass false for /auth/* and /baseline/match
  signal?: AbortSignal;
};

export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = opts;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Client': Platform.OS,
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getAuthTokenSync();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    // Network-level failure (no server, DNS, CORS preflight, etc.)
    throw new ApiError({
      code: 'NETWORK',
      message:
        err instanceof Error
          ? `Network error: ${err.message}`
          : 'Network error: could not reach server',
      status: 0,
      details: { path, base: API_BASE_URL },
    });
  }

  let envelope: ApiResponse<T> | null = null;
  try {
    envelope = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError({
      code: 'BAD_RESPONSE',
      message: `Server returned non-JSON (HTTP ${res.status})`,
      status: res.status,
    });
  }

  if (!envelope || typeof envelope !== 'object' || !('ok' in envelope)) {
    throw new ApiError({
      code: 'BAD_RESPONSE',
      message: 'Server response missing { ok } envelope',
      status: res.status,
      details: envelope,
    });
  }

  if (!envelope.ok) {
    // Auth expired → wipe local creds and surface a typed error. UI can route
    // back to SignupScreen on catching this.
    if (res.status === 401 || envelope.error.code === 'UNAUTHORIZED') {
      void clearAuth();
    }
    throw new ApiError({
      code: envelope.error.code,
      message: envelope.error.message,
      status: res.status,
      details: envelope.error.details,
    });
  }

  return envelope.data;
}

// ---------------------------------------------------------------------------
// Endpoint wrappers — one per MASTERPLAN §7 row.
// Session 1 wires /auth/* and /twin/me. The rest are typed stubs that hit
// the route; sessions 2-4 will adjust each as the route handlers are read.
// ---------------------------------------------------------------------------
export const api = {
  auth: {
    otpStart: (body: OtpStartRequest) =>
      apiFetch<OtpStartResponse>('/auth/otp/start', { method: 'POST', body, auth: false }),
    otpVerify: (body: OtpVerifyRequest) =>
      apiFetch<OtpVerifyResponse>('/auth/otp/verify', { method: 'POST', body, auth: false }),
  },

  twin: {
    me: () => apiFetch<TwinMeResponse>('/twin/me'),
  },

  onboarding: {
    transcribe: (body: TranscribeRequest) =>
      apiFetch<TranscribeResponse>('/onboarding/transcribe', { method: 'POST', body }),
    layer1: (body: Layer1Request) =>
      apiFetch<Layer1Response>('/onboarding/layer1', { method: 'POST', body }),
    layer2: (body: Layer2Request) =>
      apiFetch<Layer2Response>('/onboarding/layer2', { method: 'POST', body }),
    layer3: (body: Layer3Request) =>
      apiFetch<Layer3Response>('/onboarding/layer3', { method: 'POST', body }),
    wali: (body: WaliRequest) =>
      apiFetch<WaliResponse>('/onboarding/wali', { method: 'POST', body }),
    finalize: (body: FinalizeRequest) =>
      apiFetch<FinalizeResponse>('/onboarding/finalize', { method: 'POST', body }),
  },

  match: {
    request: () => apiFetch<MatchRequestResponse>('/match/request', { method: 'POST' }),
    results: (flowId: string) =>
      apiFetch<MatchResultsResponse>(`/match/results/${encodeURIComponent(flowId)}`),
    baseline: () => apiFetch<BaselineMatchResponse>('/baseline/match'),
  },

  book: {
    initiate: (body: BookInitiateRequest) =>
      apiFetch<BookInitiateResponse>('/book/initiate', { method: 'POST', body }),
    confirm: (body: BookConfirmRequest) =>
      apiFetch<BookConfirmResponse>('/book/confirm', { method: 'POST', body }),
  },

  dispute: {
    file: (body: DisputeFileRequest) =>
      apiFetch<DisputeFileResponse>('/dispute/file', { method: 'POST', body }),
  },

  feedback: {
    postMeeting: (body: FeedbackRequest) =>
      apiFetch<FeedbackResponse>('/feedback/post-meeting', { method: 'POST', body }),
  },

  // /stream/:flowId is SSE — see src/api/sse.ts in Session 3.
};

// Build the SSE stream URL for a given flowId. Used by react-native-sse in
// Session 3. JWT must be supplied via header on the EventSource instance.
export function buildStreamUrl(flowId: string): string {
  return `${API_BASE_URL}/stream/${encodeURIComponent(flowId)}`;
}
