'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import VideoCard from './VideoCard'
import Link from 'next/link'
import type { Video } from '@/lib/supabase'

type Tab = 'all' | 'social' | 'youtube'

const PAGE_SIZE = 4

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'social', label: '인스타·틱톡 📱' },
  { id: 'youtube', label: '유튜브 🎬' },
]

export default function VideoFeed() {
  const [tab, setTab] = useState<Tab>('social')
  const [videos, setVideos] = useState<Video[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Mutable ref to avoid stale closures in IntersectionObserver
  const m = useRef({ tab: 'social' as Tab, offset: 0, hasMore: true, loading: false })

  async function load(t: Tab, from: number, reset: boolean) {
    if (m.current.loading) return
    m.current.loading = true
    setLoading(true)

    let q = createClient()
      .from('videos')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (t === 'social') q = q.in('platform', ['instagram', 'tiktok'])
    else if (t === 'youtube') q = q.eq('platform', 'youtube')

    const { data } = await q

    // Discard if tab changed during fetch
    if (t !== m.current.tab) {
      m.current.loading = false
      setLoading(false)
      return
    }

    const rows = (data ?? []) as Video[]
    const more = rows.length === PAGE_SIZE
    m.current.hasMore = more
    m.current.offset = from + rows.length
    m.current.loading = false

    setHasMore(more)
    setVideos(prev => reset ? rows : [...prev, ...rows])
    setLoading(false)
  }

  function switchTab(t: Tab) {
    if (t === m.current.tab) return
    m.current.tab = t
    m.current.offset = 0
    m.current.hasMore = true
    setTab(t)
    setVideos([])
    setHasMore(true)
    load(t, 0, true)
  }

  // Initial load + IntersectionObserver (runs once)
  useEffect(() => {
    load('social', 0, true)

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && m.current.hasMore && !m.current.loading) {
          load(m.current.tab, m.current.offset, false)
        }
      },
      { rootMargin: '400px' }
    )

    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* 탭 */}
      <div
        className="flex gap-1 mb-5 p-1 rounded-2xl"
        style={{ background: 'rgba(0,0,0,0.04)' }}
      >
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={
              tab === t.id
                ? { background: 'white', color: '#9B59B6', boxShadow: '0 1px 4px rgba(155,89,182,0.2)' }
                : { color: '#9ca3af' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 영상 목록 */}
      {videos.length === 0 && !loading ? (
        <div className="card text-center py-10 text-gray-400 text-sm">
          아직 등록된 영상이 없어요.<br />첫 번째로 등록해보세요!
        </div>
      ) : (
        videos.map(v => <VideoCard key={v.id} video={v} />)
      )}

      {/* 무한스크롤 센티널 */}
      <div ref={sentinelRef} className="h-2" />

      {loading && (
        <div className="text-center py-6 text-sm text-gray-400">로딩 중...</div>
      )}
      {!hasMore && videos.length > 0 && (
        <div className="text-center py-6 text-sm text-gray-300">모든 영상을 봤어요 ✨</div>
      )}

      {/* 하단 고정 등록 버튼 */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 z-40"
        style={{ background: 'linear-gradient(to top, rgba(255,245,251,0.98) 70%, transparent)' }}
      >
        <div className="max-w-[430px] mx-auto">
          <Link href="/submit">
            <button className="btn-primary">✨ 내 영상 등록하기</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
