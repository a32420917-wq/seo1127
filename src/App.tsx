/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useEffect, useState} from 'react';
import {AppView, Header} from './components/Header';
import {LandingView} from './components/LandingView';
import {QuizView} from './components/QuizView';
import {AxisScore, ResultView} from './components/ResultView';
import {TypesExplorerView} from './components/TypesExplorerView';
import {JobCategoryKey, MBTI_PROFILES, TraitLetter} from './data/mbtiData';
import {
  clearSavedTestResults,
  loadSavedTestResult,
  loadTestHistory,
  SavedTestResult,
  saveTestResult,
} from './utils/resultStorage';

function computeMbtiResult(answers: TraitLetter[]): {
  code: string;
  axisScores: AxisScore[];
} {
  const counts: Record<TraitLetter, number> = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };

  for (const letter of answers) {
    counts[letter] += 1;
  }

  const axes: {
    axisLabel: string;
    leftCode: TraitLetter;
    leftLabel: string;
    rightCode: TraitLetter;
    rightLabel: string;
  }[] = [
    {
      axisLabel: '에너지 방향',
      leftCode: 'E',
      leftLabel: '외향',
      rightCode: 'I',
      rightLabel: '내향',
    },
    {
      axisLabel: '일 처리 방식',
      leftCode: 'S',
      leftLabel: '현실',
      rightCode: 'N',
      rightLabel: '직관',
    },
    {
      axisLabel: '판단 기준',
      leftCode: 'T',
      leftLabel: '원칙',
      rightCode: 'F',
      rightLabel: '공감',
    },
    {
      axisLabel: '근무 리듬',
      leftCode: 'J',
      leftLabel: '계획',
      rightCode: 'P',
      rightLabel: '유연',
    },
  ];

  const axisScores: AxisScore[] = axes.map((ax) => {
    const leftCount = counts[ax.leftCode];
    const rightCount = counts[ax.rightCode];
    const total = leftCount + rightCount || 1;
    const leftPercent = Math.round((leftCount / total) * 100);
    const rightPercent = 100 - leftPercent;
    const winner = leftCount >= rightCount ? ax.leftCode : ax.rightCode;

    return {
      axisLabel: ax.axisLabel,
      leftCode: ax.leftCode,
      leftLabel: ax.leftLabel,
      leftPercent,
      rightCode: ax.rightCode,
      rightLabel: ax.rightLabel,
      rightPercent,
      winner,
    };
  });

  const code = axisScores.map((a) => a.winner).join('');
  return {code, axisScores};
}

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [largeText, setLargeText] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string>('ESFJ');
  const [axisScores, setAxisScores] = useState<AxisScore[] | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [explorerCategory, setExplorerCategory] = useState<JobCategoryKey | 'all'>('all');
  const [latestSavedResult, setLatestSavedResult] = useState<SavedTestResult | null>(() =>
    loadSavedTestResult()
  );
  const [savedHistory, setSavedHistory] = useState<SavedTestResult[]>(() =>
    loadTestHistory()
  );

  // Support opening shared links like /?mbti=ESFJ directly to the result page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedType = params.get('mbti')?.toUpperCase();
    if (sharedType && MBTI_PROFILES[sharedType]) {
      setSelectedCode(sharedType);
      setAxisScores(null);
      setSavedAt(null);
      setIsPreviewMode(true);
      setView('result');
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const clearUrlParam = () => {
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleNavigateLanding = (sectionId?: string) => {
    clearUrlParam();
    setView('landing');
    if (sectionId) {
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({behavior: 'smooth'});
        }
      }, 60);
    } else {
      scrollToTop();
    }
  };

  const handleStartTest = () => {
    clearUrlParam();
    setView('quiz');
    scrollToTop();
  };

  const handleOpenExplorer = (category: JobCategoryKey | 'all' = 'all') => {
    clearUrlParam();
    setExplorerCategory(category);
    setView('explorer');
    scrollToTop();
  };

  const handleCompleteQuiz = (answers: TraitLetter[]) => {
    const result = computeMbtiResult(answers);
    const nowIso = new Date().toISOString();
    const record: SavedTestResult = {
      code: result.code,
      axisScores: result.axisScores,
      savedAt: nowIso,
    };

    saveTestResult(record);
    setLatestSavedResult(record);
    setSavedHistory(loadTestHistory());

    setSelectedCode(result.code);
    setAxisScores(result.axisScores);
    setSavedAt(nowIso);
    setIsPreviewMode(false);
    setView('result');
    scrollToTop();
  };

  const handleLoadSavedResult = (saved: SavedTestResult) => {
    clearUrlParam();
    setSelectedCode(saved.code);
    setAxisScores(saved.axisScores);
    setSavedAt(saved.savedAt);
    setIsPreviewMode(false);
    setView('result');
    scrollToTop();
  };

  const handleClearSavedResults = () => {
    clearSavedTestResults();
    setLatestSavedResult(null);
    setSavedHistory([]);
    setSavedAt(null);
  };

  const handleSelectTypeFromExplorer = (code: string) => {
    setSelectedCode(code);
    setAxisScores(null);
    setSavedAt(null);
    setIsPreviewMode(true);
    setView('result');
    scrollToTop();
  };

  const activeProfile = MBTI_PROFILES[selectedCode] ?? MBTI_PROFILES.ESFJ;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] text-[#141821]">
      <Header
        currentView={view}
        onNavigateLanding={handleNavigateLanding}
        onNavigateExplorer={() => handleOpenExplorer('all')}
        onStartTest={handleStartTest}
      />

      <main className="flex-1">
        {view === 'landing' && (
          <LandingView
            largeText={largeText}
            onToggleLargeText={() => setLargeText((prev) => !prev)}
            onStartTest={handleStartTest}
            onOpenExplorer={handleOpenExplorer}
            onSelectType={handleSelectTypeFromExplorer}
            savedResult={latestSavedResult}
            onOpenSavedResult={handleLoadSavedResult}
          />
        )}

        {view === 'quiz' && (
          <QuizView
            largeText={largeText}
            onToggleLargeText={() => setLargeText((prev) => !prev)}
            onCancel={() => handleNavigateLanding()}
            onComplete={handleCompleteQuiz}
          />
        )}

        {view === 'result' && (
          <ResultView
            profile={activeProfile}
            axisScores={axisScores}
            savedAt={savedAt}
            savedHistory={savedHistory}
            isPreviewMode={isPreviewMode}
            largeText={largeText}
            onToggleLargeText={() => setLargeText((prev) => !prev)}
            onRetakeTest={handleStartTest}
            onOpenExplorer={() => handleOpenExplorer('all')}
            onSelectType={handleSelectTypeFromExplorer}
            onLoadSavedResult={handleLoadSavedResult}
            onClearSavedResults={handleClearSavedResults}
          />
        )}

        {view === 'explorer' && (
          <TypesExplorerView
            selectedCategory={explorerCategory}
            onChangeCategory={setExplorerCategory}
            onSelectType={handleSelectTypeFromExplorer}
            onStartTest={handleStartTest}
            largeText={largeText}
            onToggleLargeText={() => setLargeText((prev) => !prev)}
          />
        )}
      </main>

      <footer className="border-t border-[#E2E6EE] bg-white py-10">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <a
              href="https://www.cascsniorclub.co.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] rounded-sm"
            >
              <img
                src="/assets/aistudio/image_81928053.png"
                alt="사회복지법인 중문복지재단 천안시니어클럽 홈페이지 바로가기"
                referrerPolicy="no-referrer"
                className="h-9 w-auto object-contain"
              />
            </a>
            <p className="text-sm text-[#58635E]">
              시니어 일자리 나침반 · 은퇴 후 나에게 맞는 일과 역할을 찾아가는 시니어 성향 탐색 안내서
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-[#4A5550]">
            <button
              type="button"
              onClick={() => handleNavigateLanding('about-axes')}
              className="hover:text-[#141821] hover:underline underline-offset-4 cursor-pointer"
            >
              성향 분석 원리
            </button>
            <button
              type="button"
              onClick={() => handleOpenExplorer('all')}
              className="hover:text-[#141821] hover:underline underline-offset-4 cursor-pointer"
            >
              16가지 유형
            </button>
            <button
              type="button"
              onClick={() => handleNavigateLanding('faq-section')}
              className="hover:text-[#141821] hover:underline underline-offset-4 cursor-pointer"
            >
              자주 묻는 질문
            </button>
            <a
              href="https://www.cascsniorclub.co.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#141821] hover:text-[#1E40AF] hover:underline underline-offset-4"
            >
              천안시니어클럽 홈페이지 ↗
            </a>
            <button
              type="button"
              onClick={handleStartTest}
              className="font-semibold text-[#1E40AF] hover:underline underline-offset-4 cursor-pointer"
            >
              테스트 시작하기
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
