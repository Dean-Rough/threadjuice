'use client';

import { useState, useCallback, useEffect } from 'react';
import { WOWAnimation } from '@/components/elements/WOWAnimation';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  title?: string;
  description?: string;
  onComplete?: (score: number, answers: Record<string, string>) => void;
  showProgress?: boolean;
  allowReview?: boolean;
  timeLimit?: number; // in seconds
  variant?: 'default' | 'card' | 'inline' | 'modal';
  className?: string;
}

interface QuizState {
  currentQuestion: number;
  answers: Record<string, string>;
  showResult: boolean;
  score: number;
  timeRemaining?: number;
}

export const Quiz: React.FC<QuizProps> = ({
  questions,
  title = 'Interactive Quiz',
  description,
  onComplete,
  showProgress = true,
  allowReview = true,
  timeLimit,
  variant = 'default',
  className = '',
}) => {
  const [state, setState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    showResult: false,
    score: 0,
    timeRemaining: timeLimit,
  });

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);

  // Timer effect
  useEffect(() => {
    if (
      timeLimit &&
      state.timeRemaining &&
      state.timeRemaining > 0 &&
      !state.showResult
    ) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining ? prev.timeRemaining - 1 : 0,
        }));
      }, 1000);

      return () => clearTimeout(timer);
    } else if (state.timeRemaining === 0 && !state.showResult) {
      handleQuizComplete();
    }
  }, [state.timeRemaining, state.showResult, timeLimit]);

  const currentQuestionData = questions[state.currentQuestion];
  const isLastQuestion = state.currentQuestion === questions.length - 1;
  const hasAnswered = selectedOption !== '';

  const handleOptionSelect = useCallback((optionId: string) => {
    setSelectedOption(optionId);
    setShowExplanation(false);
  }, []);

  const handleNext = useCallback(() => {
    if (!hasAnswered) return;

    const newAnswers = {
      ...state.answers,
      [currentQuestionData.id]: selectedOption,
    };

    setState(prev => ({
      ...prev,
      answers: newAnswers,
    }));

    if (isLastQuestion) {
      handleQuizComplete(newAnswers);
    } else {
      setState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        answers: newAnswers,
      }));
      setSelectedOption('');
      setShowExplanation(false);
    }
  }, [
    hasAnswered,
    selectedOption,
    currentQuestionData.id,
    isLastQuestion,
    state.answers,
  ]);

  const handleQuizComplete = useCallback(
    (finalAnswers = state.answers) => {
      const score = questions.reduce((acc, question) => {
        const userAnswer = finalAnswers[question.id];
        const correctOption = question.options.find(opt => opt.isCorrect);
        return acc + (userAnswer === correctOption?.id ? 1 : 0);
      }, 0);

      setState(prev => ({
        ...prev,
        showResult: true,
        score,
      }));

      if (onComplete) {
        onComplete(score, finalAnswers);
      }
    },
    [questions, state.answers, onComplete]
  );

  const handleRestart = useCallback(() => {
    setState({
      currentQuestion: 0,
      answers: {},
      showResult: false,
      score: 0,
      timeRemaining: timeLimit,
    });
    setSelectedOption('');
    setShowExplanation(false);
  }, [timeLimit]);

  const handleShowExplanation = useCallback(() => {
    setShowExplanation(true);
  }, []);

  const getScorePercentage = () => (state.score / questions.length) * 100;
  const getScoreGrade = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return { grade: 'A+', color: '#10b981' };
    if (percentage >= 80) return { grade: 'A', color: '#059669' };
    if (percentage >= 70) return { grade: 'B', color: '#d97706' };
    if (percentage >= 60) return { grade: 'C', color: '#dc2626' };
    return { grade: 'F', color: '#991b1b' };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const quizClasses = `sarsa-quiz sarsa-quiz--${variant} ${className}`.trim();

  if (state.showResult) {
    const { grade, color } = getScoreGrade();

    return (
      <div className={quizClasses}>
        <WOWAnimation animation='zoomIn' className='sarsa-quiz__result'>
          <div className='sarsa-quiz__result-container'>
            <div className='sarsa-quiz__result-header'>
              <div className='sarsa-quiz__result-grade' style={{ color }}>
                {grade}
              </div>
              <h3 className='sarsa-quiz__result-title'>Quiz Complete!</h3>
            </div>

            <div className='sarsa-quiz__result-stats'>
              <div className='sarsa-quiz__result-stat'>
                <span className='sarsa-quiz__result-stat-number'>
                  {state.score}
                </span>
                <span className='sarsa-quiz__result-stat-label'>Correct</span>
              </div>
              <div className='sarsa-quiz__result-stat'>
                <span className='sarsa-quiz__result-stat-number'>
                  {questions.length}
                </span>
                <span className='sarsa-quiz__result-stat-label'>Total</span>
              </div>
              <div className='sarsa-quiz__result-stat'>
                <span className='sarsa-quiz__result-stat-number'>
                  {Math.round(getScorePercentage())}%
                </span>
                <span className='sarsa-quiz__result-stat-label'>Score</span>
              </div>
            </div>

            <div className='sarsa-quiz__result-actions'>
              <button
                onClick={handleRestart}
                className='sarsa-quiz__result-btn sarsa-quiz__result-btn--primary'
              >
                <i className='fas fa-redo'></i>
                Try Again
              </button>
              {allowReview && (
                <button
                  onClick={() =>
                    setState(prev => ({
                      ...prev,
                      showResult: false,
                      currentQuestion: 0,
                    }))
                  }
                  className='sarsa-quiz__result-btn sarsa-quiz__result-btn--secondary'
                >
                  <i className='fas fa-eye'></i>
                  Review Answers
                </button>
              )}
            </div>
          </div>
        </WOWAnimation>
      </div>
    );
  }

  return (
    <div className={quizClasses}>
      <div className='sarsa-quiz__container'>
        {/* Quiz Header */}
        <WOWAnimation animation='fadeInDown' className='sarsa-quiz__header'>
          <div className='sarsa-quiz__title-area'>
            <h2 className='sarsa-quiz__title'>{title}</h2>
            {description && (
              <p className='sarsa-quiz__description'>{description}</p>
            )}
          </div>

          {/* Progress and Timer */}
          <div className='sarsa-quiz__meta'>
            {showProgress && (
              <div className='sarsa-quiz__progress'>
                <div className='sarsa-quiz__progress-text'>
                  Question {state.currentQuestion + 1} of {questions.length}
                </div>
                <div className='sarsa-quiz__progress-bar'>
                  <div
                    className='sarsa-quiz__progress-fill'
                    style={{
                      width: `${((state.currentQuestion + 1) / questions.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {timeLimit && state.timeRemaining !== undefined && (
              <div
                className={`sarsa-quiz__timer ${
                  state.timeRemaining < 30 ? 'sarsa-quiz__timer--warning' : ''
                }`}
              >
                <i className='fas fa-clock'></i>
                <span>{formatTime(state.timeRemaining)}</span>
              </div>
            )}
          </div>
        </WOWAnimation>

        {/* Question Card */}
        <WOWAnimation
          animation='fadeInUp'
          delay={200}
          className='sarsa-quiz__question-card'
        >
          <div className='sarsa-quiz__question-header'>
            <div className='sarsa-quiz__question-meta'>
              {currentQuestionData.category && (
                <span className='sarsa-quiz__question-category'>
                  {currentQuestionData.category}
                </span>
              )}
              {currentQuestionData.difficulty && (
                <span
                  className={`sarsa-quiz__question-difficulty sarsa-quiz__question-difficulty--${currentQuestionData.difficulty}`}
                >
                  {currentQuestionData.difficulty}
                </span>
              )}
            </div>
          </div>

          <h3 className='sarsa-quiz__question-text'>
            {currentQuestionData.question}
          </h3>

          <div className='sarsa-quiz__options'>
            {currentQuestionData.options.map((option, index) => (
              <WOWAnimation
                key={option.id}
                animation='fadeInLeft'
                delay={300 + index * 100}
              >
                <button
                  onClick={() => handleOptionSelect(option.id)}
                  className={`sarsa-quiz__option ${
                    selectedOption === option.id
                      ? 'sarsa-quiz__option--selected'
                      : ''
                  } ${
                    showExplanation && option.isCorrect
                      ? 'sarsa-quiz__option--correct'
                      : ''
                  } ${
                    showExplanation &&
                    selectedOption === option.id &&
                    !option.isCorrect
                      ? 'sarsa-quiz__option--incorrect'
                      : ''
                  }`}
                  disabled={showExplanation}
                >
                  <div className='sarsa-quiz__option-marker'>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className='sarsa-quiz__option-text'>{option.text}</span>
                  {showExplanation && option.isCorrect && (
                    <i className='sarsa-quiz__option-icon fas fa-check'></i>
                  )}
                  {showExplanation &&
                    selectedOption === option.id &&
                    !option.isCorrect && (
                      <i className='sarsa-quiz__option-icon fas fa-times'></i>
                    )}
                </button>
              </WOWAnimation>
            ))}
          </div>

          {/* Explanation */}
          {showExplanation &&
            (currentQuestionData.explanation ||
              currentQuestionData.options.find(o => o.id === selectedOption)
                ?.explanation) && (
              <WOWAnimation
                animation='fadeIn'
                className='sarsa-quiz__explanation'
              >
                <div className='sarsa-quiz__explanation-header'>
                  <i className='fas fa-lightbulb'></i>
                  <span>Explanation</span>
                </div>
                <p className='sarsa-quiz__explanation-text'>
                  {currentQuestionData.explanation ||
                    currentQuestionData.options.find(
                      o => o.id === selectedOption
                    )?.explanation}
                </p>
              </WOWAnimation>
            )}

          {/* Actions */}
          <div className='sarsa-quiz__actions'>
            {hasAnswered &&
              !showExplanation &&
              currentQuestionData.explanation && (
                <button
                  onClick={handleShowExplanation}
                  className='sarsa-quiz__action-btn sarsa-quiz__action-btn--secondary'
                >
                  <i className='fas fa-question-circle'></i>
                  Show Explanation
                </button>
              )}

            <button
              onClick={handleNext}
              disabled={!hasAnswered}
              className='sarsa-quiz__action-btn sarsa-quiz__action-btn--primary'
            >
              <span>{isLastQuestion ? 'Finish Quiz' : 'Next Question'}</span>
              <i
                className={`fas ${isLastQuestion ? 'fa-flag-checkered' : 'fa-arrow-right'}`}
              ></i>
            </button>
          </div>
        </WOWAnimation>
      </div>
    </div>
  );
};

export default Quiz;
