import { supabase, Video } from '@/lib/supabase'
import VideoCard from '@/components/VideoCard'
import VideoFeed from '@/components/VideoFeed'
import ChallengeBanner from '@/components/ChallengeBanner'
import MonthlyStarBanner from '@/components/MonthlyStarBanner'
import HeroSection from '@/components/HeroSection'

export const revalidate = 60

async function getTop10() {
  const [videosRes, likesRes] = await Promise.all([
    supabase.from('videos').select('*').eq('is_approved', true).order('created_at', { ascending: false }),
    supabase.from('likes').select('video_id'),
  ])

  const videos = (videosRes.data ?? []) as Video[]
  const likes = (likesRes.data ?? []) as { video_id: string }[]

  const likeCountMap = new Map<string, number>()
  for (const like of likes) {
    likeCountMap.set(like.video_id, (likeCountMap.get(like.video_id) ?? 0) + 1)
  }

  const top10 = videos
    .map(v => ({ ...v, like_count: likeCountMap.get(v.id) ?? 0 }))
    .filter(v => v.like_count > 0)
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 10)

  return top10
}

export default async function HomePage() {
  const top10 = await getTop10()

  return (
    <div className="min-h-dvh pb-28">
      <HeroSection />
      <div className="max-w-[430px] mx-auto px-4 pt-6">

        <ChallengeBanner />
        <MonthlyStarBanner />

        {top10.length > 0 && (
          <section className="mb-8">
            <h2 className="section-title">🏆 주간 Top 10</h2>
            {top10.map(v => <VideoCard key={v.id} video={v} />)}
          </section>
        )}

        <section>
          <h2 className="section-title">🌟 최신 영상</h2>
          <VideoFeed />
        </section>

      </div>
    </div>
  )
}
