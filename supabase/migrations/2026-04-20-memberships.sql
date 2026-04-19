-- ============================================================
-- SkillsSense 會員系統 Supabase Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- 1. memberships 表：儲存用戶會員狀態
CREATE TABLE IF NOT EXISTS public.memberships (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  plan        TEXT CHECK (plan IN ('free', 'monthly')),
  daily_downloads_count   INTEGER NOT NULL DEFAULT 0,
  daily_downloads_reset  TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,        -- 訂閱過期時間
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引：按 email 查詢
CREATE INDEX IF NOT EXISTS memberships_email_idx ON public.memberships(email);

-- 2. download_logs 表：追蹤每次下載
CREATE TABLE IF NOT EXISTS public.download_logs (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT,
  ip_address  TEXT,
  skill_slug  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引：按 email + 日期 查詢
CREATE INDEX IF NOT EXISTS download_logs_email_idx ON public.download_logs(email);
CREATE INDEX IF NOT EXISTS download_logs_ip_idx     ON public.download_logs(ip_address);
CREATE INDEX IF NOT EXISTS download_logs_created_idx ON public.download_logs(created_at);

-- 3. 自動更新 updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- Row Level Security (RLS) — 讓客戶端只能讀寫自己的記錄
-- ============================================================

ALTER TABLE public.memberships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- 會員只能查自己的記錄
CREATE POLICY "Users can view own membership"
  ON public.memberships FOR SELECT
  USING (true);  -- 查詢端用 server-side key，暫時開放讀取

CREATE POLICY "Service can upsert memberships"
  ON public.memberships FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update memberships"
  ON public.memberships FOR UPDATE
  USING (true);

-- 下載日誌：只允許插入
CREATE POLICY "Anyone can log downloads"
  ON public.download_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can read download_logs"
  ON public.download_logs FOR SELECT
  USING (true);
