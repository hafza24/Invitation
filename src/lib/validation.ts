import { useEffect, useId, useSyncExternalStore } from "react";
import { saveNow } from "@/lib/siteStore";

// ============ Field error registry ============
// A flat Map keyed by a stable field id. Each editor field registers its
// current error message (or null) via useFieldError; the registry exposes the
// aggregate count so the admin shell can show a banner and gate save.

const errors = new Map<string, string>();
const listeners = new Set<() => void>();
let snapshot: { count: number; messages: string[] } = { count: 0, messages: [] };

function rebuild() {
  const messages = [...errors.values()];
  snapshot = { count: messages.length, messages };
}
function emit() {
  rebuild();
  listeners.forEach((l) => l());
}

export function setFieldError(id: string, msg: string | null) {
  const prev = errors.get(id) ?? null;
  if (msg) errors.set(id, msg);
  else errors.delete(id);
  if (prev !== msg) {
    const wasBlocking = snapshot.count > 0;
    emit();
    // When all errors clear, flush the latest state to the backend so the
    // autosave that was skipped while invalid actually lands.
    if (wasBlocking && snapshot.count === 0) {
      void saveNow();
    }
  }
}

export function hasValidationErrors(): boolean {
  return snapshot.count > 0;
}

export function useValidationSnapshot() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
    () => snapshot,
  );
}

// ============ Field hook ============

export type Validator = (value: unknown) => string | null;

export function useFieldError(value: unknown, validator: Validator | Validator[] | undefined): string | null {
  const id = useId();
  let msg: string | null = null;
  if (validator) {
    const fns = Array.isArray(validator) ? validator : [validator];
    for (const fn of fns) {
      const r = fn(value);
      if (r) {
        msg = r;
        break;
      }
    }
  }
  useEffect(() => {
    setFieldError(id, msg);
    return () => setFieldError(id, null);
  }, [id, msg]);
  return msg;
}

// ============ Validators ============

const isStr = (v: unknown): v is string => typeof v === "string";
const trimmed = (v: unknown) => (isStr(v) ? v.trim() : "");

export const v = {
  required:
    (label: string): Validator =>
    (val) =>
      trimmed(val).length > 0 ? null : `${label} is required`,

  maxLen:
    (label: string, n: number): Validator =>
    (val) =>
      isStr(val) && val.length > n ? `${label} must be ${n} characters or less` : null,

  minLen:
    (label: string, n: number): Validator =>
    (val) => {
      const t = trimmed(val);
      if (!t) return null; // pair with required if needed
      return t.length >= n ? null : `${label} must be at least ${n} characters`;
    },

  url:
    (label = "URL"): Validator =>
    (val) => {
      if (!val || !isStr(val) || !val.trim()) return null;
      try {
        const u = new URL(val);
        if (!/^https?:$/.test(u.protocol)) return `${label} must start with http:// or https://`;
        return null;
      } catch {
        return `${label} must be a valid URL`;
      }
    },

  requiredUrl:
    (label = "URL"): Validator =>
    (val) => {
      if (!trimmed(val)) return `${label} is required`;
      return v.url(label)(val);
    },

  embedUrl:
    (label = "Embed URL"): Validator =>
    (val) => {
      const t = trimmed(val);
      if (!t) return null;
      const urlErr = v.url(label)(val);
      if (urlErr) return urlErr;
      // Permissive: any https URL is fine. Warn if it looks like a plain Maps
      // search link (those don't work in an iframe).
      if (/google\.[^/]+\/maps(?!\/embed)/i.test(t)) {
        return "Use the Google Maps embed URL (Share → Embed a map → copy src)";
      }
      return null;
    },

  email:
    (): Validator =>
    (val) => {
      const t = trimmed(val);
      if (!t) return null;
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t) ? null : "Enter a valid email address";
    },

  phone:
    (): Validator =>
    (val) => {
      const t = trimmed(val);
      if (!t) return null;
      // Allow digits, spaces, +, -, (, ), with 6–20 chars.
      return /^\+?[0-9 ()\-]{6,20}$/.test(t) ? null : "Enter a valid phone number";
    },

  isoDate:
    (label: string): Validator =>
    (val) => {
      const t = trimmed(val);
      if (!t) return `${label} is required`;
      return isNaN(Date.parse(t)) ? `${label} must be a valid date` : null;
    },

  numberRange:
    (label: string, min: number, max: number): Validator =>
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const n = Number(val);
      if (Number.isNaN(n)) return `${label} must be a number`;
      if (n < min || n > max) return `${label} must be between ${min} and ${max}`;
      return null;
    },
};
