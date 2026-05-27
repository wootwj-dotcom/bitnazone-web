/* eslint-disable */
// ============================================================
// 운영자 마스터 키 1개 발급 — code='TEST-ZIWON', batch='MASTER-KEY'
//
// 실행:  node scripts/seed-master-key.js
//
// 특성:
//   - 단 1개 (TEST-ZIWON) — 운영자 점검/iOS 테스트용
//   - 무한 재사용 (server.js MASTER-KEY 분기에서 is_used 처리 SKIP)
//   - 어느 시간/비율이든 통과 (server.js에서 minutes 시간 제약 우회)
//   - beta_counter 카운트 영향 0 (BETA-2026-05 50팀 통계와 완전 분리)
//
// 사전 조건:
//   - .env.local 에 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY 존재
//
// 멱등성: code='TEST-ZIWON' 이미 존재하면 SKIP 후 종료.
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

const CODE = 'TEST-ZIWON'
const BATCH = 'MASTER-KEY'
const PLACEHOLDER_EMAIL = 'master-key@bitnazone.com'
const MINUTES = 4 // fallback, server.js MASTER-KEY 분기에서 시간 제약 우회됨

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  console.log(`[SEED] 마스터 키 발급 시도 — code=${CODE}, batch=${BATCH}`)

  // 1. 이미 존재하는지 확인 (멱등성)
  const { data: existing, error: selErr } = await supabase
    .from('coupons')
    .select('id, code, batch, is_used')
    .eq('code', CODE)
    .limit(1)

  if (selErr) {
    console.error('[ERR] 기존 코드 조회 실패:', selErr.message)
    process.exit(1)
  }

  if (existing && existing.length > 0) {
    const row = existing[0]
    console.log(`[SKIP] 마스터 키 이미 존재 — code=${row.code}, batch=${row.batch}, is_used=${row.is_used}`)
    console.log('       (무한 재사용이므로 is_used 값은 무시됨 — server.js MASTER-KEY 분기 참고)')
    process.exit(0)
  }

  // 2. INSERT (beta_counter 는 절대 건드리지 않음)
  const { error: insErr } = await supabase.from('coupons').insert([
    {
      code: CODE,
      user_email: PLACEHOLDER_EMAIL,
      minutes: MINUTES,
      is_used: false,
      batch: BATCH,
      is_beta: true,
    },
  ])

  if (insErr) {
    console.error('[ERR] 마스터 키 insert 실패:', insErr.message)
    process.exit(1)
  }

  console.log(`\n[OK] 마스터 키 생성 완료`)
  console.log(`     code   = ${CODE}`)
  console.log(`     batch  = ${BATCH}`)
  console.log(`     minutes= ${MINUTES} (fallback — 실제로는 시간 제약 우회)`)
  console.log(`\n[NEXT] kono-recording 서버에서 MASTER-KEY 분기가 활성화되어 있어야 동작합니다.`)
}

main().catch(err => {
  console.error('[FATAL]', err)
  process.exit(1)
})
