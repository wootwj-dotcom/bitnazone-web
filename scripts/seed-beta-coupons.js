/* eslint-disable */
// ============================================================
// 베타 50팀 무료 쿠폰 일괄 생성 — BETA-XXXX 형식 (XXXX = 영문대문자+숫자 4자리)
//
// 실행:  node scripts/seed-beta-coupons.js
//
// 사전 조건:
//   - supabase/migrations/20260526_beta_50.sql 을 Supabase 콘솔에서 먼저 실행
//   - .env.local 에 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY 존재
//
// 멱등성: BETA-2026-05 배치에 이미 50개 있으면 종료(중복 발급 안 함).
// ============================================================

const fs = require('fs')
const path = require('path')

// ── .env.local 수동 로드 (dotenv 의존성 없이) ──
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line)
    if (!m) continue
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[ERR] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 없습니다.')
  process.exit(1)
}

const BATCH = 'BETA-2026-05'
const COUNT = 50
const PLACEHOLDER_EMAIL = 'beta-2026-05@bitnazone.com'
// 'O','0','I','1' 등 시각적 혼동 문자 제외 — 손님이 손으로 입력하기 좋게.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function randomSuffix() {
  let s = ''
  for (let i = 0; i < 4; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return s
}

async function generateUniqueCodes(n) {
  const codes = new Set()
  // 충분히 빨리 unique 50개 모이도록 set 으로 수집
  while (codes.size < n) {
    codes.add(`BETA-${randomSuffix()}`)
  }
  const arr = Array.from(codes)
  // DB 충돌 방지 차원에서 한번 더 검사 (이전 실행 잔여 등)
  const { data: existing, error } = await supabase
    .from('coupons')
    .select('code')
    .in('code', arr)
  if (error) {
    console.error('[ERR] 기존 코드 조회 실패:', error.message)
    process.exit(1)
  }
  const existingSet = new Set((existing || []).map(r => r.code))
  const filtered = arr.filter(c => !existingSet.has(c))
  // 충돌난 만큼 추가 생성
  while (filtered.length < n) {
    const c = `BETA-${randomSuffix()}`
    if (!existingSet.has(c) && !filtered.includes(c)) filtered.push(c)
  }
  return filtered.slice(0, n)
}

async function main() {
  console.log(`[SEED] 배치=${BATCH}, 목표=${COUNT}개`)

  // 1. 이미 발급된 베타 쿠폰 수 확인
  const { count: existingCount, error: countErr } = await supabase
    .from('coupons')
    .select('id', { count: 'exact', head: true })
    .eq('batch', BATCH)
    .eq('is_beta', true)

  if (countErr) {
    console.error('[ERR] 기존 베타 쿠폰 수 조회 실패:', countErr.message)
    process.exit(1)
  }

  if ((existingCount || 0) >= COUNT) {
    console.log(`[SKIP] 이미 ${existingCount}개 발급됨 — 추가 생성 안 함`)
    const { data: all } = await supabase
      .from('coupons')
      .select('code')
      .eq('batch', BATCH)
      .order('created_at', { ascending: true })
    console.log('\n── 기존 ' + BATCH + ' 쿠폰 코드 ' + (all?.length || 0) + '개 ──')
    ;(all || []).forEach(r => console.log(r.code))
    process.exit(0)
  }

  const need = COUNT - (existingCount || 0)
  console.log(`[SEED] 기존 ${existingCount || 0}개 — 추가 ${need}개 생성`)

  const codes = await generateUniqueCodes(need)
  const rows = codes.map(code => ({
    code,
    user_email: PLACEHOLDER_EMAIL,
    minutes: 2,
    is_used: false,
    batch: BATCH,
    is_beta: true,
  }))

  const { error: insErr } = await supabase.from('coupons').insert(rows)
  if (insErr) {
    console.error('[ERR] 쿠폰 insert 실패:', insErr.message)
    process.exit(1)
  }

  // beta_counter row 보장 (migration 에서 생성됐어야 하지만 안전망)
  await supabase
    .from('beta_counter')
    .upsert({ batch: BATCH, max_count: COUNT }, { onConflict: 'batch' })

  console.log(`\n[OK] ${codes.length}개 쿠폰 생성 완료\n`)
  console.log('── 발급된 코드 ──')
  codes.forEach(c => console.log(c))
  console.log(`\n[NEXT] /admin/beta-print 에서 인쇄`)
}

main().catch(err => {
  console.error('[FATAL]', err)
  process.exit(1)
})
