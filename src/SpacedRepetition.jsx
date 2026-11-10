import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowLeft, CheckCircle, XCircle, HelpCircle, BookOpen } from 'lucide-react';
import {
  checkAnswer,
  isExamMistake,
  normalizeCard,
  calculateAnkiSchedule,
  getAnkiIntervalLabel,
  LEARNING_STEPS,
  GRADUATING_INTERVAL_DAYS,
  EASY_INTERVAL_DAYS
} from './utils';

const BASE_URL = import.meta.env.BASE_URL + 'images/';

function SpacedRepetitionSession({ exam, mistakes, updateMistake, onSwitchExam, onExit }) {
  // Snapshot the initial queue of cards currently due for this exam
  const [sessionQueue, setSessionQueue] = useState(() => {
    return Object.values(mistakes || {})
      .filter(m => isExamMistake(m, exam) && (m.nextReviewDate || 0) <= Date.now())
      .map(normalizeCard);
  });

  const [initialCount] = useState(() => sessionQueue.length);
  const [completedCount, setCompletedCount] = useState(0);

  const [userAns, setUserAns] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showLabeled, setShowLabeled] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const inputRef = useRef(null);

  const currentItem = sessionQueue[0];

  // Auto-focus input when moving to a new card
  useEffect(() => {
    if (!submitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentItem, submitted]);

  const examTitle = exam === 'exam1'
    ? 'Exam 1 (Sensory)'
    : exam === 'exam2'
      ? 'Exam 2 (Motor & Special Senses)'
      : exam === 'exam3'
        ? 'Exam 3 (New Material - Blue Only)'
        : exam === 'exam3_focus'
          ? 'Exam 3 Practical Focus (2026 Focus Sheet)'
          : 'Comprehensive Practical (All)';

  const handleRating = (rating) => {
    if (!currentItem || !canSubmit) return;
    setCanSubmit(false);

    const schedule = calculateAnkiSchedule(currentItem, rating);
    updateMistake(currentItem.id, schedule);

    if (rating === 'again') {
      // In Anki, cards rated 'Again' are re-queued at the end of the session
      setSessionQueue(prev => {
        const next = prev.slice(1);
        return [...next, { ...currentItem, ...schedule }];
      });
    } else {
      // Card advances and leaves the current session
      setSessionQueue(prev => prev.slice(1));
      setCompletedCount(prev => prev + 1);
    }

    setUserAns('');
    setSubmitted(false);
    setIsCorrect(false);
    setShowLabeled(false);

    setTimeout(() => {
      setCanSubmit(true);
    }, 200);
  };

  // Keyboard shortcuts when submitted (1: Again, 2: Hard, 3: Good, 4: Easy, Enter/Space: default)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (submitted) {
        if (e.key === '1') {
          e.preventDefault();
          handleRating('again');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRating('hard');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRating('good');
        } else if (e.key === '4') {
          e.preventDefault();
          handleRating('easy');
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Default: Good if correct, Again if incorrect
          if (isCorrect) {
            handleRating('good');
          } else {
            handleRating('again');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitted, isCorrect, currentItem, canSubmit]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (submitted) {
      if (isCorrect) {
        handleRating('good');
      } else {
        handleRating('again');
      }
      return;
    }
    if (!canSubmit || !currentItem) return;

    const trimmed = userAns.trim();
    if (!trimmed) return;

    const correct = checkAnswer(trimmed, currentItem.answer);
    setIsCorrect(correct);
    setSubmitted(true);
  };

  const handleIDontKnow = () => {
    if (submitted || !canSubmit || !currentItem) return;
    setUserAns("Don't know");
    setIsCorrect(false);
    setSubmitted(true);
  };

  if (!currentItem) {
    if (completedCount > 0) {
      return (
        <div className="app-container" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Session Complete! 🎉</h2>
          <p style={{ color: 'var(--text-color-muted)', margin: '15px 0' }}>
            You've completed all due review cards for {examTitle} ({completedCount} {completedCount === 1 ? 'card' : 'cards'} reviewed).
          </p>
          <div style={{
            display: 'inline-flex',
            gap: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#34d399',
            marginBottom: '25px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span>✓ Learning: 15m (Again) • 23m (Hard)</span>
            <span>•</span>
            <span>Good: 2d</span>
            <span>•</span>
            <span>Easy: 4d</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={onSwitchExam}>
              Review Different Exam
            </button>
            <button className="btn btn-primary" onClick={onExit}>
              Back to Main Quiz
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>You're all caught up on {examTitle}! 🎉</h2>
        <p style={{ color: 'var(--text-color-muted)', margin: '15px 0' }}>
          You have no structures due for review right now.
        </p>
        <div style={{
          display: 'inline-flex',
          gap: '12px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#93c5fd',
          marginBottom: '25px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <span>Anki Intervals: 15m (Again) • 23m (Hard)</span>
          <span>•</span>
          <span>Good: 2d</span>
          <span>•</span>
          <span>Easy: 4d</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onSwitchExam}>
            Review Different Exam
          </button>
          <button className="btn btn-primary" onClick={onExit}>
            Back to Main Quiz
          </button>
        </div>
      </div>
    );
  }

  // Count how many cards in current session are learning vs review
  const learningCount = sessionQueue.filter(c => (c.state || 'learning') === 'learning').length;
  const reviewCount = sessionQueue.filter(c => c.state === 'review').length;

  return (
    <div className="app-container">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button className="btn btn-secondary" onClick={onExit}>
            <ArrowLeft size={18} style={{ marginRight: '6px' }} /> Exit Review
          </button>
          <button className="btn btn-secondary" onClick={onSwitchExam} style={{ fontSize: '0.9rem' }}>
            <BookOpen size={16} style={{ marginRight: '6px' }} /> Switch Exam
          </button>
        </div>
        <h1>Spaced Repetition: {examTitle}</h1>
        <p>Anki Intervals: Again (15m) • Hard (23m) • Good (2d) • Easy (4d)</p>
      </div>

      {/* Progress & Queue Pill */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '15px',
        flexWrap: 'wrap',
        fontSize: '0.85rem',
        fontWeight: 600
      }}>
        <span style={{
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          padding: '4px 10px',
          borderRadius: '999px',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          Learning: {learningCount}
        </span>
        <span style={{
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          padding: '4px 10px',
          borderRadius: '999px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          Review: {reviewCount}
        </span>
        <span style={{
          background: 'rgba(148, 163, 184, 0.15)',
          color: '#cbd5e1',
          padding: '4px 10px',
          borderRadius: '999px'
        }}>
          Remaining in Session: {sessionQueue.length}
        </span>
      </div>

      <div className="quiz-card">
        <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 600, color: '#64748b', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            background: exam === 'exam3_focus' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            color: exam === 'exam3_focus' ? '#34d399' : '#93c5fd',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.82rem'
          }}>
            {exam === 'exam1' ? 'Exam 1' : exam === 'exam2' ? 'Exam 2' : exam === 'exam3' ? 'Exam 3' : exam === 'exam3_focus' ? 'Exam 3 Focus' : 'Comprehensive'}
          </span>

          <span style={{
            background: currentItem.state === 'review' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: currentItem.state === 'review' ? '#34d399' : '#fbbf24',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.82rem'
          }}>
            {currentItem.state === 'review'
              ? `Review (${Math.round(currentItem.interval || 2)}d)`
              : `Learning: Step ${(currentItem.step || 0) + 1}/2 (${currentItem.step === 0 ? '15m' : '23m'})`}
          </span>

          <span>Slide: {currentItem.slideId || currentItem.id.split('_')[1] || currentItem.id.split('_')[0]}</span>
        </div>

        <div className="image-container">
          <img
            src={BASE_URL + (submitted || showLabeled ? currentItem.labeled_image : currentItem.unlabeled_image)}
            alt="Anatomical structure"
          />
        </div>

        {submitted && (
          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowLabeled(prev => !prev)}
              style={{ fontSize: '0.82rem', padding: '4px 10px' }}
            >
              {showLabeled ? "Hide Labeled Image" : "Show Labeled Image"}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <span>Identify Structure:</span>
            <span
              className="letter-badge"
              style={{
                backgroundColor: currentItem.letter.toLowerCase().includes('red')
                  ? '#ef4444'
                  : currentItem.letter.toLowerCase().includes('pink')
                    ? '#ec4899'
                    : (exam === 'exam3' || currentItem.color === 'blue' || currentItem.letter.toLowerCase().includes('blue'))
                      ? '#2563eb'
                      : undefined
              }}
            >
              {currentItem.letter}
            </span>
            {currentItem.description && (
              <span style={{ fontSize: '0.95rem', color: '#94a3b8', fontWeight: 500 }}>
                ({currentItem.description})
              </span>
            )}
            {exam === 'exam3' && (
              <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 600, background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                Blue Arrow
              </span>
            )}
            {exam === 'comprehensive' && (
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                background: currentItem.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                color: currentItem.color === 'blue' ? '#60a5fa' : '#94a3b8'
              }}>
                {currentItem.color === 'blue' ? 'New (Blue)' : 'Review (Black)'}
              </span>
            )}
          </h3>

          <div className="input-group">
            <input
              key={currentItem.id}
              ref={inputRef}
              id="spaced-rep-input"
              type="text"
              value={userAns}
              onChange={(e) => setUserAns(e.target.value)}
              disabled={submitted}
              placeholder={currentItem.description ? `Type answer for ${currentItem.letter} (${currentItem.description})...` : `Type answer for ${currentItem.letter}...`}
              style={{ padding: '12px', fontSize: '1.1rem', width: '100%' }}
              autoFocus
              autoComplete="off"
            />
          </div>

          {!submitted ? (
            <div className="controls" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleIDontKnow}
                disabled={!canSubmit}
              >
                <HelpCircle size={18} style={{ marginRight: '6px' }} /> Don't Know
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                id="spaced-rep-submit-btn"
                disabled={!canSubmit || !userAns.trim()}
              >
                Check Answer
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '16px' }}>
              {/* Answer Result Banner */}
              {isCorrect ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10b981',
                  color: '#10b981',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  marginBottom: '16px'
                }}>
                  <CheckCircle size={22} /> Correct! Answer: {currentItem.answer}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px' }}>
                    <XCircle size={22} /> Incorrect
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
                    Correct Structure: <strong style={{ color: '#ffffff', fontSize: '1.05rem' }}>{currentItem.answer}</strong>
                  </div>
                  {userAns && userAns !== "Don't know" && (
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                      You answered: <span style={{ textDecoration: 'line-through' }}>{userAns}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Anki 4-Rating Button Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginTop: '10px'
              }}>
                {/* AGAIN */}
                <button
                  type="button"
                  onClick={() => handleRating('again')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 6px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: !isCorrect ? '2px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.35)',
                    boxShadow: !isCorrect ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', opacity: 0.85, fontWeight: 600 }}>
                    {getAnkiIntervalLabel(currentItem, 'again')}
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, margin: '2px 0' }}>
                    Again
                  </span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>
                    {!isCorrect ? 'Enter / 1' : '1'}
                  </span>
                </button>

                {/* HARD */}
                <button
                  type="button"
                  onClick={() => handleRating('hard')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 6px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', opacity: 0.85, fontWeight: 600 }}>
                    {getAnkiIntervalLabel(currentItem, 'hard')}
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, margin: '2px 0' }}>
                    Hard
                  </span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>
                    2
                  </span>
                </button>

                {/* GOOD */}
                <button
                  type="button"
                  onClick={() => handleRating('good')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 6px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: isCorrect ? '2px solid #10b981' : '1px solid rgba(16, 185, 129, 0.35)',
                    boxShadow: isCorrect ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none',
                    color: '#34d399',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', opacity: 0.85, fontWeight: 600 }}>
                    {getAnkiIntervalLabel(currentItem, 'good')}
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, margin: '2px 0' }}>
                    Good
                  </span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>
                    {isCorrect ? 'Enter / 3' : '3'}
                  </span>
                </button>

                {/* EASY */}
                <button
                  type="button"
                  onClick={() => handleRating('easy')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 6px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', opacity: 0.85, fontWeight: 600 }}>
                    {getAnkiIntervalLabel(currentItem, 'easy')}
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, margin: '2px 0' }}>
                    Easy
                  </span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>
                    4
                  </span>
                </button>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '10px' }}>
                Press <strong>Enter</strong> to choose {isCorrect ? 'Good' : 'Again'}, or press <strong>1</strong>-<strong>4</strong>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function SpacedRepetition({ mistakes, updateMistake, onExit, initialExam }) {
  const [selectedExam, setSelectedExam] = useState(initialExam || null);

  const exam1Due = Object.values(mistakes || {}).filter(m => isExamMistake(m, 'exam1') && (m.nextReviewDate || 0) <= Date.now()).length;
  const exam2Due = Object.values(mistakes || {}).filter(m => isExamMistake(m, 'exam2') && (m.nextReviewDate || 0) <= Date.now()).length;
  const exam3Due = Object.values(mistakes || {}).filter(m => isExamMistake(m, 'exam3') && (m.nextReviewDate || 0) <= Date.now()).length;
  const exam3FocusDue = Object.values(mistakes || {}).filter(m => isExamMistake(m, 'exam3_focus') && (m.nextReviewDate || 0) <= Date.now()).length;
  const compDue = Object.values(mistakes || {}).filter(m => isExamMistake(m, 'comprehensive') && (m.nextReviewDate || 0) <= Date.now()).length;

  if (!selectedExam) {
    return (
      <div className="app-container">
        <div className="header">
          <button className="btn btn-secondary" onClick={onExit} style={{ float: 'left' }}>
            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back to Main
          </button>
          <h1>Anki Spaced Repetition 🧠</h1>
          <p>Anki Intervals: Again (15m) • Hard (23m) • Good (2d) • Easy (4d)</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '30px' }}>
          <div
            className="quiz-card"
            style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
            onClick={() => setSelectedExam('exam1')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <h2 style={{ color: '#60a5fa' }}>Exam 1: Sensory</h2>
            <p style={{ color: 'var(--text-color-muted)', margin: '10px 0' }}>
              Sensory Pathways & Brainstem Neuroanatomy
            </p>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: exam1Due > 0 ? '#ef4444' : '#10b981', margin: '15px 0' }}>
              {exam1Due} {exam1Due === 1 ? 'card' : 'cards'} due for review
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Start Exam 1 Review
            </button>
          </div>

          <div
            className="quiz-card"
            style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
            onClick={() => setSelectedExam('exam2')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <h2 style={{ color: '#a78bfa' }}>Exam 2: Motor & CNs</h2>
            <p style={{ color: 'var(--text-color-muted)', margin: '10px 0' }}>
              Motor Pathways, Cranial Nerves, Auditory & Visual Systems
            </p>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: exam2Due > 0 ? '#ef4444' : '#10b981', margin: '15px 0' }}>
              {exam2Due} {exam2Due === 1 ? 'card' : 'cards'} due for review
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Start Exam 2 Review
            </button>
          </div>

          <div
            className="quiz-card"
            style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
            onClick={() => setSelectedExam('exam3')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <h2 style={{ color: '#38bdf8' }}>Exam 3: New Material</h2>
            <p style={{ color: 'var(--text-color-muted)', margin: '10px 0' }}>
              Cerebellum, Basal Ganglia, Cortex & Gross (Blue Structures Only)
            </p>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: exam3Due > 0 ? '#ef4444' : '#10b981', margin: '15px 0' }}>
              {exam3Due} {exam3Due === 1 ? 'card' : 'cards'} due for review
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Start Exam 3 Review
            </button>
          </div>

          <div
            className="quiz-card"
            style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
            onClick={() => setSelectedExam('exam3_focus')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <h2 style={{ color: '#34d399' }}>Exam 3 Focus</h2>
            <p style={{ color: 'var(--text-color-muted)', margin: '10px 0' }}>
              Targeted Review of 2026 Practical Exam 3 Document Structures
            </p>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: exam3FocusDue > 0 ? '#ef4444' : '#10b981', margin: '15px 0' }}>
              {exam3FocusDue} {exam3FocusDue === 1 ? 'card' : 'cards'} due for review
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#059669' }}>
              Start Focus Review
            </button>
          </div>

          <div
            className="quiz-card"
            style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
            onClick={() => setSelectedExam('comprehensive')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <h2 style={{ color: '#a3e635' }}>Comprehensive</h2>
            <p style={{ color: 'var(--text-color-muted)', margin: '10px 0' }}>
              All 461 Questions across Exam 1, 2, and 3 Practical Slides
            </p>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: compDue > 0 ? '#ef4444' : '#10b981', margin: '15px 0' }}>
              {compDue} {compDue === 1 ? 'card' : 'cards'} due for review
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#65a30d' }}>
              Start Comprehensive Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SpacedRepetitionSession
      key={selectedExam}
      exam={selectedExam}
      mistakes={mistakes}
      updateMistake={updateMistake}
      onSwitchExam={() => setSelectedExam(null)}
      onExit={onExit}
    />
  );
}

export default SpacedRepetition;
