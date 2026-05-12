'use client'

import { useEffect } from 'react'
import { Video, getYoutubeId } from '@/lib/supabase'

export default function VideoEmbed({ video }: { video: Video }) {
  useEffect(() => {
    if (video.platform === 'instagram') {
      // @ts-expect-error instagram embed script
      if (window.instgrm) window.instgrm.Embeds.process()
    }
    if (video.platform === 'tiktok') {
      const s = document.createElement('script')
      s.src = 'https://www.tiktok.com/embed.js'
      s.async = true
      document.body.appendChild(s)
    }
  }, [video])

  if (video.platform === 'youtube') {
    const videoId = getYoutubeId(video.url)
    if (!videoId) return <FallbackLink video={video} />
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full rounded-xl"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (video.platform === 'instagram') {
    return (
      <>
        <script async src="https://www.instagram.com/embed.js" />
        <blockquote
          className="instagram-media w-full rounded-xl overflow-hidden"
          data-instgrm-permalink={video.url}
          data-instgrm-version="14"
          style={{ minWidth: 0, width: '100%', maxWidth: '100%' }}
        />
      </>
    )
  }

  if (video.platform === 'tiktok') {
    const tiktokId = video.url.match(/video\/(\d+)/)?.[1]
    if (!tiktokId) return <FallbackLink video={video} />
    return (
      <div className="flex justify-center">
        <blockquote
          className="tiktok-embed rounded-xl overflow-hidden"
          cite={video.url}
          data-video-id={tiktokId}
          style={{ maxWidth: '100%', minWidth: 0 }}
        >
          <section />
        </blockquote>
      </div>
    )
  }

  return <FallbackLink video={video} />
}

function FallbackLink({ video }: { video: Video }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full py-6 text-center text-sm text-purple-600 underline rounded-xl bg-purple-50"
    >
      영상 보러가기 →
    </a>
  )
}
