import {
  ArrowRight,
  BookmarkCheck,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  MessageCircle,
  Search,
  Smartphone,
  Type,
  X,
} from 'lucide-react';
import {useMemo, useState} from 'react';
import {
  ALL_MBTI_CODES,
  HERO_IMAGE,
  JOB_CATEGORIES,
  JobCategoryKey,
  MBTI_PROFILES,
  QUIZ_QUESTIONS,
} from '../data/mbtiData';
import {exportResultAsPng} from '../utils/resultImageExport';
import {formatKoreanDate, SavedTestResult} from '../utils/resultStorage';
import {SafeImage} from './SafeImage';

type StripPanelKey = 'questions' | 'types' | 'jobs' | 'share' | null;
type JobProgramFilter = 'all' | '공익' | '사회서비스' | '시장형' | '인턴십' | '재능나눔';

interface LandingViewProps {
  largeText: boolean;
  onToggleLargeText: () => void;
  onStartTest: () => void;
  onOpenExplorer: (category?: JobCategoryKey | 'all') => void;
  onSelectType: (code: string) => void;
  savedResult: SavedTestResult | null;
  onOpenSavedResult: (saved: SavedTestResult) => void;
}

const AXES_GUIDE = [
  {
    num: '01',
    title: '에너지 방향 · 외향(E) / 내향(I)',
    desc: '여러 사람과 활기차게 어울리는 현장이 편한지, 차분한 공간에서 혼자 집중하는 일이 맞는지 살펴봅니다.',
  },
  {
    num: '02',
    title: '일 처리 방식 · 현실(S) / 직관(N)',
    desc: '익숙한 손기술과 검증된 매뉴얼에 강한지, 새로운 기획과 의미를 탐구하는 일에 흥미를 느끼는지 구분합니다.',
  },
  {
    num: '03',
    title: '판단 기준 · 원칙(T) / 공감(F)',
    desc: '정확한 규칙과 공정한 관리를 중시하는지, 이웃의 마음을 어루만지고 돌보는 온기를 우선하는지 확인합니다.',
  },
  {
    num: '04',
    title: '근무 리듬 · 계획(J) / 유연(P)',
    desc: '정해진 요일과 시간에 규칙적으로 일하는 편이 좋은지, 상황에 맞춰 유연하게 조율하는 활동이 맞는지 봅니다.',
  },
];

const FAQ_ITEMS = [
  {
    q: '테스트는 무료이며 개인정보를 입력해야 하나요?',
    a: '별도의 회원가입이나 이름, 연락처 입력 없이 누구나 무료로 즉시 참여하실 수 있습니다. 테스트 결과는 다시 보실 수 있도록 사용 중인 기기 안에만 안전하게 저장됩니다.',
  },
  {
    q: '평소 성격과 일할 때의 모습이 조금 다른데 어떻게 답해야 할까요?',
    a: '집에서 쉴 때의 모습보다는 “내가 실제로 어떤 일자리나 봉사 현장에 나갔을 때 가장 편안하고 보람찰까?”를 떠올리며 더 마음이 가는 선택지를 골라 주세요.',
  },
  {
    q: '추천받은 시니어 일자리는 어디서 실제로 신청할 수 있나요?',
    a: '한국노인인력개발원 “노인일자리 여기” 누리집, 거주지 시·군·구 시니어클럽, 노인복지관, 행정복지센터(주민센터), 고용24(구 워크넷) 중장년내일센터를 통해 모집 공고를 확인하고 신청하실 수 있습니다.',
  },
  {
    q: '만 60세 또는 65세 이상만 참고할 수 있나요?',
    a: '공익활동형(만 65세 이상 기초연금 수급자 등)뿐 아니라 만 60세 이상 참여 가능한 사회서비스형, 시장형 사업단, 시니어 인턴십, 만 50세 이상 중장년 재능나눔까지 폭넓게 연결해 드립니다.',
  },
];

