-- ============================================================
-- Beta 50팀 무료 촬영 시스템 (BETA-2026-05)
-- 실행: Supabase 콘솔 → SQL Editor 에 붙여넣고 1회 실행
-- 안전 가드: IF NOT EXISTS / ON CONFLICT DO NOTHING 로 멱등
-- ============================================================

-- ── 1. coupons 테이블 보강 ──
-- 기존 컬럼(code, user_email, minutes, is_used, expires_at, created_at) 유지.
-- batch / is_beta 마커만 추가. user_email 은 베타에서 placeholder 사용.
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS batch text,
  ADD COLUMN IF NOT EXISTS is_beta boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS coupons_batch_idx ON coupons (batch);
CREATE INDEX IF NOT EXISTS coupons_is_beta_idx ON coupons (is_beta);

-- ── 2. feedback 테이블 ──
CREATE TABLE IF NOT EXISTS feedback (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code   text REFERENCES coupons(code),
  satisfaction  text,                 -- great|good|okay|bad
  sns_plans     text[],               -- instagram|tiktok|youtube|none (다중)
  will_return   text,                 -- definitely|maybe|probably_not|no
  free_text     text,
  phone         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_coupon_code_idx ON feedback (coupon_code);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback (created_at DESC);

-- ── 3. beta_counter 테이블 (배치별 단일 row) ──
CREATE TABLE IF NOT EXISTS beta_counter (
  batch         text PRIMARY KEY,
  issued_count  int  NOT NULL DEFAULT 0,    -- 쿠폰 사용(소진) 누적
  max_count     int  NOT NULL DEFAULT 50,   -- 발급 상한
  used_count    int  NOT NULL DEFAULT 0,    -- 피드백 제출 누적
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- BETA-2026-05 배치 초기화 (이미 있으면 무시)
INSERT INTO beta_counter (batch, issued_count, max_count, used_count)
VALUES ('BETA-2026-05', 0, 50, 0)
ON CONFLICT (batch) DO NOTHING;

-- ── 4. RLS ──
-- feedback / beta_counter 는 service role 전용 (anon 차단)
ALTER TABLE feedback     ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_counter ENABLE ROW LEVEL SECURITY;
-- (정책 미생성 = anon/authenticated 모두 차단. service role 은 RLS 우회)
