# Bitna Zone 커뮤니티 사이트

## 1. 프로젝트 개요

매장 키오스크(kono-recording 프로젝트)에서 손님이 촬영한 영상을 SNS에 올린 후,
bitnazone.com에 링크를 등록하면 커뮤니티 피드에 임베드로 노출되는 플랫폼.

- 브랜드: Bitna Zone
- 한국어 슬로건: 찬란한 순간을 담는다
- 영문 슬로건: This moment, you're radiant.
- SNS: @bitnazone
- 도메인: bitnazone.com (Vercel 배포)
- 운영자: 비기술자 1인 운영 (Claude Code 의존도 매우 높음)

## 2. 회사 / 사업자 정보

- 법인명: 빛나크리에이티브
- 대표자: 우지원
- 사업자등록번호: 394-01-04418
- 사업장 주소: 충청남도 천안시 동남구 풍세로 694, 201호 S63 (구룡동, 구룡빌딩)
- 대표 전화: 010-5134-3771
- 대표 이메일: wootwj@gmail.com
- 통신판매업 신고번호: 기입예정 (천안시 동남구청 신청 진행 중)
- 업태: 정보통신업 / 종목: 응용 소프트웨어 개발 및 공급업 (일반과세자)
- 모든 사업자 정보는 `lib/company.ts` 의 COMPANY 상수에서 참조 — 하드코딩 금지
- 통신판매업 번호 발급 시 `lib/company.ts` 의 `ecommerceLicense` 1줄만 교체

## 3. Bitna Zone 1호점

- 매장명: 아이러브코인노래연습장 영등포구청점
- 위치: 서울 영등포구청 근처
- 분류: Bitna Sing (코인노래방 큰방)
- 상태: 오픈 준비 중 (베타 진행)

## 4. 브랜드 표기 정책 (반드시 준수)

한국 시장 표기 정책 — 단독 "빛나존" 사용 금지 (한국어 비속어 "존나" 연상).

| 용도 | 표기 |
|------|------|
| 로고 / 헤더 / 헤로 타이틀 | **Bitna Zone** (영문) |
| 본문 / 설명 텍스트 | **빛나 Zone** (한+영 혼용) |
| 해시태그 | **#BitnaZone** (SNS 검색 최적화) |
| 약관 / 법적 문서 | **빛나 Zone (Bitna Zone)** (첫 등장 시 풀네임) |
| 영문 단독 사용 | **Bitna Zone** 풀네임 (Bitna 단독은 비트코인 연상 회피) |

## 5. 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL DB)
- Vercel 배포 (git push → 자동 배포)

## 6. 디자인 시스템

- K-pop Pastel 무드
- 핑크 #FF69B4 / 보라 #9B59B6 / 골드 #FFD700
- 모바일 우선 (max-width 430px 기준)
- 카드형 레이아웃

## 7. 페이지 구조

- `/` — 메인 피드 (Hero 섹션 + Top 10 + 최신 영상 + 하단 고정 등록 버튼)
- `/submit` — 영상 등록 폼 (URL + 채널명 + 동의 체크)
- `/admin` — 관리자 페이지 (비밀번호 게이트, 승인/Top10/삭제)
- `/terms` — 이용약관 (12개 조항)
- `/privacy` — 개인정보처리방침 (10개 항목)
- `/refund` — 환불정책 (5개 항목)

## 8. Supabase

- DB: videos 테이블
- 컬럼: id(uuid), url(text), channel(text), platform(text),
        is_approved(bool), is_top10(bool), created_at(timestamp)
- 플랫폼 자동 감지: youtube / instagram / tiktok / unknown
- 등록된 영상은 is_approved=false 기본값 → 관리자 승인 후 노출

## 9. 파일 구조

