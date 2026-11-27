import {ArrowRight, Type} from 'lucide-react';
import {
  ALL_MBTI_CODES,
  JOB_CATEGORIES,
  JobCategoryKey,
  MBTI_PROFILES,
} from '../data/mbtiData';
import {SafeImage} from './SafeImage';

interface TypesExplorerViewProps {
  selectedCategory: JobCategoryKey | 'all';
  onChangeCategory: (category: JobCategoryKey | 'all') => void;
  onSelectType: (code: string) => void;
  onStartTest: () => void;
  largeText: boolean;
  onToggleLargeText: () => void;
}

export function TypesExplorerView({
  selectedCategory,
  onChangeCategory,
  onSelectType,
  onStartTest,
  largeText,
  onToggleLargeText,
}: TypesExplorerViewProps) {
  const categories = Object.values(JOB_CATEGORIES);

  const visibleProfiles = ALL_MBTI_CODES.map((code) => MBTI_PROFILES[code]).filter(
    (profile) => selectedCategory === 'all' || profile.category === selectedCategory
  );

  return (
    <section
      className={`max-w-[1200px] mx-auto px-5 sm:px-8 py-10 sm:py-14 ${
        largeText ? 'text-[18px]' : 'text-[16px]'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-sm font-medium text-[#1E40AF] mb-2">시니어 MBTI 일자리 도감</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#141821] text-balance mb-2">
            16가지 시니어 일자리 성향 유형
          </h1>
          <p className="text-[#4A5260]">
            카드를 누르면 각 성향에 어울리는 추천 직무 3가지와 활동 조언을 자세히 볼 수 있습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleLargeText}
            aria-pressed={largeText}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] ${
              largeText
                ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                : 'bg-white text-[#2A313D] border-[#D4DAE4] hover:bg-[#F1F5F9]'
            }`}
          >
            <Type className="w-4 h-4" aria-hidden="true" />
            <span>{largeText ? '큰 글씨 켜짐' : '큰 글씨'}</span>
          </button>

          <button
            type="button"
            onClick={onStartTest}
            className="px-5 py-2.5 text-[15px] font-semibold text-white bg-[#1E40AF] hover:bg-[#173187] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
          >
            내 유형 테스트하기
          </button>
        </div>
      </div>

      {/* Interactive Category Segmented Filter */}
      <div
        role="tablist"
        aria-label="일자리 분야별 필터"
        className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#E8ECF2] rounded-xl mb-8 w-fit max-w-full"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === 'all'}
          onClick={() => onChangeCategory('all')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] ${
            selectedCategory === 'all'
              ? 'bg-white text-[#141821] shadow-sm'
              : 'text-[#4A5260] hover:text-[#141821]'
          }`}
        >
          전체 16유형
        </button>
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            role="tab"
            aria-selected={selectedCategory === cat.key}
            onClick={() => onChangeCategory(cat.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] ${
              selectedCategory === cat.key
                ? 'bg-white text-[#141821] shadow-sm'
                : 'text-[#4A5260] hover:text-[#141821]'
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* 16 Archetype Grid with Individual Senior Character Illustrations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {visibleProfiles.map((profile) => {
          const catInfo = JOB_CATEGORIES[profile.category];
          return (
            <button
              key={profile.code}
              type="button"
              onClick={() => onSelectType(profile.code)}
              className="group text-left bg-white border border-[#E2E6EE] hover:border-[#1E40AF] rounded-xl overflow-hidden transition-colors flex flex-col justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF]"
            >
              <div>
                <div className="aspect-square w-full bg-[#F4F7FC] border-b border-[#E2E6EE] overflow-hidden">
                  <SafeImage
                    src={profile.characterImage}
                    alt={profile.characterAlt}
                    fallbackTitle={`${profile.code} · ${profile.archetype}`}
                    className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-200"
                  />
                </div>

                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#586170] mb-2">
                    <span className="text-[#1E40AF]">{catInfo.title}</span>
                    <span className="font-code text-sm font-bold text-[#141821] tabular-nums">
                      {profile.code}
                    </span>
                  </div>

                  <h2 className="font-display text-xl font-bold text-[#141821] group-hover:text-[#1E40AF] transition-colors mb-1.5">
                    {profile.archetype}
                  </h2>

                  <p className="text-sm text-[#4A5260] leading-relaxed">{profile.subtitle}</p>
                </div>
              </div>

              <div className="mx-5 mb-5 pt-3 border-t border-[#E2E6EE] flex items-center justify-between gap-2 text-xs text-[#586170]">
                <span className="truncate">{profile.recommendedJobs[0].title}</span>
                <ArrowRight
                  className="w-4 h-4 text-[#1E40AF] shrink-0 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
