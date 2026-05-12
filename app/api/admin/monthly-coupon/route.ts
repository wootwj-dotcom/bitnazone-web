import { NextRequest, NextResponse } from 'next/server'
import { issueMonthlyStarCoupon } from '@/lib/monthly-coupon'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== (process.env.ADMIN_PASSWORD || 'bitnazone2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await issueMonthlyStarCoupon()
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 200 })
  }
  return NextResponse.json({ success: true, coupon: result.coupon, email: result.email })
}
