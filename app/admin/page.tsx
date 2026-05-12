'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Video, Coupon } from '@/lib/supabase'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (pw === 'bitnazone2026') {
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  if (!authed) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="max-w-[380px] w-full">
          <h1 className="text-xl font-black mb-6 text-center" style={{ color: '#9B59B6' }}>
            🔐 Bitna Zone 관리자
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              className="input-field"
              placeholder="관리자 비밀번호"
              value={pw}
              onChange={e => setPw(e.target.value)}
              autoFocus
            />
            {pwError && <p className="text-sm text-red-500">비밀번호가 틀렸습니다.</p>}
            <button type="submit" className="btn-primary">로그인</button>
          </form>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [monthlyStar, setMonthlyStar] = useState<{ channel: string; count: number } | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [couponEmail, setCouponEmail] = useState('')
  const [couponMinutes, setCouponMinutes] = useState(2)
  const [couponLoading, setCouponLoading] = useState(false)
  const [challengeText, setChallengeText] = useState('')
  const [challengeSaving, setChallengeSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [cronLoading, setCronLoading] = useState(false)
  const [cronMsg, setCronMsg] = useState('')

  const supabase = createClient()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [videosRes, likesRes, configRes, couponsRes] = await Promise.all([
      supabase.from('videos').select('*').eq('is_approved', true).order('created_at', { ascending: false }),
      supabase.from('likes').select('video_id, created_at'),
      supabase.from('site_config').select('key, value'),
      supabase.from('coupons').select('*').order('created_at', { ascending: false }).limit(50),
    ])

    const allVideos = (videosRes.data ?? []) as Video[]
    setVideos(allVideos)
    setCoupons((couponsRes.data ?? []) as Coupon[])

    const config = configRes.data ?? []
    const banner = config.find(c => c.key === 'challenge_banner')
    if (banner) setChallengeText(banner.value)

    // Monthly Star: count likes this month per channel
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const thisMonthLikes = ((likesRes.data ?? []) as { video_id: string; created_at: string }[])
      .filter(l => l.created_at >= monthStart)

    const videoUserMap = new Map(
      allVideos.filter(v => v.user_id).map(v => [v.id, v.user_id!])
    )
    const userLikeCount = new Map<string, number>()
    for (const like of thisMonthLikes) {
      const uid = videoUserMap.get(like.video_id)
      if (uid) userLikeCount.set(uid, (userLikeCount.get(uid) ?? 0) + 1)
    }
    if (userLikeCount.size > 0) {
      const [topUid, topCount] = Array.from(userLikeCount.entries()).sort((a, b) => b[1] - a[1])[0]
      const { data: prof } = await supabase.from('profiles').select('nickname').eq('id', topUid).maybeSingle()
      setMonthlyStar({ channel: prof?.nickname ?? topUid.slice(0, 8), count: topCount })
    } else {
      setMonthlyStar(null)
    }

    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAll() }, [fetchAll])

  async function deleteVideo(id: string) {
    if (!confirm('정말 삭제할까요?')) return
    await supabase.from('videos').delete().eq('id', id)
    setVideos(v => v.filter(x => x.id !== id))
  }

  async function setStarInConfig(channel: string) {
    await supabase.from('site_config').upsert({ key: 'monthly_star', value: channel })
    alert(`@${channel} 을 이달의 스타로 설정했습니다!`)
  }

  async function generateCoupon() {
    if (!couponEmail.trim()) return
    setCouponLoading(true)
    const now = new Date()
    const suffix = Math.random().toString(36).substr(2, 4).toUpperCase()
    const code = `STAR-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${suffix}`
    const { data } = await supabase
      .from('coupons')
      .insert({ code, user_email: couponEmail.trim(), minutes: couponMinutes, is_used: false })
      .select()
      .single()
    if (data) {
      setCoupons(c => [data as Coupon, ...c])
      setCouponEmail('')
    }
    setCouponLoading(false)
  }

  async function triggerMonthlyCoupon() {
    setCronLoading(true)
    setCronMsg('')
    try {
      const res = await fetch('/api/admin/monthly-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'bitnazone2026' }),
      })
      const data = await res.json()
      if (data.success) {
        setCronMsg(`✅ ${data.email} 에 쿠폰 발급: ${data.coupon.code}`)
        fetchAll()
      } else {
        setCronMsg(`⚠️ ${data.message || data.error}`)
      }
    } catch {
      setCronMsg('오류가 발생했습니다')
    }
    setCronLoading(false)
    setTimeout(() => setCronMsg(''), 6000)
  }

  async function saveChallengeText() {
    setChallengeSaving(true)
    await supabase.from('site_config').upsert({ key: 'challenge_banner', value: challengeText })
    setSavedMsg('저장됨!')
    setChallengeSaving(false)
    setTimeout(() => setSavedMsg(''), 2000)
  }

  function mailtoLink(coupon: Coupon) {
    const subject = encodeURIComponent(`[Bitna Zone] 이달의 스타 무료 이용권 🎉`)
    const body = encodeURIComponent(
      `안녕하세요! Bitna Zone 이달의 스타로 선정되셨습니다 🌟\n\n무료 이용권 코드: ${coupon.code}\n이용 시간: ${coupon.minutes}분\n\n빛나존 포토부스 이용 시 코드를 입력해주세요.\nbitnazone.com`
    )
    return `mailto:${coupon.user_email}?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-dvh px-4 py-8">
      <div className="max-w-[430px] mx-auto space-y-10">

        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black" style={{ color: '#9B59B6' }}>Bitna Zone 관리자</h1>
          <button onClick={fetchAll} className="text-xs text-gray-400 underline">
            {loading ? '로딩 중...' : '새로고침'}
          </button>
        </div>

        {/* 주간 챌린지 배너 편집 */}
        <section>
          <h2 className="section-title">🎯 주간 챌린지 배너</h2>
          <div className="card space-y-3">
            <textarea
              className="input-field resize-none text-sm"
              rows={2}
              placeholder="이번 주 챌린지: #BitnaZone"
              value={challengeText}
              onChange={e => setChallengeText(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={saveChallengeText}
                disabled={challengeSaving}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #FF69B4, #9B59B6)' }}
              >
                {challengeSaving ? '저장 중...' : '저장'}
              </button>
              {savedMsg && <span className="text-xs text-green-500">{savedMsg}</span>}
            </div>
          </div>
        </section>

        {/* 이달의 스타 */}
        <section>
          <h2 className="section-title">🌟 이달의 스타</h2>
          <div className="card">
            {monthlyStar ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">@{monthlyStar.channel}</p>
                  <p className="text-xs text-gray-400 mt-0.5">이번 달 좋아요 {monthlyStar.count}개</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => setStarInConfig(monthlyStar.channel)}
                    className="px-3 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FF69B4)' }}
                  >
                    스타 설정
                  </button>
                  <button
                    onClick={triggerMonthlyCoupon}
                    disabled={cronLoading}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #FF69B4, #9B59B6)' }}
                  >
                    {cronLoading ? '발급 중...' : '🎟 쿠폰 발급'}
                  </button>
                </div>
              </div>
            ) : (
                <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">이번 달 좋아요 데이터가 없습니다</p>
                <button
                  onClick={triggerMonthlyCoupon}
                  disabled={cronLoading}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #FF69B4, #9B59B6)' }}
                >
                  {cronLoading ? '발급 중...' : '🎟 지난달 쿠폰 발급'}
                </button>
              </div>
            )}
          {cronMsg && <p className="text-xs text-center mt-2" style={{ color: cronMsg.startsWith('✅') ? '#22c55e' : '#f59e0b' }}>{cronMsg}</p>}
          </div>
        </section>

        {/* 쿠폰 생성 */}
        <section>
          <h2 className="section-title">🎟 무료 이용권 쿠폰</h2>
          <div className="card space-y-3 mb-4">
            <input
              type="email"
              className="input-field text-sm"
              placeholder="수신자 이메일"
              value={couponEmail}
              onChange={e => setCouponEmail(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <select
                className="input-field text-sm flex-1"
                value={couponMinutes}
                onChange={e => setCouponMinutes(Number(e.target.value))}
              >
                <option value={2}>2분</option>
                <option value={4}>4분</option>
              </select>
              <button
                onClick={generateCoupon}
                disabled={!couponEmail.trim() || couponLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FF69B4, #9B59B6)' }}
              >
                {couponLoading ? '생성 중...' : '쿠폰 생성'}
              </button>
            </div>
          </div>

          {coupons.length > 0 && (
            <div className="space-y-2">
              {coupons.map(coupon => (
                <div key={coupon.id} className="card flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-bold text-gray-700 truncate">{coupon.code}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {coupon.user_email} · {coupon.minutes}분 · {coupon.is_used ? '✅ 사용됨' : '미사용'}
                    </p>
                  </div>
                  <a
                    href={mailtoLink(coupon)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
                    style={{ background: 'rgba(255,105,180,0.1)', color: '#FF69B4' }}
                  >
                    메일 발송
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 영상 관리 */}
        <section>
          <h2 className="section-title">🎬 영상 관리 ({videos.length})</h2>
          {videos.length === 0 ? (
            <div className="card text-center py-6 text-gray-400 text-sm">등록된 영상 없음</div>
          ) : (
            videos.map(v => (
              <div key={v.id} className="card mb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">@{v.channel}</p>
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 underline truncate block"
                    >
                      {v.url.length > 40 ? v.url.slice(0, 40) + '...' : v.url}
                    </a>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {v.platform} · {new Date(v.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteVideo(v.id)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-400"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

      </div>
    </div>
  )
}
