import { COMPANY } from '@/lib/company'

export const metadata = {
  title: `환불정책 — ${COMPANY.brandName}`,
}

export default function RefundPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-gray-800 mb-2">환불정책</h1>
      <p className="text-sm text-gray-500 mb-8">
        {COMPANY.serviceName}({COMPANY.serviceNameEn}) 셀프 영상 촬영 서비스
      </p>

      <section className="space-y-8 text-sm text-gray-700 leading-relaxed">

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">1. 환불 가능 사유</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>결제 후 녹화 시작 전 취소: 전액 환불</li>
            <li>키오스크 오작동, 녹화 실패, 영상 손상 등 회사 귀책 사유: 전액 환불 또는 동일 시간 재이용권 제공</li>
            <li>결제 직후 7일 이내 미이용: 전액 환불 (전자상거래법상 청약철회권 보장)</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">2. 환불 불가 사유</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              녹화가 정상적으로 완료된 경우
              (디지털 콘텐츠 특성상 청약철회 제한 — 전자상거래법 제17조 제2항 제5호)
            </li>
            <li>이용자 부주의로 인한 영상 다운로드 실패 (24시간 내 재다운로드 가능)</li>
            <li>쿠폰으로 결제한 경우 (현금 환불 불가, 재이용권으로 대체 가능)</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">3. 환불 신청 방법</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>이메일: {COMPANY.email}</li>
            <li>전화: {COMPANY.phone} (평일 10:00 ~ 18:00)</li>
            <li>신청 시 포함 정보: 결제일시, 매장명, 결제금액, 환불사유</li>
            <li>영업일 기준 3일 이내 처리</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">4. 환불 처리 기간</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>신용카드: 카드사 승인취소 후 3~5영업일 이내 자동 환급</li>
            <li>간편결제(토스페이 등): 결제수단별 정책에 따라 즉시~5영업일</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">5. 분쟁 시</h2>
          <p>
            공정거래위원회 고시 「소비자분쟁해결기준」을 따릅니다.
          </p>
        </div>

        <div className="border-t border-gray-100 pt-6 text-xs text-gray-400">
          <p>문의: {COMPANY.email} / {COMPANY.phone}</p>
        </div>

      </section>
    </main>
  )
}
