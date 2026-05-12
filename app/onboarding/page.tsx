'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const NICKNAME_RE = /^[가-힣a-zA-Z0-9]{2,10}$/

export default function OnboardingPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/'); return }
      const { data: profile } = await supabase
        .from('profiles').select('id').eq('id', data.user.id).maybeSingle()
      if (profile) { router.replace('/'); return }
      setUserId(data.user.id)
      setReady(true)
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nick = nickname.trim()
    if (!NICKNAME_RE.test(nick)) {
      setError('2~10자, 한글/영문/숫자만 사용 가능해요')
      return
    }
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { data: dup } = await supabase
      .from('profiles').select('id').eq('nickname', nick).maybeSingle()
    if (dup) {
      setError('이미 사용 중인 닉네임이에요')
      setSubmitting(false)
      return
    }

    const { error: insertErr } = await supabase
      .from('profiles').insert({ id: userId, nickname: nick })
    if (insertErr) {
      setError(insertErr.message.includes('unique') ? '이미 사용 중인 닉네임이에요' : '오류가 발생했어요')
      setSubmitting(false)
    } else {
      router.replace('/')
    }
  }

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-gray-400 text-sm">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4">
      <div className="max-w-[430px] w-full">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-2xl font-black mb-2" style={{ color: '#9B59B6' }}>
            Bitna Zone에 오신 걸 환영해요!
          </h1>
          <p className="text-sm text-gray-500">커뮤니티에서 사용할 닉네임을 설정해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              className="input-field text-center text-lg font-bold"
              placeholder="닉네임 입력"
              value={nickname}
              onChange={e => { setNickname(e.target.value); setError('') }}
              maxLength={10}
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              2~10자 · 한글 영문 숫자만
            </p>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={!nickname.trim() || submitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '설정 중...' : '시작하기 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}
