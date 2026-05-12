import { createClient } from '@supabase/supabase-js'

export type Video = {
  id: string
  url: string
  channel: string
  platform: 'instagram' | 'youtube' | 'tiktok' | 'unknown'
  is_approved: boolean
  is_top10: boolean
  user_id?: string | null
  created_at: string
  like_count?: number
}

export type Profile = {
  id: string
  nickname: string
  nickname_changed_at: string | null
  created_at: string
}

export type Like = {
  id: string
  video_id: string
  user_id: string
  created_at: string
}

export type Comment = {
  id: string
  video_id: string
  user_id: string
  content: string
  created_at: string
}

export type Coupon = {
  id: string
  code: string
  user_email: string
  minutes: number
  is_used: boolean
  expires_at: string | null
  created_at: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function detectPlatform(url: string): Video['platform'] {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/instagram\.com/.test(url)) return 'instagram'
  if (/tiktok\.com/.test(url)) return 'tiktok'
  return 'unknown'
}

export function getYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}
