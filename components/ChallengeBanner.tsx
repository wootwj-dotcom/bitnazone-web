'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function ChallengeBanner() {
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    createClient()
      .from('site_config')
      .select('value')
      .eq('key', 'challenge_banner')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setText(data.value)
      })
  }, [])

  if (!text) return null

  return (
    <div
      className="rounded-2xl px-4 py-3 mb-6 text-sm font-semibold text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(255,105,180,0.12), rgba(155,89,182,0.12))',
        color: '#9B59B6',
        border: '1px solid rgba(155,89,182,0.15)',
      }}
    >
      🎯 {text}
    </div>
  )
}
