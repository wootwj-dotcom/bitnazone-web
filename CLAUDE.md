# Bitna Zone 커뮤니티 사이트

## 프로젝트 개요
매장 키오스크(kono-recording 프로젝트)에서 손님이 촬영한 영상을 SNS에 올린 후,
bitnazone.com에 링크를 등록하면 커뮤니티 피드에 임베드로 노출되는 플랫폼.

- 브랜드: Bitna Zone ("찬란한 순간을 담는다 / Anyone can shine.")
- SNS: @bitnazone
- 도메인: bitnazone.com (Vercel 배포)
- 운영자: 비기술자 1인 운영

## 기술 스택
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL DB)
- Vercel 배포

## 디자인 시스템
- K-pop Pastel 무드
- 핑크 #FF69B4 / 보라 #9B59B6 / 골드 #FFD700
- 모바일 우선 (max-width 430px 기준)
- 카드형 레이아웃

## 페이지 구조
- `/` — 메인 피드 (Top 10 + 최신 영상, 하단 고정 등록 버튼)
- `/submit` — 영상 등록 폼 (URL + 채널명 + 동의 체크)
- `/admin` — 관리자 페이지 (비밀번호 게이트, 승인/Top10/삭제)

## Supabase
- DB: videos 테이블
- 컬럼: id(uuid), url(text), channel(text), platform(text),
        is_approved(bool), is_top10(bool), created_at(timestamp)
- 플랫폼 자동 감지: youtube / instagram / tiktok / unknown
- 등록된 영상은 is_approved=false 기본값 → 관리자 승인 후 노출

## 파일 구조
```
app/
  layout.tsx       - 폰트, 메타데이터, 글로벌 CSS
  globals.css      - Tailwind + 공통 컴포넌트 스타일
  page.tsx         - 메인 피드 (Server Component, revalidate 60s)
  submit/page.tsx  - 영상 등록 (Client Component)
  admin/page.tsx   - 관리자 (Client Component, 비밀번호 게이트)
components/
  VideoCard.tsx    - 영상 카드 (플랫폼 뱃지 포함)
  VideoEmbed.tsx   - 플랫폼별 임베드 (YouTube iframe / Instagram blockquote / TikTok blockquote)
lib/
  supabase.ts      - Supabase 클라이언트, Video 타입, detectPlatform, getYoutubeId
```

## 환경변수 (.env.local)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_ADMIN_PASSWORD

## 관련 프로젝트
- kono-recording: 키오스크 촬영 시스템 (Node.js + ffmpeg, Windows 미니PC 운영)
  - 손님이 촬영 완료 후 /complete.html에서 #BitnaZone 태그 안내
  - 두 프로젝트는 독립적으로 운영되며 브랜드만 공유
