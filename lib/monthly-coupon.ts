import { supabaseAdmin } from './supabase-admin'

export async function issueMonthlyStarCoupon() {
  const now = new Date()
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)

  const { data: likes } = await supabaseAdmin
    .from('likes')
    .select('video_id')
    .gte('created_at', prevMonthStart.toISOString())
    .lt('created_at', prevMonthEnd.toISOString())

  if (!likes || likes.length === 0) {
    return { ok: false, message: '지난달 좋아요 없음' } as const
  }

  const videoIds = [...new Set(likes.map(l => l.video_id))]
  const { data: videos } = await supabaseAdmin
    .from('videos')
    .select('id, user_id')
    .in('id', videoIds)

  const videoUserMap = new Map(
    (videos ?? []).filter(v => v.user_id).map(v => [v.id, v.user_id as string])
  )
  const userLikeCount = new Map<string, number>()
  for (const like of likes) {
    const uid = videoUserMap.get(like.video_id)
    if (uid) userLikeCount.set(uid, (userLikeCount.get(uid) ?? 0) + 1)
  }

  if (userLikeCount.size === 0) {
    return { ok: false, message: '매핑 가능한 사용자 없음' } as const
  }

  const [topUid] = Array.from(userLikeCount.entries()).sort((a, b) => b[1] - a[1])[0]

  const { data: authData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(topUid)
  if (userErr || !authData.user?.email) {
    return { ok: false, message: '이메일을 찾을 수 없습니다' } as const
  }

  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase()
  const year = prevMonthStart.getFullYear()
  const month = String(prevMonthStart.getMonth() + 1).padStart(2, '0')
  const code = `STAR-${year}-${month}-${suffix}`

  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .insert({ code, user_email: authData.user.email, minutes: 4, is_used: false })
    .select()
    .single()

  if (error) {
    return { ok: false, message: error.message } as const
  }

  return { ok: true, coupon, email: authData.user.email } as const
}
