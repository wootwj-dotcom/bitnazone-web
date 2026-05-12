'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function signIn() {
    createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=${location.pathname}` },
    })
  }

  async function signOut() {
    await createClient().auth.signOut()
  }

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #FF69B4, #9B59B6)' }}
      >
        🔑 구글 로그인
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/my"
        className="text-xs font-semibold px-2.5 py-1.5 rounded-full"
        style={{ background: 'rgba(155,89,182,0.1)', color: '#9B59B6' }}
      >
        MY
      </Link>
      <button
        onClick={signOut}
        className="text-xs px-2.5 py-1.5 rounded-full text-gray-400 border"
        style={{ borderColor: 'rgba(0,0,0,0.1)' }}
      >
        로그아웃
      </button>
    </div>
  )
}