```
app/
  layout.tsx           - 폰트, 메타데이터, 글로벌 CSS, Footer 포함
  globals.css          - Tailwind + 공통 컴포넌트 스타일
  page.tsx             - 메인 피드 (Server Component, HeroSection 포함)
  submit/page.tsx      - 영상 등록 (Client Component)
  admin/page.tsx       - 관리자 (Client Component, 비밀번호 게이트)
  terms/page.tsx       - 이용약관 (신규)
  privacy/page.tsx     - 개인정보처리방침 (신규)
  refund/page.tsx      - 환불정책 (신규)
components/
  VideoCard.tsx        - 영상 카드 (플랫폼 뱃지 포함)
  VideoEmbed.tsx       - 플랫폼별 임베드
  Footer.tsx           - 사업자 정보 + 법적 링크 (신규)
  HeroSection.tsx      - 메인 헤로 섹션, 3카드 + CTA (신규)
lib/
  supabase.ts          - Supabase 클라이언트, Video 타입, detectPlatform
  supabase-admin.ts    - Admin 클라이언트 (SUPABASE_SERVICE_ROLE_KEY)
  company.ts           - 사업자 정보 단일 진실 공급원 (신규)
  monthly-coupon.ts    - 월별 스타 쿠폰 자동 발급 로직
```

## 10. 환경 변수 (.env.local)

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_ADMIN_PASSWORD
- SUPABASE_SERVICE_ROLE_KEY (Vercel에만 있음, 로컬엔 없을 수 있음)

## 11. 자율 복구 워크플로우 (반드시 적용)

모든 코드 변경 작업은 다음 루프를 자동 진행한다. 사용자 승인 없이 진행.

### 빌드/배포 자율 루프
1. 코드 변경 후 반드시 `npm run build` 실행
2. 빌드 실패 시:
   - 에러 로그 분석 (TypeScript/import/lint/의존성)
   - 원인 진단 후 수정
   - 다시 `npm run build`
   - 최대 3회까지 자동 시도
3. 빌드 성공 시에만 `git add` → `git commit` → `git push` 진행
4. push 후 1~2분 대기 → 다음 URL 응답 확인:
   - https://bitnazone.com
   - https://bitnazone.com/terms
   - https://bitnazone.com/privacy
   - https://bitnazone.com/refund
5. Vercel 배포 실패 시 (Vercel CLI 가능 시 `vercel logs`로 확인):
   - 위 2번 루프 재실행
6. 모든 URL 200 응답 + 키워드 grep 통과 시 작업 완료

### 자율 권한 (사용자 승인 없이 진행 가능)
- 코드 수정, 재빌드, git push, 캐시 확인
- 환경변수 placeholder fallback 추가 (빌드 타임 크래시 방지)
- 단순 lint/format 수정

### 반드시 사용자에게 보고하고 멈춤
- 같은 에러 3회 연속 수정 실패
- 데이터베이스 스키마 변경 필요
- 외부 서비스(Supabase, Cloudflare, Toss) 설정 변경 필요
- 의존성 패키지 신규 추가 필요
- 기존 컴포넌트 로직 변경 필요 (Header, Feed, LikeButton, CommentBox 등)
- .env 또는 환경변수 신규 추가 필요

## 12. 코드 수정 원칙

- **기존 변수명/함수명/파일명 변경 금지.** UI 텍스트만 바꾸고 코드 구조는 유지.
- **Cloudflare Tunnel 관련 설정 절대 건드리지 말 것** (kono.bitnazone.com 영향).
- **Supabase 스키마, RLS 정책 절대 건드리지 말 것**.
- **Google OAuth 설정, .env 파일 절대 건드리지 말 것**.
- **package.json 의존성 추가 금지** (현재 설치된 것만 사용).
- **다국어 (i18n) 구조 변경 금지** — 한국어만.

## 13. 보고 형식

작업 완료/중단 시 다음을 한 메시지로 보고:
- 최종 상태 (✅완료 / ⚠️부분완료 / ❌중단)
- 변경/생성된 파일 목록 (경로 포함)
- 시도한 수정 내역 (실패 포함)
- 확인된 URL 응답 코드
- 추천 git commit 메시지
- 다음 단계 권장사항

## 14. 관련 프로젝트

- **kono-recording**: 키오스크 촬영 시스템 (Node.js + ffmpeg, Windows 미니PC 운영)
  - 손님이 촬영 완료 후 /complete.html에서 #BitnaZone 태그 안내
  - 두 프로젝트는 독립적으로 운영되며 브랜드 표기 정책만 공유