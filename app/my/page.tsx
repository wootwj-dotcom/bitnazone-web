'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import type { Video, Profile } from '@/lib/supabase'

const NICKNAME_RE = /^[가-힣a-zA-Z0-9]{2,10}$/

const PLATFORM_LABEL: Record<string, string> = {
  youtube: '▶ YouTube',
  instagram: '📷 Instagram',
  tiktok: '♪ TikTok',
  unknown: '🔗 링크',
}

export default function MyPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myVideos, setMyVideos] = useState<Video[]>([])
  const [likedVideos, setLikedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  const [newNick, setNewNick] = useState('')
  const [nickError, setNickError] = useState('')
  const [nickSaving, setNickSaving] = useState(false)
  const [nickChanged, setNickChanged] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/'); return }

      setUserId(data.user.id)
      setEmail(data.user.email ?? '')

      const [profileRes, myVideosRes, likesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle(),
        supabase.from('videos').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }),
        supabase.from('likes').select('video_id').eq('user_id', data.user.id),
      ])

      if (!profileRes.data) { router.replace('/onboarding'); return }

      setProfile(profileRes.data as Profile)
      setMyVideos((myVideosRes.data ?? []) as Video[])

      const likedIds = (likesRes.data ?? []).map((l: { video_id: string }) => l.video_id)
      if (likedIds.length > 0) {
        const { data: liked } = await supabase.from('videos').select('*').in('id', likedIds)
        setLikedVideos((liked ?? []) as Video[])
      }

      setLoading(false)
    })
  }, [router])

  function cooldownStatus(): { ok: boolean; nextDate?: Date } {
    if (!profile?.nickname_changed_at) return { ok: true }
    const next = new Date(new Date(profile.nickname_changed_at).getTime() + 14 * 24 * 60 * 60 * 1000)
    return next <= new Date() ? { ok: true } : { ok: false, nextDate: next }
  }

  async function saveNickname() {
    const nick = newNick.trim()
    if (!NICKNAME_RE.test(nick)) { setNickError('2~10자, 한글/영문/숫자만 사용 가능해요'); return }
    if (nick === profile?.nickname) { setNickError('현재 닉네임과 동일해요'); return }

    setNickSaving(true)
    setNickError('')
    const supabase = createClient()

    const { data: dup } = await supabase.from('profiles').select('id').eq('nickname', nick).maybeSingle()
    if (dup) { setNickError('이미 사용 중인 닉네임이에요'); setNickSaving(false); return }

    const now = new Date().toISOString()
    const { error } = await supabase.from('profiles')
      .update({ nickname: nick, nickname_changed_at: now })
      .eq('id', userId)

    if (error) {
      setNickError('오류가 발생했어요')
    } else {
      setProfile(p => p ? { ...p, nickname: nick, nickname_changed_at: now } : p)
      setNewNick('')
      setNickChanged(true)
      setTimeout(() => setNickChanged(false), 3000)
    }
    setNickSaving(false)
  }

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/')
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-gray-400 text-sm">로딩 중...</p>
      </div>
    )
  }

  const { ok: canChange, nextDate } = cooldownStatus()

  return (
    <div className="min-h-dvh px-4 py-10 pb-24">
      <div className="max-w-[430px] mx-auto">

        <Link href="/" className="text-sm text-gray-400 mb-6 block">← 돌아가기</Link>

        {/* 닉네임 헤더 */}
        <div className="text-center mb-8">
          <p className="text-3xl font-black mb-1" style={{ color: '#9B59B6' }}>
            @{profile?.nickname}
          </p>
          <p className="text-xs text-gray-400">{email}</p>
        </div>

        {/* 닉네임 변경 */}
        <section className="card mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">닉네임 변경</p>

          {nickChanged && (
            <p className="text-sm font-semibold mb-3" style={{ color: '#9B59B6' }}>
              ✅ 닉네임이 변경됐어요!
            </p>
          )}

          {!canChange ? (
            <p className="text-sm text-gray-500 leading-relaxed">
              닉네임은 2주에 한 번 변경 가능해요<br />
              <span className="text-xs" style={{ color: '#9B59B6' }}>
                변경 가능일:{' '}
                {nextDate?.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
              </span>
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1 text-sm"
                  placeholder="새 닉네임 입력"
                  value={newNick}
                  onChange={e => { setNewNick(e.target.value); setNickError('') }}
                  maxLength={10}
                />
                <button
                  onClick={saveNickname}
                  disabled={!newNick.trim() || nickSaving}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FF69B4, #9B59B6)' }}
                >
                  {nickSaving ? '...' : '확인'}
                </button>
              </div>
              {nickError && <p className="text-xs text-red-500">{nickError}</p>}
              <p className="text-xs text-gray-400">2~10자 · 한글 영문 숫자만</p>
            </div>
          )}
        </section>

        {/* 내가 등록한 영상 */}
        <section className="mb-6">
          <h2 className="section-title">📹 내가 등록한 영상 ({myVideos.length})</h2>
          {myVideos.length === 0 ? (
            <div className="card text-center py-6 text-gray-400 text-sm">
              아직 등록한 영상이 없어요
            </div>
          ) : (
            myVideos.map(v => (
              <div key={v.id} className="card mb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">@{v.channel}</p>
                    <a
                      href={v.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-500 underline truncate block"
                    >
                      {v.url.length > 45 ? v.url.slice(0, 45) + '...' : v.url}
                    </a>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(v.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                    style={{ background: 'rgba(255,105,180,0.1)', color: '#9B59B6' }}>
                    {PLATFORM_LABEL[v.platform] ?? '🔗'}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>

        {/* 좋아요한 영상 */}
        <section className="mb-8">
          <h2 className="section-title">❤️ 좋아요한 영상 ({likedVideos.length})</h2>
          {likedVideos.length === 0 ? (
            <div className="card text-center py-6 text-gray-400 text-sm">
              아직 좋아요한 영상이 없어요
            </div>
          ) : (
            likedVideos.map(v => (
              <div key={v.id} className="card mb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">@{v.channel}</p>
                    <a
                      href={v.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-500 underline truncate block"
                    >
                      {v.url.length > 45 ? v.url.slice(0, 45) + '...' : v.url}
                    </a>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                    style={{ background: 'rgba(255,105,180,0.1)', color: '#9B59B6' }}>
                    {PLATFORM_LABEL[v.platform] ?? '🔗'}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>

        {/* 로그아웃 */}
        <button
          onClick={signOut}
          className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 border"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}
        >
          로그아웃
        </button>

      </div>
    </div>
  )
}
