import { COMPANY } from '@/lib/company'

export const metadata = {
  title: `이용약관 — ${COMPANY.brandName}`,
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-gray-800 mb-8">이용약관</h1>

      <section className="space-y-8 text-sm text-gray-700 leading-relaxed">

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제1조 (목적)</h2>
          <p>
            본 약관은 {COMPANY.legalName}(이하 &quot;회사&quot;)가 운영하는 {COMPANY.domain}(이하 &quot;서비스&quot;)의
            이용과 관련하여 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제2조 (정의)</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>회원</strong>: Google OAuth를 통해 가입한 자</li>
            <li><strong>콘텐츠</strong>: 회원이 게시한 영상 링크, 댓글 등</li>
            <li><strong>쿠폰</strong>: {COMPANY.serviceName} 키오스크에서 사용 가능한 디지털 이용권</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제3조 (약관의 효력 및 변경)</h2>
          <p>
            본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 필요 시 약관을 변경할 수 있으며,
            변경 시 시행일 7일 전 공지하며, 회원에게 불리한 중대한 변경의 경우 30일 전 공지합니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제4조 (회원가입)</h2>
          <p>
            회원가입은 Google OAuth 인증을 통해 이루어지며, 만 14세 미만은 가입할 수 없습니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제5조 (서비스의 제공)</h2>
          <p>
            영상 링크 게시, 좋아요/댓글, 쿠폰 적립 및 사용 등의 기능을 제공합니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제6조 (회원의 의무)</h2>
          <p>
            회원은 타인의 권리를 침해하는 게시물, 저작권을 침해하는 콘텐츠, 음란·폭력적 콘텐츠를
            게시해서는 안 됩니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제7조 (게시물의 관리)</h2>
          <p>
            회사는 부적절하다고 판단되는 게시물을 사전 통보 없이 삭제할 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제8조 (저작권)</h2>
          <p>
            회원이 게시한 콘텐츠의 저작권은 해당 회원에게 귀속됩니다. 단, 회사는 서비스 운영, 홍보 및
            개선 목적으로 해당 콘텐츠를 사용할 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제9조 (쿠폰)</h2>
          <p>
            쿠폰은 단일 사용을 원칙으로 하며, 현금 교환 및 양도가 불가능하고, 발급일로부터 90일간 유효합니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제10조 (서비스 중단)</h2>
          <p>
            시스템 점검, 천재지변, 통신장애 등 불가항력적 사유로 서비스가 중단될 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제11조 (면책)</h2>
          <p>
            회사는 회원 간 거래 및 외부 링크 콘텐츠에 대해 책임지지 않습니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">제12조 (분쟁 해결)</h2>
          <p>
            본 약관에 관한 분쟁은 대한민국 법률에 따르며, 회사의 본점 소재지(충청남도 천안시) 관할
            법원을 합의관할 법원으로 합니다.
          </p>
        </div>

        <div className="border-t border-gray-100 pt-6 text-xs text-gray-400">
          <p><strong>부칙</strong>: 본 약관은 {COMPANY.effectiveDate}부터 시행합니다.</p>
        </div>

      </section>
    </main>
  )
}
