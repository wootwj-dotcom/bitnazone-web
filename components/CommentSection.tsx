'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type CommentRow = {
  id: string
  content: string
  created_at: string
  user_id: string
}

export default function CommentSection({ videoId }: { videoId: string }) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [nicknameMap, setNicknameMap] = useState<Map<string, string>>(new Map())
  const [count, setCount] = useState(0)
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [myNickname, setMyNickname] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('comments').select('*', { count: 'exact', head: true })
      .eq('video_id', videoId).then(({ count: c }) => setCount(c ?? 0))
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('nickname').eq('id', user.id).maybeSingle()
      if (data) setMyNickname(data.nickname)
    })
  }, [videoId])

  async function loadComments() {
    const supabase = createClient()
    const { data } = await supabase.from('comments').select('*')
      .eq('video_id', videoId).order('created_at', { ascending: false }).limit(20)
    const rows = (data ?? []) as CommentRow[]
    setComments(rows)

    const ids = Array.from(new Set(rows.map(r => r.user_id)))
    if (ids.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, nickname').in('id', ids)
      setNicknameMap(new Map((profiles ?? []).map(p => [p.id, p.nickname])))
    }
  }

  function toggle() {
    if (!open) loadComments()
    setOpen(o => !o)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !userId) return
    setSubmitting(true)
    const { data } = await createClient().from('comments')
      .insert({ video_id: videoId, user_id: userId, content: input.trim() })
      .select().single()
    if (data) {
      setComments(c => [data, ...c])
      setCount(c => c + 1)
      setInput('')
      if (myNickname) setNicknameMap(m => new Map(m).set(userId, myNickname))
    }
    setSubmitting(false)
  }

  async function remove(id: string) {
    await createClient().from('comments').delete().eq('id', id)
    setComments(c => c.filter(x => x.id !== id))
    setCount(c => Math.max(0, c - 1))
  }

  return (
    <div>
      <button
        onClick={toggle}
        className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full"
        style={{ background: open ? 'rgba(155,89,182,0.1)' : 'rgba(0,0,0,0.04)', color: open ? '#9B59B6' : '#9ca3af' }}
      >
        💬 <span>{count > 0 ? count : ''}</span>
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(155,89,182,0.1)' }}>
          {userId ? (
            <form onSubmit={submit} className="flex gap-2 mb-3">
              <input
                className="input-field flex-1 py-2 text-sm"
                placeholder="댓글 남기기..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={!input.trim() || submitting}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FF69B4, #9B59B6)' }}
              >
                등록
              </button>
            </form>
          ) : (
            <button
              onClick={() => createClient().auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${location.origin}/auth/callback?next=${location.pathname}` },
              })}
              className="w-full text-sm py-2.5 rounded-xl mb-3 font-medium"
              style={{ background: 'rgba(255,105,180,0.08)', color: '#FF69B4' }}
            >
              🔑 구글 로그인 후 댓글 작성 가능
            </button>
          )}

          {comments.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">첫 댓글을 남겨보세요!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex items-start justify-between gap-2 py-2">
                <div className="min-w-0">
                  <span className="text-xs font-semibold mr-2" style={{ color: '#9B59B6' }}>
                    @{nicknameMap.get(c.user_id) ?? (c.user_id === userId ? myNickname ?? '나' : '익명')}
                  </span>
                  <span className="text-sm text-gray-700">{c.content}</span>
                </div>
                {c.user_id === userId && (
                  <button onClick={() => remove(c.id)} className="text-xs text-gray-300 flex-shrink-0 hover:text-red-300">✕</button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
