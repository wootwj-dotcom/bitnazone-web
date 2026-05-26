'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const BATCH = 'BETA-2026-05'

type BetaCoupon = {
  id: string
  code: string
  is_used: boolean
  created_at: string
}

export default function BetaPrintPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">로딩 중...</div>}>
      <BetaPrintInner />
    </Suspense>
  )
}

function BetaPrintInner() {
  const params = useSearchParams()
  const isMaster = params.get('master') === 'true'

  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (pw === 'bitnazone2026') { setAuthed(true); setPwError(false) }
    else setPwError(true)
  }

  if (!authed) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 no-print">
        <div className="max-w-[380px] w-full">
          <h1 className="text-xl font-black mb-6 text-center" style={{ color: '#9B59B6' }}>
            🔐 베타 쿠폰 인쇄
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              className="input-field"
              placeholder="관리자 비밀번호"
              value={pw}
              onChange={e => setPw(e.target.value)}
              autoFocus
            />
            {pwError && <p className="text-sm text-red-500">비밀번호가 틀렸습니다.</p>}
            <button type="submit" className="btn-primary">로그인</button>
          </form>
        </div>
      </div>
    )
  }

  return isMaster ? <MasterList /> : <CardSheet />
}

function useBetaCoupons() {
  const [coupons, setCoupons] = useState<BetaCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('coupons')
      .select('id, code, is_used, created_at')
      .eq('batch', BATCH)
      .order('created_at', { ascending: true })
    if (error) { setErr(error.message); setLoading(false); return }
    setCoupons((data || []) as BetaCoupon[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { coupons, loading, err }
}

function CardSheet() {
  const { coupons, loading, err } = useBetaCoupons()

  if (loading) return <div className="p-8 text-center text-sm text-gray-400 no-print">불러오는 중...</div>
  if (err) return <div className="p-8 text-center text-sm text-red-500 no-print">오류: {err}</div>
  if (coupons.length === 0) return (
    <div className="p-8 text-center text-sm text-gray-500 no-print">
      베타 쿠폰이 아직 없습니다.<br/>
      <code className="text-xs">node scripts/seed-beta-coupons.js</code> 를 먼저 실행하세요.
    </div>
  )

  return (
    <>
      <div className="no-print" style={{ padding: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
          A4 1장에 8장 · 총 {coupons.length}장 · {Math.ceil(coupons.length / 8)} 페이지
        </p>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #FF69B4, #9B59B6)' }}
        >
          🖨 인쇄하기
        </button>
        <p style={{ fontSize: 11, color: '#999', marginTop: 8 }}>
          알바생용 마스터 리스트: <a href="?master=true" style={{ color: '#9B59B6', textDecoration: 'underline' }}>?master=true</a>
        </p>
      </div>
      <div className="print-sheet">
        {coupons.map(c => (
          <div key={c.id} className="card-cut">
            <div className="card-inner">
              <div className="card-title">🎉 빛나 Zone 베타 쿠폰</div>
              <div className="card-code">{c.code}</div>
              <div className="card-steps">13번방 QR → 코드 입력 → 무료 촬영</div>
              <div className="card-reward">촬영 후 피드백 작성 시<br/>쿠팡 1만원 상품권 추첨</div>
            </div>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 8mm; }
          body { background: #fff !important; }
        }
        .print-sheet {
          display: grid;
          grid-template-columns: repeat(2, 90mm);
          grid-template-rows: repeat(4, 55mm);
          gap: 4mm;
          justify-content: center;
          align-content: start;
          padding: 8mm 0;
        }
        .card-cut {
          width: 90mm;
          height: 55mm;
          border: 1px dashed #BBB;
          padding: 4mm;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .card-inner {
          text-align: center;
          width: 100%;
        }
        .card-title {
          font-size: 11px;
          font-weight: 700;
          color: #9B59B6;
          margin-bottom: 5px;
        }
        .card-code {
          font-family: 'Courier New', monospace;
          font-size: 22px;
          font-weight: 900;
          color: #1A1A1A;
          letter-spacing: 2px;
          margin-bottom: 6px;
        }
        .card-steps {
          font-size: 10px;
          color: #444;
          margin-bottom: 5px;
        }
        .card-reward {
          font-size: 9px;
          color: #D4537E;
          font-weight: 600;
          line-height: 1.4;
        }
      `}</style>
    </>
  )
}

function MasterList() {
  const { coupons, loading, err } = useBetaCoupons()

  if (loading) return <div className="p-8 text-center text-sm text-gray-400 no-print">불러오는 중...</div>
  if (err) return <div className="p-8 text-center text-sm text-red-500 no-print">오류: {err}</div>

  return (
    <>
      <div className="no-print" style={{ padding: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
          알바생용 마스터 리스트 · 총 {coupons.length}장
        </p>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #FF69B4, #9B59B6)' }}
        >
          🖨 인쇄하기
        </button>
        <p style={{ fontSize: 11, color: '#999', marginTop: 8 }}>
          명함 인쇄: <a href="?" style={{ color: '#9B59B6', textDecoration: 'underline' }}>(쿼리 제거)</a>
        </p>
      </div>
      <div className="master-sheet">
        <h2 className="master-title">빛나 Zone 베타 쿠폰 마스터 리스트 ({BATCH})</h2>
        <table className="master-table">
          <thead>
            <tr>
              <th style={{ width: '32px' }}>#</th>
              <th>코드</th>
              <th style={{ width: '60px' }}>사용</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td>
                <td className="mono">{c.code}</td>
                <td style={{ textAlign: 'center' }}>{c.is_used ? '✅' : '☐'}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 10mm; }
          body { background: #fff !important; }
        }
        .master-sheet { padding: 8mm; max-width: 190mm; margin: 0 auto; }
        .master-title { font-size: 14px; font-weight: 800; text-align: center; margin-bottom: 10px; color: #333; }
        .master-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .master-table th, .master-table td {
          border: 1px solid #999;
          padding: 5px 8px;
          text-align: left;
        }
        .master-table th { background: #F4F4F2; font-weight: 700; }
        .master-table td.mono { font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 1px; }
      `}</style>
    </>
  )
}
