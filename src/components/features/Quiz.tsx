'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRandomPersona, WriterPersona } from '@/data/personas';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  Trophy,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  Share2,
  RotateCcw,
  Timer,
  ArrowRight,
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  persona: WriterPersona;
}

interface QuizProps {
  postId?: number;
  category?: string;
  title?: string;
  autoGenerate?: boolean;
}

interface QuizResult {
  score: number;
  total: number;
  personality: string;
  description: string;
  shareText: string;
}

export default function Quiz({
  postId,
  category = 'general',
  title = 'How Well Do You Know This Thread?',
  autoGenerate = true,
}: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  const generateQuiz = useCallback(() => {
    setIsLoading(true);

    // Simulate quiz generation with category-specific questions
    setTimeout(() => {
      const persona = getRandomPersona();
      const generatedQuestions: QuizQuestion[] = getQuestionsForCategory(
        category,
        persona
      );
      setQuestions(generatedQuestions);
      setIsLoading(false);
    }, 1000);
  }, [category]);

  // Generate quiz questions based on category/content
  useEffect(() => {
    if (autoGenerate) {
      generateQuiz();
    }
  }, [category, autoGenerate, generateQuiz]);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setTimeLeft(30);
    setTimerActive(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const finishQuiz = useCallback(() => {
    setTimerActive(false);

    // Calculate results
    const score = selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index]?.correctAnswer ? 1 : 0);
    }, 0);

    const quizResult = calculateResult(score, questions.length);
    setResult(quizResult);
    setShowResults(true);
  }, [selectedAnswers, questions]);

  const handleNextQuestion = useCallback(() => {
    setTimerActive(false);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
      setTimeout(() => setTimerActive(true), 500);
    } else {
      finishQuiz();
    }
  }, [currentQuestion, questions.length, finishQuiz]);

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setTimeLeft(30);
    setTimerActive(false);
    setResult(null);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, handleNextQuestion]);

  if (isLoading) {
    return (
      <div className='quiz-loading py-5 text-center'>
        <LoadingSpinner
          size='lg'
          text='AI is creating your personalized quiz...'
        />
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className='quiz-intro'>
        <div className='quiz-card rounded border p-4'>
          <div className='quiz-header mb-4 text-center'>
            <h3 className='quiz-title'>{title}</h3>
            <p className='quiz-description text-muted'>
              Test your knowledge of this viral Reddit thread! Answer{' '}
              {questions.length} questions and discover your internet
              personality.
            </p>
          </div>

          <div className='quiz-preview mb-4'>
            <div className='row text-center'>
              <div className='col-4'>
                <div className='stat-box'>
                  <h4 className='text-primary'>{questions.length}</h4>
                  <small className='text-muted'>Questions</small>
                </div>
              </div>
              <div className='col-4'>
                <div className='stat-box'>
                  <h4 className='text-warning'>30s</h4>
                  <small className='text-muted'>Per Question</small>
                </div>
              </div>
              <div className='col-4'>
                <div className='stat-box'>
                  <h4 className='text-success'>
                    <Trophy size={24} />
                  </h4>
                  <small className='text-muted'>Get Results</small>
                </div>
              </div>
            </div>
          </div>

          <div className='quiz-actions text-center'>
            <button className='btn btn-primary btn-lg px-5' onClick={startQuiz}>
              <Zap size={20} className='me-2' />
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && result) {
    return (
      <div className='quiz-results'>
        <div className='quiz-card rounded border p-4'>
          <div className='results-header mb-4 text-center'>
            <div className='score-circle position-relative mx-auto mb-3'>
              <div className='score-display'>
                <h2 className='score-number'>
                  {result.score}/{result.total}
                </h2>
                <small className='score-label'>Score</small>
              </div>
            </div>
            <h3 className='personality-type text-primary'>
              {result.personality}
            </h3>
            <p className='personality-description'>{result.description}</p>
          </div>

          <div className='results-breakdown mb-4'>
            {questions.map((question, index) => (
              <div
                key={question.id}
                className='question-result mb-3 rounded border p-3'
              >
                <div className='d-flex align-items-center mb-2'>
                  <span
                    className={`result-icon me-2 ${
                      selectedAnswers[index] === question.correctAnswer
                        ? 'text-success'
                        : 'text-danger'
                    }`}
                  >
                    {selectedAnswers[index] === question.correctAnswer ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                  </span>
                  <small className='text-muted'>Question {index + 1}</small>
                </div>
                <p className='question-text mb-1'>{question.question}</p>
                {selectedAnswers[index] !== question.correctAnswer && (
                  <small className='explanation text-muted'>
                    {question.explanation}
                  </small>
                )}
              </div>
            ))}
          </div>

          <div className='results-actions text-center'>
            <button
              className='btn btn-primary me-3'
              onClick={() => shareResults(result)}
            >
              <Share2 size={16} className='me-2' />
              Share Results
            </button>
            <button className='btn btn-outline-primary' onClick={resetQuiz}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className='quiz-question'>
      <div className='quiz-card rounded border p-4'>
        {/* Progress Bar */}
        <div className='quiz-progress mb-4'>
          <div className='d-flex justify-content-between align-items-center mb-2'>
            <span className='progress-text'>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className={`timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>
              <Timer size={16} className='me-1' />
              {timeLeft}s
            </div>
          </div>
          <div className='progress'>
            <div
              className='progress-bar bg-primary'
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className='question-content mb-4'>
          <h4 className='question-text'>{currentQ?.question}</h4>

          {currentQ?.persona && (
            <div className='question-author mt-2'>
              <small className='text-muted'>
                In the style of <strong>{currentQ.persona.name}</strong>
              </small>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className='answer-options mb-4'>
          {currentQ?.options.map((option, index) => (
            <button
              key={index}
              className={`answer-option btn w-100 mb-2 p-3 text-start ${
                selectedAnswers[currentQuestion] === index
                  ? 'btn-primary'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => handleAnswerSelect(index)}
            >
              <span className='option-letter me-3'>
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className='quiz-navigation text-center'>
          <button
            className='btn btn-primary px-4'
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined}
          >
            {currentQuestion < questions.length - 1
              ? 'Next Question'
              : 'Finish Quiz'}
            <ArrowRight size={16} className='ms-2' />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getQuestionsForCategory(
  category: string,
  persona: WriterPersona
): QuizQuestion[] {
  const baseQuestions = [
    {
      id: 1,
      question: "What's the most viral element of this Reddit thread?",
      options: [
        "The original post's shocking revelation",
        'The comment that went completely off-topic',
        'The unexpected plot twist in the comments',
        'The wholesome ending nobody saw coming',
      ],
      correctAnswer: 2,
      explanation: 'Plot twists in comments often drive the most engagement!',
      persona,
    },
    {
      id: 2,
      question: `How would ${persona.name} describe this thread?`,
      options: [
        'Pure chaos with a hint of humanity',
        'Standard internet nonsense',
        'Surprisingly profound for Reddit',
        'The perfect example of why the internet exists',
      ],
      correctAnswer: 0,
      explanation: `${persona.name}'s ${persona.tone} style would focus on the chaotic elements.`,
      persona,
    },
    {
      id: 3,
      question: 'Which subreddit personality type dominates this thread?',
      options: [
        'The Expert Who Actually Knows Things',
        'The Comedian Making Everything About Puns',
        'The Skeptic Demanding Sources',
        'The Storyteller Sharing Personal Anecdotes',
      ],
      correctAnswer: 3,
      explanation: 'Reddit threads often become story-sharing sessions!',
      persona,
    },
    {
      id: 4,
      question: 'What makes this thread ThreadJuice-worthy?',
      options: [
        'It has exactly the right amount of drama',
        "Someone's life changed in the comments",
        "It's perfectly meme-able",
        'All of the above',
      ],
      correctAnswer: 3,
      explanation: 'The best viral content hits all these notes!',
      persona,
    },
    {
      id: 5,
      question: 'How will this thread be remembered in internet history?',
      options: [
        'As a classic example of Reddit wisdom',
        'As the day the internet broke (again)',
        'As surprisingly wholesome content',
        'As absolute peak internet chaos',
      ],
      correctAnswer: 1,
      explanation: 'The internet breaks daily, but we love it anyway!',
      persona,
    },
  ];

  return baseQuestions;
}

function calculateResult(score: number, total: number): QuizResult {
  const percentage = (score / total) * 100;

  if (percentage >= 80) {
    return {
      score,
      total,
      personality: 'Reddit Sage',
      description:
        'You understand the deep mysteries of viral content. You can spot a trending thread from miles away and predict exactly which comment will become the top reply.',
      shareText: `I scored ${score}/${total} on this ThreadJuice quiz and I'm a Reddit Sage!`,
    };
  } else if (percentage >= 60) {
    return {
      score,
      total,
      personality: 'Meme Connoisseur',
      description:
        'You have a sophisticated understanding of internet culture. You appreciate the artistry behind a well-crafted viral moment.',
      shareText: `I scored ${score}/${total} on this ThreadJuice quiz and I'm a Meme Connoisseur!`,
    };
  } else if (percentage >= 40) {
    return {
      score,
      total,
      personality: 'Casual Browser',
      description:
        "You enjoy the internet's greatest hits but don't dive too deep into the chaos. You're here for a good time, not a long time.",
      shareText: `I scored ${score}/${total} on this ThreadJuice quiz and I'm a Casual Browser!`,
    };
  } else {
    return {
      score,
      total,
      personality: 'Internet Newcomer',
      description:
        "You're still learning the ways of viral content, but everyone starts somewhere! Keep exploring and you'll be a meme master in no time.",
      shareText: `I scored ${score}/${total} on this ThreadJuice quiz and I'm an Internet Newcomer!`,
    };
  }
}

function shareResults(result: QuizResult) {
  if (navigator.share) {
    navigator.share({
      title: 'My ThreadJuice Quiz Results',
      text: result.shareText,
      url: window.location.href,
    });
  } else {
    // Fallback to copying to clipboard
    navigator.clipboard.writeText(
      `${result.shareText} ${window.location.href}`
    );
    alert('Results copied to clipboard!');
  }
}
