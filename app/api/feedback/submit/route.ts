import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BETA_BATCH_DEFAULT = 'BETA-2026-05'

const SATISFACTION = new Set(['great', 'good', 'okay', 'bad'])
const SNS_PLANS = new Set(['instagram', 'tiktok', 'youtube', 'none'])
const WILL_RETURN = new Set(['definitely', 'maybe', 'probably_not', 'no'])

// CORS: kono.bitnazone.com 에서 직접 POST 할 수 있도록 허용 (서브도메인 간 cross-origin)
function withCors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return res
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return withCors(NextResponse.json({ error: 'invalid JSON' }, { status: 400 }))
  }

  const couponCode = String(body.coupon_code || body.couponCode || '').trim().toUpperCase()
  const satisfaction = String(body.satisfaction || '').trim()
  const snsPlansRaw = body.sns_plans ?? body.snsPlans
  const willReturn = String(body.will_return || body.willReturn || '').trim()
  const freeText = String(body.free_text ?? body.freeText ?? '').slice(0, 2000)
  const phone = body.phone ? String(body.phone).slice(0, 30) : null

  if (!couponCode) return withCors(NextResponse.json({ error: '쿠폰 코드 누락' }, { status: 400 }))
  if (!SATISFACTION.has(satisfaction)) return withCors(NextResponse.json({ error: '만족도 누락' }, { status: 400 }))
  if (!WILL_RETURN.has(willReturn))    return withCors(NextResponse.json({ error: '재촬영 의사 누락' }, { status: 400 }))

  const snsPlans = Array.isArray(snsPlansRaw)
    ? snsPlansRaw.map(s => String(s)).filter(s => SNS_PLANS.has(s))
    : []
  if (snsPlans.length === 0) return withCors(NextResponse.json({ error: 'SNS 계획 누락' }, { status: 400 }))

  // 쿠폰 유효성 (is_beta=true 만 허용)
  const { data: coupon, error: cErr } = await supabaseAdmin
    .from('coupons')
    .select('code, batch, is_beta')
    .eq('code', couponCode)
    .eq('is_beta', true)
    .maybeSingle()

  if (cErr) return withCors(NextResponse.json({ error: cErr.message }, { status: 500 }))
  if (!coupon) return withCors(NextResponse.json({ error: '베타 쿠폰이 아닙니다' }, { status: 400 }))

  // 중복 제출 차단 (1쿠폰=1피드백)
  const { data: existing } = await supabaseAdmin
    .from('feedback')
    .select('id')
    .eq('coupon_code', couponCode)
    .maybeSingle()
  if (existing) {
    return withCors(NextResponse.json({ ok: true, already: true }))
  }

  const { error: insErr } = await supabaseAdmin
    .from('feedback')
    .insert({
      coupon_code: couponCode,
      satisfaction,
      sns_plans: snsPlans,
      will_return: willReturn,
      free_text: freeText || null,
      phone,
    })

  if (insErr) return withCors(NextResponse.json({ error: insErr.message }, { status: 500 }))

  // beta_counter.used_count += 1 (RPC 없으면 read-modify-write — 동시성 약하지만 통계 용도라 허용)
  const batch = coupon.batch || BETA_BATCH_DEFAULT
  const { data: counterRow } = await supabaseAdmin
    .from('beta_counter')
    .select('used_count')
    .eq('batch', batch)
    .maybeSingle()
  if (counterRow) {
    await supabaseAdmin
      .from('beta_counter')
      .update({ used_count: (counterRow.used_count || 0) + 1 })
      .eq('batch', batch)
  }

  return withCors(NextResponse.json({ ok: true }))
}
