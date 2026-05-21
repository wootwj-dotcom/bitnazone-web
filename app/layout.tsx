import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link'
import Image from 'next/image'
import AuthButton from '@/components/AuthButton'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: "Bitna Zone — 찬란한 순간을 담는다",
  description: "This moment, you're radiant. Bitna Zone 커뮤니티 영상 피드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="naver-site-verification" content="da3b146efb663badf63cdb976859f6f1e9dafb05" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <header
          className="sticky top-0 z-50 backdrop-blur-sm"
          style={{ background: 'rgba(255,245,251,0.92)', borderBottom: '1px solid rgba(255,105,180,0.12)' }}
        >
          <div className="max-w-[430px] mx-auto px-4 h-12 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/bitna_logo_nobg.png"
                alt="Bitna Zone 로고"
                width={80}
                height={32}
                style={{ height: '32px', width: 'auto' }}
                priority
              />
              <span
                className="font-black text-base"
                style={{
                  background: 'linear-gradient(135deg, #FF69B4, #9B59B6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Bitna Zone
              </span>
            </Link>
            <AuthButton />
          </div>
        </header>

        {children}

        <Footer />
      </body>
    </html>
  );
}
