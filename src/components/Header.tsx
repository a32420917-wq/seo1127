import {ExternalLink, Menu, X} from 'lucide-react';
import {useState} from 'react';

export type AppView = 'landing' | 'quiz' | 'result' | 'explorer';

interface HeaderProps {
  currentView: AppView;
  onNavigateLanding: (sectionId?: string) => void;
  onNavigateExplorer: () => void;
  onStartTest: () => void;
}

export function Header({
  currentView,
  onNavigateLanding,
  onNavigateExplorer,
  onStartTest,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (action: () => void) => {
    setMobileMenuOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E6EE]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => handleLinkClick(() => onNavigateLanding())}
          aria-label="사회복지법인 중문복지재단 천안시니어클럽 홈으로 이동"
          className="flex items-center whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] rounded-sm"
        >
          <img
            src="/assets/aistudio/image_81928053.png"
            alt="사회복지법인 중문복지재단 천안시니어클럽"
            referrerPolicy="no-referrer"
            className="h-9 sm:h-10 w-auto object-contain"
          />
        </button>

        <nav
          aria-label="주 메뉴"
          className="hidden md:flex items-center gap-7 text-[15px] font-medium text-[#4A5260]"
        >
          <button
            type="button"
            onClick={() => onNavigateLanding('about-axes')}
            className="hover:text-[#141821] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] rounded-sm"
          >
            성향 분석 원리
          </button>
          <button
            type="button"
            onClick={() => onNavigateLanding('job-fields')}
            className="hover:text-[#141821] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] rounded-sm"
          >
            일자리 분야
          </button>
          <button
            type="button"
            onClick={onNavigateExplorer}
            className={`hover:text-[#141821] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] rounded-sm ${
              currentView === 'explorer' ? 'text-[#1E40AF] font-semibold underline' : ''
            }`}
          >
            16가지 유형
          </button>
          <button
            type="button"
            onClick={() => onNavigateLanding('faq-section')}
            className="hover:text-[#141821] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] rounded-sm"
          >
            자주 묻는 질문
          </button>
          <a
            href="https://www.cascsniorclub.co.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[#1E40AF] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] rounded-sm"
          >
            <span>홈페이지</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick(onStartTest)}
            className="px-5 py-2.5 text-[15px] font-semibold text-white bg-[#1E40AF] hover:bg-[#173187] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] min-h-[44px]"
          >
            테스트 시작하기
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#D4DAE4] text-[#141821] hover:bg-[#EEF2F7] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2E6EE] bg-white px-5 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleLinkClick(() => onNavigateLanding('about-axes'))}
            className="block w-full text-left py-2.5 px-3 text-base font-medium text-[#2A313D] hover:bg-[#F1F5F9] rounded-lg"
          >
            성향 분석 원리
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick(() => onNavigateLanding('job-fields'))}
            className="block w-full text-left py-2.5 px-3 text-base font-medium text-[#2A313D] hover:bg-[#F1F5F9] rounded-lg"
          >
            일자리 분야
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick(onNavigateExplorer)}
            className="block w-full text-left py-2.5 px-3 text-base font-medium text-[#2A313D] hover:bg-[#F1F5F9] rounded-lg"
          >
            16가지 유형 둘러보기
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick(() => onNavigateLanding('faq-section'))}
            className="block w-full text-left py-2.5 px-3 text-base font-medium text-[#2A313D] hover:bg-[#F1F5F9] rounded-lg"
          >
            자주 묻는 질문
          </button>
          <a
            href="https://www.cascsniorclub.co.kr/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between w-full text-left py-2.5 px-3 text-base font-semibold text-[#1E40AF] hover:bg-[#EFF4FF] rounded-lg"
          >
            <span>천안시니어클럽 홈페이지 바로가기</span>
            <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      )}
    </header>
  );
}
