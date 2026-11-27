import {ArrowLeft, Check, RotateCcw, Type} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {QUIZ_QUESTIONS, TraitLetter} from '../data/mbtiData';

interface QuizViewProps {
  largeText: boolean;
  onToggleLargeText: () => void;
  onCancel: () => void;
  onComplete: (answers: TraitLetter[]) => void;
}

export function QuizView({
  largeText,
  onToggleLargeText,
  onCancel,
  onComplete,
}: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(TraitLetter | null)[]>(
    () => Array(QUIZ_QUESTIONS.length).fill(null)
  );
  const [pendingLetter, setPendingLetter] = useState<TraitLetter | null>(null);
  const timerRef = useRef<number | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const selectedForCurrent = pendingLetter ?? answers[currentIndex];

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSelect = (letter: TraitLetter) => {
    if (pendingLetter !== null) {
      return;
    }

    const updated = [...answers];
    updated[currentIndex] = letter;
    setAnswers(updated);
    setPendingLetter(letter);

    timerRef.current = window.setTimeout(() => {
      setPendingLetter(null);
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onComplete(updated as TraitLetter[]);
      }
    }, 180);
  };

  const handlePrev = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      setPendingLetter(null);
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      setPendingLetter(null);
    }
    setAnswers(Array(QUIZ_QUESTIONS.length).fill(null));
    setCurrentIndex(0);
  };

  return (
    <section className="max-w-[820px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
      {/* Top Toolbar & Progress */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5 text-sm font-medium text-[#4A5260]">
            <span className="font-code font-bold text-[#1E40AF] text-base tabular-nums">
              {String(currentIndex + 1).padStart(2, '0')} / {totalQuestions}
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentQuestion.axisTitle}</span>
          </div>

          <button
            type="button"
            onClick={onToggleLargeText}
            aria-pressed={largeText}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] ${
              largeText
                ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                : 'bg-white text-[#2A313D] border-[#D4DAE4] hover:bg-[#F1F5F9]'
            }`}
          >
            <Type className="w-4 h-4" aria-hidden="true" />
            <span>{largeText ? '큰 글씨 켜짐' : '큰 글씨'}</span>
          </button>
        </div>

        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`테스트 진행률 ${progressPercent}%`}
          className="w-full h-2.5 bg-[#E2E6EE] rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-[#1E40AF] transition-transform duration-200 origin-left"
            style={{transform: `scaleX(${(currentIndex + 1) / totalQuestions})`}}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-[#E2E6EE] rounded-2xl p-6 sm:p-10">
        <h1
          className={`font-display font-bold text-[#141821] text-balance mb-8 ${
            largeText ? 'text-2xl sm:text-[30px] leading-[1.45]' : 'text-xl sm:text-[26px] leading-[1.45]'
          }`}
        >
          {currentQuestion.prompt}
        </h1>

        <div className="space-y-4">
          {[
            {key: 'A', choice: currentQuestion.choiceA},
            {key: 'B', choice: currentQuestion.choiceB},
          ].map(({key, choice}) => {
            const isSelected = selectedForCurrent === choice.letter;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(choice.letter)}
                aria-pressed={isSelected}
                className={`w-full text-left p-5 sm:p-6 rounded-xl border transition-colors flex items-start gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] min-h-[88px] ${
                  isSelected
                    ? 'bg-[#EFF4FF] border-[#1E40AF] text-[#141821]'
                    : 'bg-[#FAFBFD] border-[#DCE2EC] hover:bg-[#F4F7FC] hover:border-[#93B4E8] text-[#141821]'
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-code font-bold text-base shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? 'bg-[#1E40AF] text-white'
                      : 'bg-white border border-[#CFD6E2] text-[#2A313D]'
                  }`}
                >
                  {isSelected ? <Check className="w-5 h-5" aria-hidden="true" /> : key}
                </span>

                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold text-[#141821] mb-1 ${
                      largeText ? 'text-[19px] leading-[1.5]' : 'text-[17px] leading-[1.5]'
                    }`}
                  >
                    {choice.label}
                  </div>
                  <div
                    className={`text-[#4A5260] ${
                      largeText ? 'text-[16px] leading-[1.55]' : 'text-[14px] leading-[1.55]'
                    }`}
                  >
                    {choice.detail}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Controls */}
        <div className="mt-8 pt-6 border-t border-[#E2E6EE] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[15px] font-medium rounded-lg border border-[#D4DAE4] text-[#2A313D] bg-white hover:bg-[#F1F5F9] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>이전 문항</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[15px] font-medium rounded-lg text-[#4A5260] hover:text-[#141821] hover:bg-[#F1F5F9] transition-colors cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>처음부터</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-[14px] font-medium text-[#586170] hover:text-[#141821] hover:underline underline-offset-4 cursor-pointer py-2 px-1"
          >
            안내 화면으로 나가기
          </button>
        </div>
      </div>
    </section>
  );
}