export function LandingView({
  largeText,
  onToggleLargeText,
  onStartTest,
  onOpenExplorer,
  onSelectType,
  savedResult,
  onOpenSavedResult,
}: LandingViewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeStripPanel, setActiveStripPanel] = useState<StripPanelKey>(null);
  const [sampleChoice, setSampleChoice] = useState<'A' | 'B' | null>(null);
  const [jobSearch, setJobSearch] = useState('');
  const [jobProgramFilter, setJobProgramFilter] = useState<JobProgramFilter>('all');
  const [isExportingSaved, setIsExportingSaved] = useState(false);

  const categoryList = Object.values(JOB_CATEGORIES);
  const savedProfile = savedResult ? MBTI_PROFILES[savedResult.code] : null;
  const sampleQuestion = QUIZ_QUESTIONS[0];

  const all48Jobs = useMemo(() => {
    return ALL_MBTI_CODES.flatMap((code) => {
      const profile = MBTI_PROFILES[code];
      return profile.recommendedJobs.slice(0, 3).map((job) => ({
        ...job,
        code,
        archetype: profile.archetype,
      }));
    });
  }, []);

  const filteredJobs = useMemo(() => {
    const q = jobSearch.trim().toLowerCase();
    return all48Jobs.filter((item) => {
      const matchesProgram =
        jobProgramFilter === 'all' || item.programType.includes(jobProgramFilter);
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q) ||
        item.programType.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.archetype.toLowerCase().includes(q);
      return matchesProgram && matchesQuery;
    });
  }, [all48Jobs, jobProgramFilter, jobSearch]);

  const toggleStripPanel = (key: Exclude<StripPanelKey, null>) => {
    setActiveStripPanel((prev) => (prev === key ? null : key));
  };

  const handleExportSavedPng = async () => {
    if (!savedResult || !savedProfile || isExportingSaved) return;
    setIsExportingSaved(true);
    try {
      await exportResultAsPng(savedProfile, savedResult.axisScores);
    } finally {
      setIsExportingSaved(false);
    }
  };

  return (
    <div className={largeText ? 'text-[18px] leading-[1.75]' : 'text-[16px] leading-[1.65]'}>
      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
        {savedResult && savedProfile && (
          <div className="mb-8 p-4 sm:px-6 sm:py-4 rounded-2xl bg-[#EFF4FF] border border-[#C7D7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#C7D7F5] shrink-0">
                <SafeImage
                  src={savedProfile.characterImage}
                  alt={savedProfile.characterAlt}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E40AF]">
                  <BookmarkCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>저장된 내 성향 결과 · {formatKoreanDate(savedResult.savedAt)}</span>
                </div>
                <div className="text-[17px] font-bold text-[#141821]">
                  <span className="font-code text-[#1E40AF] mr-2 tabular-nums">
                    {savedProfile.code}
                  </span>
                  {savedProfile.archetype} ({savedProfile.recommendedJobs[0].title} 등 추천)
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenSavedResult(savedResult)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[15px] font-semibold text-white bg-[#1E40AF] hover:bg-[#173187] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[46px]"
            >
              <span>내 결과 다시 보기</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#1E40AF] tracking-normal mb-4">
                천안시니어클럽 · 인생 2막 시니어 일자리 성향 진단
              </p>
              <h1
                className="font-display font-bold text-[#141821] tracking-tight mb-5 break-keep"
                style={{fontSize: 'clamp(1.75rem, 2.85vw, 2.65rem)', lineHeight: 1.28}}
              >
                <span className="block">내 성향에 꼭 맞는</span>
                <span className="block whitespace-nowrap">시니어 일자리를 찾아보세요</span>
              </h1>
              <p
                className={`text-[#4A5260] max-w-[34rem] mb-8 break-keep ${
                  largeText ? 'text-[19px] leading-[1.8]' : 'text-[17px] leading-[1.75]'
                }`}
              >
                남들이 많이 하는 일보다 내 기질과 생활 리듬에 편안한 일이 오래갑니다.
                <br className="hidden sm:inline" /> 12개의 일상 질문으로 나의 MBTI 일터 성향을 알아보고,{' '}
                <span className="sm:whitespace-nowrap">실제 시니어 일자리 3가지를 추천받아 보세요.</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={onStartTest}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-[17px] font-semibold text-white bg-[#1E40AF] hover:bg-[#173187] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] min-h-[54px]"
                >
                  <span>내 성향 테스트 시작하기</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenExplorer('all')}
                  className="inline-flex items-center justify-center px-5 py-4 text-[16px] font-medium text-[#141821] bg-white border border-[#D4DAE4] hover:bg-[#F1F5F9] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] min-h-[54px]"
                >
                  16가지 유형 먼저 보기
                </button>
              </div>
            </div>

            <div className="pt-5 border-t border-[#E2E6EE] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-sm text-[#58635E]">
                <span>회원가입 없음</span>
                <span aria-hidden="true">·</span>
                <span>약 3분 소요</span>
                <span aria-hidden="true">·</span>
                <span>결과지 인쇄 지원</span>
              </div>

              <button
                type="button"
                onClick={onToggleLargeText}
                aria-pressed={largeText}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] ${
                  largeText
                    ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                    : 'bg-white text-[#2A332F] border-[#D4DAE4] hover:bg-[#F1F5F9]'
                }`}
              >
                <Type className="w-4 h-4" aria-hidden="true" />
                <span>{largeText ? '큰 글씨 켜짐' : '큰 글씨로 보기'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex">
            <div className="w-full rounded-2xl overflow-hidden border border-[#E2E6EE] bg-white">
              <SafeImage
                src={HERO_IMAGE.url}
                alt={HERO_IMAGE.alt}
                fallbackTitle="활기찬 시니어 일자리 커뮤니티"
                className="w-full h-[300px] sm:h-[380px] lg:h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Interactive 4-column Key Info Strip */}
        <div
          role="tablist"
          aria-label="테스트 주요 안내 및 바로가기"
          className="mt-10 grid grid-cols-2 lg:grid-cols-4 border border-[#E2E6EE] rounded-xl bg-white overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#E2E6EE]"
        >
          {(
            [
              {
                key: 'questions',
                title: '12문항',
                subtitle: '부담 없이 3분 만에 완료',
                hint: '질문 맛보기',
              },
              {
                key: 'types',
                title: '16유형',
                subtitle: '시니어 눈높이 맞춤 MBTI',
                hint: '캐릭터 둘러보기',
              },
              {
                key: 'jobs',
                title: '48개 직무',
                subtitle: '공공·사회서비스·시장형 연계',
                hint: '직무 검색하기',
              },
              {
                key: 'share',
                title: '저장·공유',
                subtitle: '카톡·문자 전송 및 이미지 저장',
                hint: '기능 살펴보기',
              },
            ] as const
          ).map((tab) => {
            const isActive = activeStripPanel === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-expanded={isActive}
                onClick={() => toggleStripPanel(tab.key)}
                className={`group text-left p-5 sm:p-6 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#1E40AF] ${
                  isActive ? 'bg-[#EFF4FF]' : 'bg-white hover:bg-[#F4F7FC]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-code text-2xl font-bold text-[#1E40AF] tabular-nums">
                    {tab.title}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#1E40AF] transition-transform duration-200 shrink-0 ${
                      isActive ? 'rotate-180' : 'opacity-70 group-hover:opacity-100'
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <div className="text-sm font-medium text-[#2A332F] mb-1.5">{tab.subtitle}</div>
                <div className="text-xs font-semibold text-[#1E40AF]">
                  {isActive ? '열림 · 다시 누르면 닫기' : `${tab.hint} →`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Expandable Interactive Panel for Selected Strip Item */}
        {activeStripPanel && (
          <div
            role="tabpanel"
            className="mt-4 bg-white border border-[#C7D7F5] rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-[#E2E6EE]">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#141821]">
                  {activeStripPanel === 'questions' && '12문항 맛보기 · 이렇게 질문합니다'}
                  {activeStripPanel === 'types' && '16가지 시니어 캐릭터 빠른 선택'}
                  {activeStripPanel === 'jobs' && '48개 시니어 추천 직무 실시간 검색'}
                  {activeStripPanel === 'share' && '결과 저장 및 가족·지인 공유 안내'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveStripPanel(null)}
                aria-label="패널 닫기"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#4A5260] hover:text-[#141821] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                <span>닫기</span>
              </button>
            </div>

            {activeStripPanel === 'questions' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 space-y-3">
                  <div className="text-sm font-semibold text-[#1E40AF]">
                    4가지 영역 × 각 3문항 = 총 12문항
                  </div>
                  <div className="space-y-2.5">
                    {[
                      '01. 에너지 방향 (1~3번) · 사람과 어울림 vs 차분한 집중',
                      '02. 일 처리 방식 (4~6번) · 실무 경험 vs 새로운 기획',
                      '03. 판단 기준 (7~9번) · 원칙과 기준 vs 따뜻한 공감',
                      '04. 근무 리듬 (10~12번) · 정해진 시간 vs 유연한 조율',
                    ].map((line) => (
                      <div
                        key={line}
                        className="p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E6EE] text-sm font-medium text-[#2A313D]"
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-[#F4F7FC] border border-[#D6E2F5]">
                  <div className="text-xs font-semibold text-[#1E40AF] mb-2">
                    1번 문항 미리 체험해 보기
                  </div>
                  <p className="font-display text-lg sm:text-xl font-bold text-[#141821] mb-4">
                    {sampleQuestion.prompt}
                  </p>
                  <div className="space-y-2.5 mb-5">
                    {(
                      [
                        {key: 'A', choice: sampleQuestion.choiceA},
                        {key: 'B', choice: sampleQuestion.choiceB},
                      ] as const
                    ).map(({key, choice}) => {
                      const picked = sampleChoice === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSampleChoice(key)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center gap-3 cursor-pointer ${
                            picked
                              ? 'bg-[#EFF4FF] border-[#1E40AF] text-[#141821]'
                              : 'bg-white border-[#DCE2EC] hover:border-[#93B4E8]'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-md flex items-center justify-center font-code text-sm font-bold shrink-0 ${
                              picked
                                ? 'bg-[#1E40AF] text-white'
                                : 'bg-[#F1F5F9] text-[#2A313D]'
                            }`}
                          >
                            {picked ? <Check className="w-4 h-4" aria-hidden="true" /> : key}
                          </span>
                          <span className="text-[15px] font-medium text-[#141821]">
                            {choice.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm text-[#4A5260]">
                      {sampleChoice === 'A' &&
                        '활기찬 소통 속에서 에너지를 얻는 외향(E) 성향에 가깝습니다.'}
                      {sampleChoice === 'B' &&
                        '차분하게 흐름을 살피며 집중하는 내향(I) 성향에 가깝습니다.'}
                      {!sampleChoice && '선택지를 눌러 체험해 보세요.'}
                    </span>
                    <button
                      type="button"
                      onClick={onStartTest}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#173187] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>전체 테스트 시작하기</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeStripPanel === 'types' && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                  {ALL_MBTI_CODES.map((code) => {
                    const p = MBTI_PROFILES[code];
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => onSelectType(code)}
                        className="group text-center p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E6EE] hover:border-[#1E40AF] hover:bg-[#EFF4FF] transition-colors cursor-pointer"
                      >
                        <div className="w-14 h-14 mx-auto mb-2 rounded-lg overflow-hidden bg-white border border-[#E2E6EE]">
                          <SafeImage
                            src={p.characterImage}
                            alt={p.characterAlt}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="font-code text-sm font-bold text-[#1E40AF] tabular-nums">
                          {code}
                        </div>
                        <div className="text-xs font-medium text-[#2A313D] truncate mt-0.5">
                          {p.archetype.replace('형', '')}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenExplorer('all')}
                    className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#1E40AF] hover:underline underline-offset-4 cursor-pointer"
                  >
                    <span>16가지 유형 전체 도감에서 크게 보기</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {activeStripPanel === 'jobs' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                  <div className="relative flex-1 max-w-md">
                    <Search
                      className="w-4 h-4 text-[#586170] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      placeholder="예: 도서관, 바리스타, 돌봄, 목공, 멘토"
                      aria-label="시니어 직무 검색"
                      className="w-full pl-10 pr-4 py-2.5 text-[15px] bg-[#F8F9FB] border border-[#D4DAE4] rounded-xl text-[#141821] placeholder:text-[#707A89] focus:outline-2 focus:outline-[#1E40AF]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        {key: 'all', label: '전체'},
                        {key: '공익', label: '공익활동형'},
                        {key: '사회서비스', label: '사회서비스형'},
                        {key: '시장형', label: '시장형'},
                        {key: '인턴십', label: '시니어 인턴십'},
                        {key: '재능나눔', label: '재능나눔'},
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setJobProgramFilter(f.key)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                          jobProgramFilter === f.key
                            ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                            : 'bg-white text-[#4A5260] border-[#D4DAE4] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs font-medium text-[#586170] mb-3 tabular-nums">
                  검색 결과 {filteredJobs.length}개 직무 (클릭하면 해당 성향 상세 보기로 이동)
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-[#F8F9FB] border border-[#E2E6EE] text-[#4A5260]">
                    검색어와 일치하는 직무가 없습니다. 다른 단어로 검색해 보세요.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-1">
                    {filteredJobs.slice(0, 12).map((job) => (
                      <button
                        key={`${job.code}-${job.title}`}
                        type="button"
                        onClick={() => onSelectType(job.code)}
                        className="text-left p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E6EE] hover:border-[#1E40AF] hover:bg-[#EFF4FF] transition-colors cursor-pointer flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-xs mb-1">
                            <span className="font-semibold text-[#1E40AF]">{job.programType}</span>
                            <span className="font-code font-bold text-[#141821] tabular-nums">
                              {job.code}
                            </span>
                          </div>
                          <div className="font-bold text-[15px] text-[#141821]">{job.title}</div>
                        </div>
                        <div className="text-xs text-[#586170]">{job.schedule}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeStripPanel === 'share' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E6EE]">
                    <MessageCircle className="w-5 h-5 text-[#1E40AF] mb-2" aria-hidden="true" />
                    <div className="font-bold text-[15px] text-[#141821] mb-1">카카오톡 전송</div>
                    <p className="text-xs text-[#4A5260] leading-relaxed">
                      테스트 완료 후 가족이나 복지관 담당자에게 카톡으로 결과를 바로 보낼 수 있습니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E6EE]">
                    <Smartphone className="w-5 h-5 text-[#1E40AF] mb-2" aria-hidden="true" />
                    <div className="font-bold text-[15px] text-[#141821] mb-1">문자(SMS) 공유</div>
                    <p className="text-xs text-[#4A5260] leading-relaxed">
                      휴대폰 문자 앱으로 추천 직무 3가지와 결과 링크가 자동으로 채워져 전송됩니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E6EE]">
                    <Download className="w-5 h-5 text-[#1E40AF] mb-2" aria-hidden="true" />
                    <div className="font-bold text-[15px] text-[#141821] mb-1">이미지(PNG) 저장</div>
                    <p className="text-xs text-[#4A5260] leading-relaxed">
                      내 캐릭터와 추천 직무가 담긴 리포트 카드를 사진첩에 그림 파일로 저장합니다.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-5 p-5 rounded-xl bg-[#EFF4FF] border border-[#C7D7F5]">
                  {savedResult && savedProfile ? (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-[#1E40AF]">
                        저장된 결과 ({savedProfile.code} · {savedProfile.archetype})
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => onOpenSavedResult(savedResult)}
                          className="px-4 py-2.5 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#173187] rounded-lg transition-colors cursor-pointer"
                        >
                          결과 페이지 열기
                        </button>
                        <button
                          type="button"
                          onClick={handleExportSavedPng}
                          disabled={isExportingSaved}
                          className="px-4 py-2.5 text-sm font-semibold text-[#1E40AF] bg-white border border-[#C7D7F5] hover:border-[#1E40AF] rounded-lg transition-colors cursor-pointer"
                        >
                          {isExportingSaved ? '저장 중...' : '이미지로 바로 저장'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="font-bold text-[15px] text-[#141821]">
                        아직 저장된 테스트 결과가 없습니다
                      </div>
                      <p className="text-sm text-[#4A5260]">
                        12문항 테스트를 마치면 이 기기에 결과가 자동 저장되어 언제든 다시 보실 수 있습니다.
                      </p>
                      <button
                        type="button"
                        onClick={onStartTest}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#173187] rounded-lg transition-colors cursor-pointer"
                      >
                        <span>지금 테스트 시작하기</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Section 1: 4 MBTI Axes for Seniors */}
      <section id="about-axes" className="bg-white border-y border-[#E2E6EE] py-14 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-sm font-medium text-[#1E40AF] mb-2">성향 분석 원리</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141821] text-balance mb-3">
              오랜 삶에서 다져진 4가지 일터 기질을 살핍니다
            </h2>
            <p className="text-[#4A5260]">
              단순한 성격 검사가 아니라, 시니어 일자리 현장에서 겪는 실제 상황을 기준으로 나의
              강점과 편안한 근무 환경을 찾아드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {AXES_GUIDE.map((axis) => (
              <div key={axis.num} className="pt-5 border-t border-[#E2E6EE]">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-code text-sm font-semibold text-[#1E40AF] tabular-nums">
                    {axis.num}.
                  </span>
                  <h3 className="text-lg font-semibold text-[#141821]">{axis.title}</h3>
                </div>
                <p className="text-[#4A5260] pl-7">{axis.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: 4 Senior Work Field Categories */}
      <section id="job-fields" className="py-14 lg:py-20 max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#1E40AF] mb-2">주요 일자리 분야</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141821] text-balance">
              성향에 따라 달라지는 4가지 시니어 활동 무대
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenExplorer('all')}
            className="text-[15px] font-semibold text-[#1E40AF] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
          >
            전체 16가지 유형 보기 →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryList.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onOpenExplorer(cat.key)}
              className="group text-left bg-white border border-[#E2E6EE] hover:border-[#1E40AF] rounded-xl overflow-hidden transition-colors flex flex-col cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#EEF2F7]">
                <SafeImage
                  src={cat.imageUrl}
                  alt={cat.imageAlt}
                  fallbackTitle={cat.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#141821] mb-1.5 group-hover:text-[#1E40AF] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-[#4A5260] leading-relaxed">{cat.shortDesc}</p>
                </div>
                <span className="text-sm font-medium text-[#1E40AF] inline-flex items-center gap-1 pt-1">
                  해당 유형 살펴보기 <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Section 3: FAQ */}
      <section id="faq-section" className="bg-white border-t border-[#E2E6EE] py-14 lg:py-20">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-[#1E40AF] mb-2">자주 묻는 질문</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141821]">
              테스트와 시니어 일자리 신청 안내
            </h2>
          </div>

          <div className="divide-y divide-[#E2E6EE] border-y border-[#E2E6EE]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-5 flex items-center justify-between gap-4 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF]"
                  >
                    <span className="text-[17px] font-semibold text-[#141821]">{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#4A5260] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="pb-5 pr-8 text-[#4A5260] leading-relaxed">{item.a}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-7 sm:p-9 rounded-2xl bg-[#F4F7FC] border border-[#D6E2F5] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#141821] mb-1.5">
                나에게 딱 맞는 인생 2막의 일, 지금 확인해 보세요
              </h3>
              <p className="text-[#4A5260]">
                12개의 간단한 질문에 답하면 바로 맞춤 결과와 추천 직무를 보실 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="https://www.cascsniorclub.co.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 text-[16px] font-semibold text-[#1E40AF] bg-white border border-[#C7D7F5] hover:border-[#1E40AF] rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[52px]"
              >
                <span>천안시니어클럽 바로가기</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={onStartTest}
                className="px-7 py-4 text-[16px] font-semibold text-white bg-[#1E40AF] hover:bg-[#173187] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[52px]"
              >
                테스트 시작하기
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
