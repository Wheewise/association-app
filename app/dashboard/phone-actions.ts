"use server";

import { createServerSupabaseClient } from "@wheewise/supabase/server";

/** Supabase's phone OTP needs E.164 (+countrycode…) — numbers are stored
 * as plain 10-digit locally, so this fills in +91 if it's missing. */
function toE164(phone: string): string {
  return phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
}

export type PhoneVerifyState = { ok: true } | { ok: false; error: string };

/**
 * Links and starts verifying a phone number for the currently-logged-in
 * user. Requires an active session (unlike the login OTP flow, this isn't
 * a sign-in — it's updating the account's own phone field), which is why
 * this lives on the dashboard rather than during login.
 */
export async function sendPhoneVerification(phone: string): Promise<PhoneVerifyState> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ phone: toE164(phone) });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function verifyPhoneVerification(phone: string, code: string): Promise<PhoneVerifyState> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({
    phone: toE164(phone),
    token: code,
    type: "phone_change",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
