import {
  ArrowRight,
  BookmarkCheck,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Download,
  ExternalLink,
  History,
  Lightbulb,
  MapPin,
  MessageCircle,
  Printer,
  RotateCcw,
  Smartphone,
  Trash2,
  Type,
  Users,
} from 'lucide-react';
import {useState} from 'react';
import {JOB_CATEGORIES, MBTI_PROFILES, MbtiProfile} from '../data/mbtiData';
import {exportResultAsPng} from '../utils/resultImageExport';
import {formatKoreanDate, SavedTestResult} from '../utils/resultStorage';
import {SafeImage} from './SafeImage';

export interface AxisScore {
  axisLabel: string;
  leftCode: string;
  leftLabel: string;
  leftPercent: number;
  rightCode: string;
  rightLabel: string;
  rightPercent: number;
  winner: string;
}

interface ResultViewProps {
  profile: MbtiProfile;
  axisScores: AxisScore[] | null;
  savedAt: string | null;
  savedHistory: SavedTestResult[];
  isPreviewMode: boolean;
  largeText: boolean;
  onToggleLargeText: () => void;
  onRetakeTest: () => void;
  onOpenExplorer: () => void;
  onSelectType: (code: string) => void;
  onLoadSavedResult: (saved: SavedTestResult) => void;
  onClearSavedResults: () => void;
}

