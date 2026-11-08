import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, RefreshCw, Zap, BookOpen } from 'lucide-react';
import { checkAnswer } from './utils';

const BASE_URL = import.meta.env.BASE_URL + 'images/';

function ZenModeSession({ exam, quizData, stats, setStats, mistakes, setMistakes, onSwitchExam, onExit }) {
  // Only quiz on slides that actually have questions
  const validSlides = (quizData || []).filter(s => s.questions && s.questions.length > 0);

  const pickRandomIndex = () => {
    if (validSlides.length === 0) return 0;
    // Heavy emphasis on first 25 slides
    const focusLimit = Math.min(25, validSlides.length);
    const rand = Math.random();
    if (rand < 0.7) {
      return Math.floor(Math.random() * focusLimit);
    } else {
      return Math.floor(Math.random() * validSlides.length);
    }
  };

  const [currentIndex, setCurrentIndex] = useState(pickRandomIndex());
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showLabeled, setShowLabeled] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);

  if (validSlides.length === 0) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>No questions available</h2>
        <button className="btn btn-primary" onClick={onExit} style={{ marginTop: '20px' }}>
          Back to Main Quiz
        </button>
      </div>
    );
  }

  const currentQuiz = validSlides[currentIndex] || validSlides[0];
  const examTitle = exam === 'exam1'
    ? 'Exam 1: Sensory Systems'
    : exam === 'exam2'
      ? 'Exam 2: Motor, Cranial Nerves, Ear & Eye'
      : exam === 'exam3'
        ? 'Exam 3: New Material (Blue Structures Only)'
        : exam === 'exam3_focus'
          ? 'Exam 3 Practical Focus (2026 Focus Sheet)'
          : 'Comprehensive Practical: All Structures';

  const handleInputChange = (letter, value) => {
    setAnswers(prev => ({ ...prev, [letter]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitted || !canSubmit) return;

    setSubmitted(true);

    const newStats = { ...stats };
    const newMistakes = { ...mistakes };

    currentQuiz.questions.forEach(q => {
      const isCorrect = checkAnswer(answers[q.letter] || '', q.answer);
      if (!newStats[q.answer]) {
        newStats[q.answer] = { correct: 0, total: 0 };
      }
      newStats[q.answer].total += 1;

      const mistakeKey = `${exam}_${currentQuiz.id}_${q.letter}`;

      if (isCorrect) {
        newStats[q.answer].correct += 1;
      } else {
        if (!newMistakes[mistakeKey]) {
          newMistakes[mistakeKey] = {
            id: mistakeKey,
            exam: exam,
            slideId: currentQuiz.id,
            letter: q.letter,
            description: q.description,
            answer: q.answer,
            unlabeled_image: currentQuiz.unlabeled_image,
            labeled_image: currentQuiz.labeled_image,
            interval: 1,
            nextReviewDate: Date.now()
          };
        } else {
          newMistakes[mistakeKey].interval = 1;
          newMistakes[mistakeKey].nextReviewDate = Date.now();
        }
      }
    });

    setStats(newStats);
    setMistakes(newMistakes);
    localStorage.setItem('neuroQuizStats', JSON.stringify(newStats));
    localStorage.setItem('neuroQuizMistakes', JSON.stringify(newMistakes));
  };

  const nextQuestion = () => {
    setCurrentIndex(pickRandomIndex());
    setAnswers({});
    setSubmitted(false);
    setShowLabeled(false);
    window.scrollTo(0, 0);

    setCanSubmit(false);
    setTimeout(() => setCanSubmit(true), 400);
  };

  const toggleImage = () => setShowLabeled(prev => !prev);

  let correctCount = 0;
  if (submitted && currentQuiz && currentQuiz.questions) {
    currentQuiz.questions.forEach(q => {
      if (checkAnswer(answers[q.letter] || '', q.answer)) {
        correctCount++;
      }
    });
  }

  return (
    <div className="app-container">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button className="btn btn-secondary" onClick={onExit}>
            <ArrowLeft size={18} style={{ marginRight: '6px' }} /> Exit Zen Mode
          </button>
          <button className="btn btn-secondary" onClick={onSwitchExam} style={{ fontSize: '0.9rem' }}>
            <BookOpen size={16} style={{ marginRight: '6px' }} /> Switch Exam
          </button>
        </div>
        <h1>Zen Mode: {exam === 'exam1' ? 'Exam 1' : exam === 'exam2' ? 'Exam 2' : exam === 'exam3' ? 'Exam 3' : exam === 'exam3_focus' ? 'Exam 3 Focus' : 'Comprehensive'} 🧘</h1>
        <p>{examTitle} • Endless random rapid-fire practice</p>
      </div>

      <div className="quiz-card">
        <div style={{ textAlign: 'center', marginBottom: '8px', color: '#94a3b8', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
          <span style={{
            background: exam === 'exam3_focus' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
            color: exam === 'exam3_focus' ? '#34d399' : '#c4b5fd',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem'
          }}>
            {exam === 'exam1' ? 'Exam 1' : exam === 'exam2' ? 'Exam 2' : exam === 'exam3' ? 'Exam 3' : exam === 'exam3_focus' ? 'Exam 3 Focus' : 'Comprehensive'}
          </span>
          <span>Slide: {currentQuiz.id}</span>
        </div>

        <div className="image-container">
          <img
            src={BASE_URL + (showLabeled ? currentQuiz.labeled_image : currentQuiz.unlabeled_image)}
            alt="Anatomical structure"
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn" onClick={toggleImage}>
            <RefreshCw size={18} style={{ marginRight: '8px' }} />
            {showLabeled ? "Hide Labeled Image" : "Show Labeled Image"}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <h3>Identify the following structures:</h3>

          {submitted && (
            <div className="score-display">
              You answered {correctCount} out of {currentQuiz.questions.length} questions correctly.
            </div>
          )}

          <div className="form-grid">
            {currentQuiz.questions.map((q) => {
              const userAns = answers[q.letter] || '';
              const isCorrect = submitted ? checkAnswer(userAns, q.answer) : null;

              return (
                <div className="input-group" key={q.letter}>
                  <label style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span
                      className="letter-badge"
                      style={{
                        backgroundColor: q.letter.toLowerCase().includes('red')
                          ? '#ef4444'
                          : q.letter.toLowerCase().includes('pink')
                            ? '#ec4899'
                            : (exam === 'exam3' || q.color === 'blue' || q.letter.toLowerCase().includes('blue'))
                              ? '#2563eb'
                              : undefined
                      }}
                    >
                      {q.letter}
                    </span>
                    {q.description && <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>({q.description})</span>}
                    {exam === 'exam3' && (
                      <span style={{ fontSize: '0.74rem', color: '#60a5fa', fontWeight: 600, background: 'rgba(59, 130, 246, 0.15)', padding: '2px 7px', borderRadius: '4px' }}>
                        Blue Arrow
                      </span>
                    )}
                    {exam === 'comprehensive' && (
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: q.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        color: q.color === 'blue' ? '#60a5fa' : '#94a3b8'
                      }}>
                        {q.color === 'blue' ? 'New (Blue)' : 'Review (Black)'}
                      </span>
                    )}
                    {submitted && (
                      <span className={`status-badge ${isCorrect ? 'correct' : 'incorrect'}`} style={{ marginLeft: 'auto' }}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={userAns}
                    onChange={(e) => handleInputChange(q.letter, e.target.value)}
                    disabled={submitted}
                    placeholder={q.description ? `Identify ${q.letter} structure (${q.description})...` : `Structure ${q.letter}`}
                    autoComplete="off"
                  />
                  {submitted && !isCorrect && (
                    <div className="correct-answer-text">
                      <strong>Answer:</strong> {q.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="controls">
            {!submitted ? (
              <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                Submit Answers
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextQuestion}
              >
                Next Random Slide <ChevronRight size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function ZenMode({ quizData1, quizData2, quizData3, quizData3Focus, quizDataComp, initialExam, stats, setStats, mistakes, setMistakes, onExit }) {
  const [selectedExam, setSelectedExam] = useState(initialExam || null);

  if (!selectedExam) {
    return (
      <div className="app-container">
        <div className="header">
          <button className="btn btn-secondary" onClick={onExit} style={{ float: 'left' }}>
            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back to Main
          </button>
          <h1>Zen Mode Practice 🧘</h1>
          <p>Select which exam you want to practice endlessly:</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '30px' }}>
          <div
            className="quiz-card"
            style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
            onClick={() => setSelectedExam('exam1')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <h2 style={{ color: '#60a5fa' }}>Exam 1: Sensory Systems</h2>
            <p style={{ color: 'var(--text-color-muted)', margin: '10px 0' }}>
              Sensory Pathways & Brainstem Sections
            </p>
            <p style={{ color: '#c4b5fd', fontWeight: 600, margin: '15px 0' }}>
              {(quizData1 || []).length} Slides • Rapid-fire random practice
            </p>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#8b5cf6' }}>
              <Zap size={18} style={{ marginRight: '8px' }} /> Start Exam 1 Zen
            </button>
          </div>

          <div
            className="quiz-card"
            style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
            onClick={() => setSelectedExam('exam2')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <h2 style={{ color: '#a78bfa' }}>Exam 2: Motor & CNs</h2>
            <p style={{ color: 'var(--text-color-muted)', margin: '10px 0' }}>
              Motor Pathways, Cranial Nerves, Ear & Eye
            </p>
            <p style={{ color: '#c4b5fd', fontWeight: 600, margin: '15px 0' }}>
              {(quizData2 || []).length} Slides • Rapid-fire random practice
            </p>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#8b5cf6' }}>
              <Zap size={18} style={{ marginRight: '8px' }} /> Start Exam 2 Zen
            </button>
          </div>

          <div
            className="quiz-card"
            style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
            onClick={() => setSelectedExam('exam3')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <h2 style={{ color: '#38bdf8' }}>Exam 3: New Material</h2>
            <p style={{ color: 'var(--text-color-muted)', margin: '10px 0' }}>
              Cerebellum, Basal Ganglia, Cortex & Gross (Blue Only)
            </p>
            <p style={{ color: '#c4b5fd', fontWeight: 600, margin: '15px 0' }}>
              {(quizData3 || []).length} Slides • 275 Questions • Rapid-fire
            </p>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#8b5cf6' }}>
              <Zap size={18} style={{ marginRight: '8px' }} /> Start Exam 3 Zen
            </button>
          </div>

          <div
            className="quiz-card"
            style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s', position: 'relative' }}
            onClick={() => setSelectedExam('exam3_focus')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ display: 'inline-block', marginBottom: '8px' }}>
              <span style={{
                background: '#059669',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Official 2026 List
              </span>
            </div>
            <h2 style={{ color: '#34d399' }}>Exam 3 Practical focus</h2>
            <p style={{ color: 'var(--text-color-muted)', margin: '10px 0' }}>
              Structures from Practical Exam 3 2026.pdf
            </p>
            <p style={{ color: '#34d399', fontWeight: 600, margin: '15px 0' }}>
              {(quizData3Focus || []).length} Slides • 238 Questions • Rapid-fire Focus Practice
            </p>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#059669' }}>
              <Zap size={18} style={{ marginRight: '8px' }} /> Start Exam 3 Focus Zen
            </button>
          </div>

          <div
            className="quiz-card"
            style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
            onClick={() => setSelectedExam('comprehensive')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <h2 style={{ color: '#34d399' }}>Comprehensive</h2>
            <p style={{ color: 'var(--text-color-muted)', margin: '10px 0' }}>
              All 461 Questions across Exam 1, 2, and 3 Practical Slides
            </p>
            <p style={{ color: '#c4b5fd', fontWeight: 600, margin: '15px 0' }}>
              {(quizDataComp || []).length} Slides • 461 Questions • All Structures
            </p>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#059669' }}>
              <Zap size={18} style={{ marginRight: '8px' }} /> Start Comprehensive Zen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ZenModeSession
      key={selectedExam}
      exam={selectedExam}
      quizData={
        selectedExam === 'exam1' ? quizData1
        : selectedExam === 'exam2' ? quizData2
        : selectedExam === 'exam3' ? quizData3
        : selectedExam === 'exam3_focus' ? quizData3Focus
        : quizDataComp
      }
      stats={stats}
      setStats={setStats}
      mistakes={mistakes}
      setMistakes={setMistakes}
      onSwitchExam={() => setSelectedExam(null)}
      onExit={onExit}
    />
  );
}

export default ZenMode;
