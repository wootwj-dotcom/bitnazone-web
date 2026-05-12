'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function MonthlyStarBanner() {
  const [star, setStar] = useState<string | null>(null)

  useEffect(() => {
    createClient()
      .from('site_config')
      .select('value')
      .eq('key', 'monthly_star')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setStar(data.value)
      })
  }, [])

  if (!star) return null

  return (
    <div
      className="rounded-2xl px-4 py-3 mb-6 text-sm font-semibold text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,105,180,0.1))',
        color: '#b8860b',
        border: '1px solid rgba(255,215,0,0.3)',
      }}
    >
      🌟 이달의 스타: <span className="font-black">@{star}</span>
    </div>
  )
}