export function ResultView({
  profile,
  axisScores,
  savedAt,
  savedHistory,
  isPreviewMode,
  largeText,
  onToggleLargeText,
  onRetakeTest,
  onOpenExplorer,
  onSelectType,
  onLoadSavedResult,
  onClearSavedResults,
}: ResultViewProps) {
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const categoryInfo = JOB_CATEGORIES[profile.category];
  const partnerProfile = MBTI_PROFILES[profile.bestMatch.code];
  const top3Jobs = profile.recommendedJobs.slice(0, 3);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?mbti=${profile.code}`
      : '';

  const buildShareText = () => {
    return [
      `[시니어 일자리 나침반 · 성향 테스트 결과]`,
      `나의 유형: ${profile.code} (${profile.archetype})`,
      `${profile.subtitle}`,
      ``,
      `추천 시니어 일자리 TOP 3`,
      ...top3Jobs.map((job, idx) => `${idx + 1}. ${job.title} (${job.programType})`),
      ``,
      `결과 자세히 보기: ${shareUrl}`,
    ].join('\n');
  };

  const smsHref = `sms:?body=${encodeURIComponent(buildShareText())}`;

  const showNotice = (message: string) => {
    setActionNotice(message);
    window.setTimeout(() => {
      setActionNotice((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  const handleKakaoShare = async () => {
    const text = buildShareText();
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `시니어 일자리 MBTI 결과: ${profile.code} (${profile.archetype})`,
          text,
          url: shareUrl,
        });
        showNotice('공유 창이 열렸습니다. 카카오톡을 선택해 전달해 보세요.');
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      showNotice(
        '카카오톡에 바로 붙여넣을 수 있도록 결과 내용과 주소가 복사되었습니다.'
      );
    } catch {
      showNotice('공유 문구를 복사하지 못했습니다. 결과 요약 복사 버튼을 이용해 주세요.');
    }
  };

  const handleSmsClick = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(buildShareText()).catch(() => {});
    }
    showNotice(
      '문자 앱이 열리지 않는 PC 환경에서는 내용이 복사되었으니 문자 메시지에 붙여넣어 주세요.'
    );
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      showNotice('결과 요약과 추천 직무 3가지가 클립보드에 복사되었습니다.');
    } catch {
      showNotice('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const handleDownloadImage = async () => {
    if (isExportingImage) return;
    setIsExportingImage(true);
    try {
      await exportResultAsPng(profile, axisScores);
      showNotice(`결과 카드 이미지(천안시니어클럽_일자리MBTI_${profile.code}.png)가 저장되었습니다.`);
    } catch {
      showNotice('이미지 저장 중 문제가 발생했습니다. 아래 결과지 인쇄하기를 이용해 보세요.');
    } finally {
      setIsExportingImage(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`max-w-[1120px] mx-auto px-5 sm:px-8 py-8 sm:py-12 ${
        largeText ? 'text-[19px] leading-[1.8]' : 'text-[17px] leading-[1.7]'
      }`}
    >
      {/* Print-only Institutional CI Header */}
      <div className="hidden print:flex items-center justify-between pb-4 mb-6 border-b border-[#E2E6EE]">
        <img
          src="/assets/aistudio/image_81928053.png"
          alt="사회복지법인 중문복지재단 천안시니어클럽"
          referrerPolicy="no-referrer"
          className="h-9 w-auto object-contain"
        />
        <span className="text-sm font-medium text-[#4A5260]">
          시니어 일자리 성향 테스트 결과지
        </span>
      </div>

      {/* Top Status & Large Text Controls */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E6EE]">
        {isPreviewMode ? (
          <div className="flex flex-wrap items-center gap-3 text-[15px] text-[#4A5550]">
            <span>16가지 유형 미리보기 화면입니다</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onRetakeTest}
              className="font-semibold text-[#1E40AF] hover:underline underline-offset-4 cursor-pointer"
            >
              내 성향 직접 테스트하기 →
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-[#1E40AF]">
            <BookmarkCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>
              이 기기에 자동 저장되었습니다
              {savedAt ? ` (${formatKoreanDate(savedAt)})` : ''}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleLargeText}
          aria-pressed={largeText}
          className={`inline-flex items-center gap-2 px-4 py-2 text-[15px] font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] ${
            largeText
              ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
              : 'bg-white text-[#2A332F] border-[#D4DBD7] hover:bg-[#F1F5F9]'
          }`}
        >
          <Type className="w-4 h-4" aria-hidden="true" />
          <span>{largeText ? '큰 글씨 켜짐' : '글씨 더 크게'}</span>
        </button>
      </div>

      {/* Hero Result Summary Card */}
      <section className="bg-white border border-[#E2E6EE] rounded-2xl overflow-hidden mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[15px] text-[#4A5550] mb-3">
                <Compass className="w-4 h-4 text-[#1E40AF] shrink-0" aria-hidden="true" />
                <span className="font-semibold text-[#1E40AF]">{categoryInfo.title}</span>
                <span aria-hidden="true">·</span>
                <span>{profile.keywords.join(' · ')}</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-4 mb-3">
                <span className="font-code text-5xl sm:text-6xl font-bold tracking-tight text-[#1E40AF] tabular-nums">
                  {profile.code}
                </span>
                <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#141821]">
                  {profile.archetype}
                </h1>
              </div>

              <p
                className={`font-semibold text-[#141821] mb-4 ${
                  largeText ? 'text-[22px] leading-[1.5]' : 'text-[20px] leading-[1.5]'
                }`}
              >
                {profile.subtitle}
              </p>

              <p className="text-[#4A5550] leading-relaxed">{profile.summary}</p>
            </div>

            {/* Share & Save Action Bar */}
            <div className="no-print mt-8 pt-6 border-t border-[#E2E6EE] space-y-3">
              <div className="text-sm font-semibold text-[#2A332F]">
                결과 공유 및 보관하기
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleKakaoShare}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[16px] font-bold text-[#191600] bg-[#FEE500] hover:bg-[#F3DA00] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[50px]"
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  <span>카카오톡 공유</span>
                </button>

                <a
                  href={smsHref}
                  onClick={handleSmsClick}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[16px] font-semibold text-white bg-[#1E40AF] hover:bg-[#173187] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[50px]"
                >
                  <Smartphone className="w-5 h-5" aria-hidden="true" />
                  <span>문자로 보내기</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isExportingImage}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[16px] font-semibold text-[#141821] bg-white border border-[#BFCAC4] hover:bg-[#F1F5F9] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 min-h-[50px]"
                >
                  <Download className="w-5 h-5 text-[#1E40AF]" aria-hidden="true" />
                  <span>{isExportingImage ? '이미지 만드는 중...' : '이미지로 저장'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 text-[15px] font-medium text-[#2A332F] bg-[#F8F9FB] border border-[#DCE2EC] hover:bg-[#EEF2F7] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[50px]"
                >
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>글로 복사</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 text-[15px] font-medium text-[#2A332F] bg-[#F8F9FB] border border-[#DCE2EC] hover:bg-[#EEF2F7] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[50px]"
                >
                  <Printer className="w-4 h-4" aria-hidden="true" />
                  <span>인쇄하기</span>
                </button>
              </div>

              {actionNotice && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-2 p-3.5 rounded-xl bg-[#EFF4FF] border border-[#C7D7F5] text-[15px] font-medium text-[#1E40AF] flex items-center gap-2"
                >
                  <Check className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>{actionNotice}</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F4F7FC] border-t lg:border-t-0 lg:border-l border-[#E2E6EE] p-6 sm:p-8 flex items-center justify-center">
            <div className="w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden bg-white border border-[#DCE4F2]">
              <SafeImage
                src={profile.characterImage}
                alt={profile.characterAlt}
                fallbackTitle={`${profile.code} · ${profile.archetype}`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4-Axis Score Breakdown */}
      {axisScores && (
        <section className="bg-white border border-[#E2E6EE] rounded-2xl p-6 sm:p-8 mb-8">
          <div className="mb-6">
            <h2 className="font-display text-2xl sm:text-[26px] font-bold text-[#141821] mb-1">
              나의 4가지 일터 성향 균형
            </h2>
            <p className="text-[15px] text-[#4A5550]">
              응답하신 12개 문항을 바탕으로 계산된 성향 비율입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {axisScores.map((item) => {
              const leftWins = item.winner === item.leftCode;
              return (
                <div
                  key={item.axisLabel}
                  className="p-5 rounded-xl bg-[#F8F9F8] border border-[#E2E6EE]"
                >
                  <div className="flex items-center justify-between text-[15px] mb-2">
                    <span className="font-medium text-[#4A5550]">{item.axisLabel}</span>
                    <span className="font-bold text-[#1E40AF]">
                      우세: {leftWins ? item.leftLabel : item.rightLabel} ({item.winner})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[16px] font-semibold text-[#141821] mb-2.5">
                    <span className={leftWins ? 'text-[#1E40AF]' : 'text-[#58635E]'}>
                      {item.leftLabel} ({item.leftCode}){' '}
                      <span className="font-code tabular-nums">{item.leftPercent}%</span>
                    </span>
                    <span className={!leftWins ? 'text-[#1E40AF]' : 'text-[#58635E]'}>
                      <span className="font-code tabular-nums">{item.rightPercent}%</span>{' '}
                      {item.rightLabel} ({item.rightCode})
                    </span>
                  </div>

                  <div className="w-full h-3.5 rounded-full bg-[#DCE2DF] overflow-hidden flex">
                    <div
                      className={`h-full ${leftWins ? 'bg-[#1E40AF]' : 'bg-[#93B4E8]'}`}
                      style={{width: `${item.leftPercent}%`}}
                    />
                    <div
                      className={`h-full ${!leftWins ? 'bg-[#1E40AF]' : 'bg-[#93B4E8]'}`}
                      style={{width: `${item.rightPercent}%`}}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recommended Top 3 Jobs with Detailed Breakdown & Intuitive Icons */}
      <section className="mb-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1E40AF] mb-1.5">
            <Briefcase className="w-5 h-5" aria-hidden="true" />
            <span>성향 맞춤 시니어 일자리 추천</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141821]">
            {profile.code} 어르신께 꼭 맞는 추천 직무 3가지
          </h2>
        </div>

        <div className="space-y-5">
          {top3Jobs.map((job, idx) => (
            <article
              key={job.title}
              className="bg-white border border-[#E2E6EE] rounded-2xl p-6 sm:p-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="font-code inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#1E40AF] text-white font-bold text-base tabular-nums shrink-0">
                      0{idx + 1}
                    </span>
                    <h3
                      className={`font-bold text-[#141821] ${
                        largeText ? 'text-2xl' : 'text-xl sm:text-2xl'
                      }`}
                    >
                      {job.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[15px] text-[#4A5550] mb-4 pl-0 sm:pl-12">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#1E40AF]">
                      <Briefcase className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{job.programType}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#58635E] shrink-0" aria-hidden="true" />
                      <span>{job.schedule}</span>
                    </span>
                  </div>

                  <div className="space-y-3 pl-0 sm:pl-12">
                    <div className="flex items-start gap-2.5 text-[#2A332F]">
                      <CheckCircle2
                        className="w-5 h-5 text-[#1E40AF] shrink-0 mt-1"
                        aria-hidden="true"
                      />
                      <div>
                        <span className="font-semibold text-[#141821]">추천 이유 및 직무 설명: </span>
                        <span className="text-[#3C4641]">{job.reason}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-[#2A332F]">
                      <MapPin
                        className="w-5 h-5 text-[#1E40AF] shrink-0 mt-1"
                        aria-hidden="true"
                      />
                      <div>
                        <span className="font-semibold text-[#141821]">신청 및 시작하는 곳: </span>
                        <span className="text-[#3C4641]">{job.howToStart}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Strengths, Gentle Tip & Best Match */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-7 bg-white border border-[#E2E6EE] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-[#1E40AF] font-semibold text-[15px] mb-2">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>일터 강점 & 활동 조언</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#141821] mb-4">
            일터에서 빛나는 나의 강점
          </h2>
          <ul className="space-y-3.5 mb-6">
            {profile.strengths.map((str, i) => (
              <li key={str} className="flex items-start gap-3 text-[#2A332F]">
                <span className="font-code text-base font-bold text-[#1E40AF] tabular-nums mt-0.5 shrink-0">
                  0{i + 1}.
                </span>
                <span>{str}</span>
              </li>
            ))}
          </ul>

          <div className="pt-5 border-t border-[#E2E6EE] flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#1E40AF] shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h3 className="text-[17px] font-bold text-[#141821] mb-1">
                지치지 않고 오래 일하기 위한 한 가지 팁
              </h3>
              <p className="text-[#4A5550]">{profile.caution}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#F4F7FC] border border-[#D6E2F5] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1E40AF] mb-4">
              <Users className="w-5 h-5" aria-hidden="true" />
              <span>함께 일하면 시너지가 좋은 동료</span>
            </div>
            <div className="flex items-center gap-4 mb-3">
              {partnerProfile && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#D6E2F5] shrink-0">
                  <SafeImage
                    src={partnerProfile.characterImage}
                    alt={partnerProfile.characterAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <span className="font-code text-2xl font-bold text-[#1E40AF] tabular-nums block leading-tight">
                  {profile.bestMatch.code}
                </span>
                <span className="font-display text-xl font-bold text-[#141821]">
                  {partnerProfile?.archetype}
                </span>
              </div>
            </div>
            <p className="text-[#4A5550] leading-relaxed">{profile.bestMatch.reason}</p>
          </div>

          {partnerProfile && (
            <button
              type="button"
              onClick={() => onSelectType(partnerProfile.code)}
              className="no-print inline-flex items-center justify-between w-full px-5 py-3.5 text-[16px] font-semibold text-[#1E40AF] bg-white border border-[#C7D7F5] hover:border-[#1E40AF] rounded-xl transition-colors cursor-pointer min-h-[50px]"
            >
              <span>{partnerProfile.code} 유형 일자리 함께 보기</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>

      {/* Saved Local History Section */}
      {savedHistory.length > 0 && (
        <section className="no-print bg-white border border-[#E2E6EE] rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#1E40AF]" aria-hidden="true" />
              <h2 className="font-display text-xl font-bold text-[#141821]">
                이 기기에 저장된 최근 테스트 기록
              </h2>
            </div>

            <button
              type="button"
              onClick={onClearSavedResults}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#58635E] hover:text-[#B91C1C] cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-[#FEF2F2] transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>저장 기록 지우기</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedHistory.map((item) => {
              const p = MBTI_PROFILES[item.code];
              if (!p) return null;
              const isCurrent = !isPreviewMode && savedAt === item.savedAt;
              return (
                <button
                  key={`${item.code}-${item.savedAt}`}
                  type="button"
                  onClick={() => onLoadSavedResult(item)}
                  className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#EFF4FF] border-[#1E40AF]'
                      : 'bg-[#FAFBFB] border-[#DCE2DF] hover:border-[#1E40AF]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-code text-lg font-bold text-[#1E40AF] tabular-nums">
                      {item.code}
                    </span>
                    <span className="text-xs text-[#58635E]">
                      {formatKoreanDate(item.savedAt)}
                    </span>
                  </div>
                  <div className="font-semibold text-[15px] text-[#141821]">{p.archetype}</div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Bottom Action Bar */}
      <div className="no-print pt-6 border-t border-[#E2E6EE] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRetakeTest}
            className="inline-flex items-center gap-2 px-6 py-4 text-[17px] font-semibold text-white bg-[#1E40AF] hover:bg-[#173187] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[54px]"
          >
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
            <span>테스트 다시 하기</span>
          </button>

          <a
            href="https://www.cascsniorclub.co.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-4 text-[17px] font-semibold text-[#1E40AF] bg-[#EFF4FF] border border-[#C7D7F5] hover:border-[#1E40AF] rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[54px]"
          >
            <span>천안시니어클럽 홈페이지 바로가기</span>
            <ExternalLink className="w-5 h-5" aria-hidden="true" />
          </a>
        </div>

        <button
          type="button"
          onClick={onOpenExplorer}
          className="inline-flex items-center gap-2 px-6 py-4 text-[17px] font-medium text-[#141821] bg-white border border-[#D4DBD7] hover:bg-[#F1F5F9] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[54px]"
        >
          <span>16가지 전체 유형 둘러보기</span>
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
