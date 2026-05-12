'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function LikeButton({ videoId }: { videoId: string }) {
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('likes').select('*', { count: 'exact', head: true })
      .eq('video_id', videoId)
      .then(({ count: c }) => setCount(c ?? 0))

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      supabase.from('likes').select('id')
        .eq('video_id', videoId).eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => setLiked(!!data))
    })
  }, [videoId])

  async function toggle() {
    if (!userId) {
      createClient().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${location.origin}/auth/callback?next=${location.pathname}` },
      })
      return
    }
    if (loading) return
    setLoading(true)
    const supabase = createClient()
    if (liked) {
      await supabase.from('likes').delete().eq('video_id', videoId).eq('user_id', userId)
      setLiked(false)
      setCount(c => Math.max(0, c - 1))
    } else {
      await supabase.from('likes').insert({ video_id: videoId, user_id: userId })
      setLiked(true)
      setCount(c => c + 1)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full transition-all active:scale-95"
      style={{
        background: liked ? 'rgba(255,105,180,0.12)' : 'rgba(0,0,0,0.04)',
        color: liked ? '#FF69B4' : '#9ca3af',
      }}
    >
      {liked ? '❤️' : '🤍'} <span>{count > 0 ? count : ''}</span>
    </button>
  )
}
