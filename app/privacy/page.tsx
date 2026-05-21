import { COMPANY } from '@/lib/company'

export const metadata = {
  title: `개인정보처리방침 — ${COMPANY.brandName}`,
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-gray-800 mb-4">개인정보처리방침</h1>
      <p className="text-sm text-gray-500 mb-8">
        {COMPANY.legalName}(이하 &apos;회사&apos;)는 「개인정보 보호법」 등 관련 법령을 준수하며,
        다음과 같이 개인정보처리방침을 수립·공개합니다.
      </p>

      <section className="space-y-8 text-sm text-gray-700 leading-relaxed">

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">1. 개인정보 수집 항목 및 목적</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>필수</strong>: 이메일, 이름, 프로필 이미지 (Google OAuth)
              → 회원 식별 및 서비스 제공
            </li>
            <li>
              <strong>자동수집</strong>: 접속 IP, 쿠키, 서비스 이용 기록
              → 부정이용 방지, 서비스 개선
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">2. 개인정보 보유 및 이용 기간</h2>
          <p className="mb-2">
            회원 탈퇴 시까지. 단, 관련 법령에 따라 보존 필요 시 해당 기간까지 보관합니다.
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>표시·광고에 관한 기록: 6개월 (전자상거래법)</li>
            <li>계약 또는 청약철회에 관한 기록: 5년 (전자상거래법)</li>
            <li>대금결제 및 재화 공급에 관한 기록: 5년 (전자상거래법)</li>
            <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">3. 개인정보 제3자 제공</h2>
          <p>
            원칙적으로 제공하지 않으며, 이용자의 동의 또는 법령에 의한 경우에 한하여 제공합니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">4. 개인정보 처리 위탁</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Supabase Inc.: 데이터베이스 호스팅</li>
            <li>Vercel Inc.: 웹 호스팅</li>
            <li>Google LLC: OAuth 인증</li>
            <li>Cloudflare Inc.: 네트워크 및 보안</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">5. 이용자의 권리</h2>
          <p>
            회원은 언제든지 개인정보의 열람, 정정, 삭제, 처리정지를 요청할 수 있으며,
            회사 이메일({COMPANY.email})로 신청 가능합니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">6. 개인정보의 안전성 확보 조치</h2>
          <p>
            HTTPS 암호화 전송, 접근권한 관리, 접속기록 보관 등의 기술적·관리적 조치를 시행합니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">7. 쿠키의 사용</h2>
          <p>
            로그인 유지 등을 위해 쿠키를 사용하며, 이용자는 브라우저 설정을 통해 쿠키 저장을
            거부할 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">8. 개인정보 보호책임자</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>성명: {COMPANY.ceo} (대표자)</li>
            <li>연락처: {COMPANY.phone}</li>
            <li>이메일: {COMPANY.email}</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">9. 권익침해 구제 방법</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
            <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
            <li>경찰청 사이버수사국: 182 (ecrm.police.go.kr)</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-800 mb-2">10. 방침 변경</h2>
          <p>
            본 방침은 변경 시 시행일 7일 전 본 페이지를 통해 공지합니다.
          </p>
        </div>

        <div className="border-t border-gray-100 pt-6 text-xs text-gray-400">
          <p>시행일: {COMPANY.effectiveDate}</p>
        </div>

      </section>
    </main>
  )
}
