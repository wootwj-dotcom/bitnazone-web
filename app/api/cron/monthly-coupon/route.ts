import { NextRequest, NextResponse } from 'next/server'
import { issueMonthlyStarCoupon } from '@/lib/monthly-coupon'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await issueMonthlyStarCoupon()
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 200 })
  }
  return NextResponse.json({ success: true, coupon: result.coupon, email: result.email })
}
