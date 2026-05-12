'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { detectPlatform, Video } from '@/lib/supabase'

type Platform = Video['platform']

const PLATFORM_BTNS: { id: Platform; label: string }[] = [
  { id: 'instagram', label: '인스타 📷' },
  { id: 'tiktok', label: '틱톡 🎵' },
  { id: 'youtube', label: '유튜브 🎬' },
]

export default function SubmitPage() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined)
  const [url, setUrl] = useState('')
  const [channel, setChannel] = useState('')
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  function handleUrlChange(val: string) {
    setUrl(val)
    const detected = detectPlatform(val)
    if (detected !== 'unknown') setPlatform(detected)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || !channel.trim() || !agreed || !userId) return

    setStatus('loading')
    setErrorMsg('')

    const cleanChannel = channel.trim().replace(/^@/, '')

    const { error } = await createClient().from('videos').insert({
      url: url.trim(),
      channel: cleanChannel,
      platform,
      user_id: userId,
      is_approved: true,
      is_top10: false,
    })

    if (error) {
      setErrorMsg('등록 중 오류가 발생했어요. 다시 시도해주세요.')
      setStatus('error')
    } else {
      setStatus('done')
    }
  }

  if (userId === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-gray-400 text-sm">로딩 중...</p>
      </div>
    )
  }

  if (userId === null) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4">
        <div className="max-w-[430px] w-full text-center">
          <div className="text-5xl mb-4">🔑</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#9B59B6' }}>로그인이 필요해요</h2>
          <p className="text-sm text-gray-500 mb-8">영상 등록은 구글 로그인 후 이용 가능합니다</p>
          <button
            onClick={() =>
              createClient().auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${location.origin}/auth/callback?next=/submit` },
              })
            }
            className="btn-primary"
          >
            🔑 구글로 로그인하기
          </button>
          <Link href="/" className="block mt-4 text-sm text-gray-400 underline">
            ← 피드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4">
        <div className="max-w-[430px] w-full text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#9B59B6' }}>등록 완료!</h2>
          <p className="text-sm text-gray-500 mb-8">피드에 바로 노출됩니다</p>
          <Link href="/">
            <button className="btn-primary">← 피드로 돌아가기</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh px-4 py-10">
      <div className="max-w-[430px] mx-auto">

        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-400 mb-4 block">← 돌아가기</Link>
          <h1 className="text-xl font-black mb-1" style={{ color: '#9B59B6' }}>
            내 영상을 Bitna Zone에 등록하세요!
          </h1>
          <p className="text-sm text-gray-500">등록 즉시 커뮤니티 피드에 노출됩니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 플랫폼 선택 */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              플랫폼
            </label>
            <div className="flex gap-2">
              {PLATFORM_BTNS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                  style={
                    platform === p.id
                      ? { borderColor: '#9B59B6', background: 'rgba(155,89,182,0.08)', color: '#9B59B6' }
                      : { borderColor: 'rgba(0,0,0,0.08)', color: '#9ca3af', background: 'white' }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* URL 입력 */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              SNS 영상 링크
            </label>
            <input
              type="url"
              className="input-field"
              placeholder="https://www.instagram.com/reel/..."
              value={url}
              onChange={e => handleUrlChange(e.target.value)}
              required
            />
            {url && detectPlatform(url) !== 'unknown' && detectPlatform(url) !== platform && (
              <p className="text-xs mt-1 text-orange-400">
                URL에서 {detectPlatform(url)} 감지됨 → 플랫폼이 자동 변경되었어요
              </p>
            )}
          </div>

          {/* 채널 @아이디 */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              채널 @아이디
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="@bitnazone"
              value={channel}
              onChange={e => setChannel(e.target.value)}
              required
            />
          </div>

          {/* 동의 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-pink-400 flex-shrink-0"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              required
            />
            <span className="text-sm text-gray-600">
              Bitna Zone 사이트 노출에 동의합니다 <span className="text-pink-500">(필수)</span>
            </span>
          </label>

          {status === 'error' && (
            <p className="text-sm text-red-500">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!url || !channel || !agreed || status === 'loading'}
          >
            {status === 'loading' ? '등록 중...' : '등록하기'}
          </button>

        </form>
      </div>
    </div>
  )
}
