import { COMPANY } from '@/lib/company'

const FEATURES = [
  {
    emoji: '🎬',
    title: '키오스크에서 녹화',
    desc: '빛나 QR로 결제 후 자유롭게 녹화',
  },
  {
    emoji: '📲',
    title: '워터마크 영상 다운로드',
    desc: "'made with Bitna' 워터마크와 함께 휴대폰으로 즉시 다운로드",
  },
  {
    emoji: '✨',
    title: 'SNS 공유 & 빛나 Zone 등록',
    desc: '#BitnaZone 태그로 공유하면 커뮤니티에 자동 노출',
  },
]

export default function HeroSection() {
  return (
    <section
      className="w-full px-4 py-10"
      style={{ background: 'linear-gradient(160deg, #fff5fb 0%, #f5f0ff 100%)' }}
    >
      <div className="max-w-[430px] mx-auto">

        {/* Headline */}
        <h1 className="font-black text-2xl leading-tight text-gray-800">
          {COMPANY.serviceNameEn}
          <span className="text-gray-400 font-normal"> — </span>
          셀프 크리에이터 존
        </h1>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          {COMPANY.slogan}<br />
          {COMPANY.sloganEn}
        </p>

        {/* Feature cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white border border-pink-100 p-4 shadow-sm"
            >
              <p className="text-2xl mb-2">{f.emoji}</p>
              <p className="font-bold text-sm text-gray-700">{f.title}</p>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col items-start gap-1">
          <button
            disabled
            className="px-5 py-2.5 rounded-full text-sm font-bold text-white cursor-not-allowed opacity-50"
            style={{ background: 'linear-gradient(135deg, #FF69B4, #9B59B6)' }}
          >
            가까운 빛나 Zone 찾기
          </button>
          <p className="text-xs text-gray-400">
            1호점 &apos;{COMPANY.firstStore.name}&apos;
          </p>
        </div>

      </div>
    </section>
  )
}
