import Link from 'next/link'
import { COMPANY } from '@/lib/company'

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 bg-gray-50 mt-12">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Top row: brand + links */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="font-black text-base" style={{
              background: 'linear-gradient(135deg, #FF69B4, #9B59B6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {COMPANY.brandName} ({COMPANY.brandNameEn})
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{COMPANY.slogan}</p>
          </div>

          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500">
            <Link href="/terms" className="hover:text-pink-400 transition-colors">
              이용약관
            </Link>
            <Link href="/privacy" className="font-bold hover:text-pink-400 transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/refund" className="hover:text-pink-400 transition-colors">
              환불정책
            </Link>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-pink-400 transition-colors">
              문의
            </a>
          </nav>
        </div>

        {/* Business info */}
        <p className="text-xs text-gray-400 leading-relaxed">
          {COMPANY.legalName}&nbsp;|&nbsp;대표&nbsp;{COMPANY.ceo}&nbsp;|&nbsp;
          사업자등록번호&nbsp;{COMPANY.bizNumber}&nbsp;|&nbsp;
          통신판매업&nbsp;{COMPANY.ecommerceLicense}&nbsp;|&nbsp;
          {COMPANY.address}&nbsp;|&nbsp;
          TEL&nbsp;{COMPANY.phone}&nbsp;|&nbsp;{COMPANY.email}
        </p>

        {/* Copyright */}
        <p className="text-xs text-gray-300">
          © 2026 {COMPANY.legalName}. All rights reserved.
        </p>

      </div>
    </footer>
  )
}
