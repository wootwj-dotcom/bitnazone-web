'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">로딩 중...</div>}>
      <FeedbackInner />
    </Suspense>
  )
}

function FeedbackInner() {
  const params = useSearchParams()
  const code = (params.get('code') || '').toUpperCase()

  const [satisfaction, setSatisfaction] = useState<string>('')
  const [snsPlans, setSnsPlans] = useState<string[]>([])
  const [willReturn, setWillReturn] = useState<string>('')
  const [freeText, setFreeText] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!code) setErr('쿠폰 코드가 없습니다 (URL ?code=...)')
  }, [code])

  function toggleSns(v: string) {
    setSnsPlans(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])
  }

  async function submit() {
    setErr('')
    if (!satisfaction) { setErr('만족도를 선택해주세요'); return }
    if (snsPlans.length === 0) { setErr('SNS 계획을 선택해주세요'); return }
    if (!willReturn) { setErr('재촬영 의사를 선택해주세요'); return }
    if (!freeText.trim()) { setErr('자유 의견을 입력해주세요'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupon_code: code,
          satisfaction,
          sns_plans: snsPlans,
          will_return: willReturn,
          free_text: freeText,
          phone: phone.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || '제출 실패'); setSubmitting(false); return }
      setDone(true)
    } catch {
      setErr('네트워크 오류')
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="max-w-[430px] w-full text-center">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-xl font-black mb-3" style={{ color: '#9B59B6' }}>감사합니다!</h1>
          <p className="text-sm text-gray-600">빛나 Zone에 큰 도움이 됐어요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh px-4 py-8">
      <div className="max-w-[430px] mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-black mb-2" style={{ color: '#9B59B6' }}>
            📝 빛나 Zone 베타 피드백
          </h1>
          <p className="text-xs text-gray-400">쿠폰: <span className="font-mono">{code || '(없음)'}</span></p>
        </div>

        <Question label="1. 오늘 촬영 어떠셨어요?">
          <div className="grid grid-cols-4 gap-2">
            {[
              { v: 'great', e: '😍' },
              { v: 'good',  e: '😊' },
              { v: 'okay',  e: '😐' },
              { v: 'bad',   e: '😞' },
            ].map(o => (
              <button key={o.v}
                onClick={() => setSatisfaction(o.v)}
                className="aspect-square rounded-xl text-3xl border-2 transition"
                style={{
                  borderColor: satisfaction === o.v ? '#FF69B4' : '#E5E5E5',
                  background:  satisfaction === o.v ? 'rgba(255,105,180,0.08)' : '#fff',
                }}
              >{o.e}</button>
            ))}
          </div>
        </Question>

        <Question label="2. 이 영상 어디에 올리실 거예요?">
          <div className="space-y-2">
            {[
              { v: 'instagram', label: '인스타그램' },
              { v: 'tiktok',    label: '틱톡' },
              { v: 'youtube',   label: '유튜브 쇼츠' },
              { v: 'none',      label: '안 올릴 듯' },
            ].map(o => (
              <label key={o.v} className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer"
                style={{ borderColor: snsPlans.includes(o.v) ? '#FF69B4' : '#E5E5E5',
                         background:  snsPlans.includes(o.v) ? 'rgba(255,105,180,0.06)' : '#fff' }}>
                <input type="checkbox" checked={snsPlans.includes(o.v)} onChange={() => toggleSns(o.v)} />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
          </div>
        </Question>

        <Question label="3. 다음에 또 오시면 또 찍으실래요?">
          <div className="space-y-2">
            {[
              { v: 'definitely',    label: '무조건' },
              { v: 'maybe',         label: '아마도' },
              { v: 'probably_not',  label: '글쎄' },
              { v: 'no',            label: '아니요' },
            ].map(o => (
              <label key={o.v} className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer"
                style={{ borderColor: willReturn === o.v ? '#FF69B4' : '#E5E5E5',
                         background:  willReturn === o.v ? 'rgba(255,105,180,0.06)' : '#fff' }}>
                <input type="radio" name="will-return" checked={willReturn === o.v} onChange={() => setWillReturn(o.v)} />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
          </div>
        </Question>

        <Question label="4. 자유 의견">
          <textarea
            className="input-field text-sm"
            rows={4}
            placeholder="예: 음악 볼륨, 조명, 카메라 각도, 가격, 시간..."
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
          />
        </Question>

        <div className="p-4 rounded-xl" style={{ background: '#F4F4F2' }}>
          <p className="text-sm font-semibold mb-1">💝 좋은 의견 주신 3분께 쿠팡 1만원 상품권 보내드려요</p>
          <p className="text-xs text-gray-500 mb-3">받고 싶으시면 전화번호 입력 (선택)</p>
          <input
            type="tel"
            className="input-field text-sm"
            placeholder="010-0000-0000"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        {err && <p className="text-sm text-red-500 text-center">{err}</p>}

        <button
          onClick={submit}
          disabled={submitting || !code}
          className="btn-primary disabled:opacity-50"
        >
          {submitting ? '제출 중...' : '제출하기'}
        </button>
      </div>
    </div>
  )
}

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-bold mb-3 text-gray-800">{label}</p>
      {children}
    </div>
  )
}
