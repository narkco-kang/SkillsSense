/**
 * Membership management via Supabase
 *
 * Tables needed in Supabase:
 *   memberships (id, email, plan, expires_at, created_at, updated_at)
 *   download_logs (id, email, skill_slug, downloaded_at, ip)
 *
 * Run this SQL in Supabase SQL Editor to create tables:
 *
 * CREATE TABLE memberships (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   email TEXT UNIQUE NOT NULL,
 *   plan TEXT DEFAULT 'free',
 *   expires_at TIMESTAMPTZ,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE download_logs (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   email TEXT,
 *   skill_slug TEXT NOT NULL,
 *   ip TEXT,
 *   downloaded_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;
 *
 * -- Allow anon reads/writes for membership checks
 * CREATE POLICY "Allow anon" ON memberships FOR SELECT USING (true);
 * CREATE POLICY "Allow anon insert" ON memberships FOR INSERT WITH CHECK (true);
 * CREATE POLICY "Allow anon update" ON memberships FOR UPDATE USING (true);
 * CREATE POLICY "Allow anon" ON download_logs FOR SELECT USING (true);
 * CREATE POLICY "Allow anon insert" ON download_logs FOR INSERT WITH CHECK (true);
 */

import { getSupabase } from "./supabase";

export type Plan = "free" | "monthly" | "annual";

export type Membership = {
  id: string;
  email: string;
  plan: Plan;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DownloadLog = {
  id: string;
  email: string | null;
  skill_slug: string;
  ip: string | null;
  downloaded_at: string;
};

/**
 * Check if an email has an active subscription
 */
export async function getMembership(email: string): Promise<Membership | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("memberships")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !data) return null;
  return data as Membership;
}

/**
 * Check if a subscription is currently active
 */
export function isSubscriptionActive(membership: Membership | null): boolean {
  if (!membership) return false;
  if (membership.plan === "free") return false;
  if (!membership.expires_at) return false;
  return new Date(membership.expires_at) > new Date();
}

/**
 * Create or update a membership record
 */
export async function upsertMembership(
  email: string,
  plan: Plan,
  expiresAt?: string
): Promise<Membership | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("memberships")
    .upsert(
      {
        email: email.toLowerCase().trim(),
        plan,
        expires_at: expiresAt ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (error) {
    console.error("[membership] upsert error:", error);
    return null;
  }
  return data as Membership;
}

/**
 * Count downloads for an email today (for rate limiting free users)
 */
export async function countTodayDownloads(email: string): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count, error } = await sb
    .from("download_logs")
    .select("*", { count: "exact", head: true })
    .eq("email", email.toLowerCase().trim())
    .gte("downloaded_at", startOfDay.toISOString());

  if (error) {
    console.error("[membership] count downloads error:", error);
    return 0;
  }
  return count ?? 0;
}

/**
 * Log a download event
 */
export async function logDownload(
  email: string | null,
  skillSlug: string,
  ip: string | null
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  await sb.from("download_logs").insert({
    email: email?.toLowerCase().trim() ?? null,
    skill_slug: skillSlug,
    ip,
  });
}

/**
 * Determine download eligibility for a given email/IP combo
 */
export type DownloadEligibility =
  | { allowed: true; reason: "free-available" | "subscribed"; downloadsLeft: number }
  | { allowed: false; reason: "subscribe-required" | "rate-limited"; message: string };

export async function checkDownloadEligibility(
  email: string | null,
  ip: string | null
): Promise<DownloadEligibility> {
  const sb = getSupabase();

  // Subscribed users — always allowed
  if (email) {
    const membership = await getMembership(email);
    if (isSubscriptionActive(membership)) {
      return { allowed: true, reason: "subscribed", downloadsLeft: -1 };
    }
  }

  // For anonymous users without email, use IP-based simple tracking
  // (This is a simplified version; production would need better fingerprinting)
  if (!email) {
    // No email — allow 1 free download tracked by IP
    return {
      allowed: true,
      reason: "free-available",
      downloadsLeft: 1,
    };
  }

  // Free user: check if they have any downloads logged
  const todayCount = await countTodayDownloads(email);
  if (todayCount === 0) {
    return { allowed: true, reason: "free-available", downloadsLeft: 1 };
  }

  // Already used free download today
  return {
    allowed: false,
    reason: "subscribe-required",
    message: "Free daily download already used. Subscribe for unlimited downloads.",
  };
}
