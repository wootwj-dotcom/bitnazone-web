import VideoEmbed from './VideoEmbed'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'
import { Video } from '@/lib/supabase'

const PLATFORM_BADGE: Record<string, string> = {
  youtube: '▶ YouTube',
  instagram: '📷 Instagram',
  tiktok: '♪ TikTok',
  unknown: '🔗 링크',
}

export default function VideoCard({ video }: { video: Video }) {
  return (
    <div className="card mb-4">
      <VideoEmbed video={video} />
      <div className="flex items-center justify-between mt-3 mb-2">
        <span className="text-sm font-semibold text-gray-700">@{video.channel}</span>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: 'rgba(255,105,180,0.1)', color: '#9B59B6' }}
        >
          {PLATFORM_BADGE[video.platform] ?? '🔗'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <LikeButton videoId={video.id} />
        <CommentSection videoId={video.id} />
      </div>
    </div>
  )
}
