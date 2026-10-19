import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowLeft, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { checkAnswer } from './utils';

const BASE_URL = import.meta.env.BASE_URL + 'images/';

function SpacedRepetition({ mistakes, updateMistake, onExit }) {
  // Snapshot the review queue for this session so index shifts don't disrupt card flow
  const [reviewQueue] = useState(() => {
    return Object.values(mistakes || {}).filter(m => m.nextReviewDate <= Date.now());
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAns, setUserAns] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const inputRef = useRef(null);

  // Auto-focus input when moving to a new card
  useEffect(() => {
    if (!submitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, submitted]);

  if (reviewQueue.length === 0) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>You're all caught up! 🎉</h2>
        <p>You have no structures to review right now. Come back later or take the main quiz.</p>
        <button className="btn btn-primary" onClick={onExit} style={{ marginTop: '20px' }}>
          Back to Main Quiz
        </button>
      </div>
    );
  }

  if (currentIndex >= reviewQueue.length) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Great job! 🎉</h2>
        <p>You have finished your review session for now.</p>
        <button className="btn btn-primary" onClick={onExit} style={{ marginTop: '20px' }}>
          Back to Main Quiz
        </button>
      </div>
    );
  }

  const currentItem = reviewQueue[currentIndex];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (submitted) {
      nextCard();
      return;
    }
    if (!canSubmit) return;
    
    const trimmed = userAns.trim();
    if (!trimmed) return;
    
    const correct = checkAnswer(trimmed, currentItem.answer);
    setIsCorrect(correct);
    setSubmitted(true);
    
    // Update spaced repetition state
    const currentInterval = currentItem.interval || 1;
    if (correct) {
      // Increase interval
      updateMistake(currentItem.id, {
        interval: currentInterval * 2,
        nextReviewDate: Date.now() + (currentInterval * 2 * 24 * 60 * 60 * 1000)
      });
    } else {
      // Reset interval to 1 day
      updateMistake(currentItem.id, {
        interval: 1,
        nextReviewDate: Date.now() + (24 * 60 * 60 * 1000)
      });
    }
  };

  const handleIDontKnow = () => {
    if (submitted || !canSubmit) return;
    setUserAns("Don't know");
    setIsCorrect(false);
    setSubmitted(true);
    updateMistake(currentItem.id, {
      interval: 1,
      nextReviewDate: Date.now() + (24 * 60 * 60 * 1000)
    });
  };

  const nextCard = () => {
    setUserAns('');
    setSubmitted(false);
    setIsCorrect(false);
    setCurrentIndex(prev => prev + 1);
    setCanSubmit(false);
    setTimeout(() => {
      setCanSubmit(true);
    }, 250);
  };

  const isLast = currentIndex === reviewQueue.length - 1;

  // Determine exam label
  const examLabel = currentItem.exam === 'exam1' 
    ? 'Exam 1 (Sensory)' 
    : currentItem.exam === 'exam2' 
      ? 'Exam 2 (Motor & CN)' 
      : '';

  return (
    <div className="app-container">
      <div className="header">
        <button className="btn btn-secondary" onClick={onExit} style={{ float: 'left' }}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }}/> Exit Review
        </button>
        <h1>Spaced Repetition Mode</h1>
        <p>Reviewing structures you previously missed.</p>
      </div>

      <div className="progress-container">
        <span>Reviewing {currentIndex + 1} of {reviewQueue.length}</span>
      </div>

      <div className="quiz-card">
        <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 600, color: '#64748b', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
          {examLabel && (
            <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
              {examLabel}
            </span>
          )}
          <span>Slide: {currentItem.slideId || currentItem.id.split('_')[1] || currentItem.id.split('_')[0]}</span>
        </div>

        <div className="image-container">
          <img 
            src={BASE_URL + (submitted ? currentItem.labeled_image : currentItem.unlabeled_image)} 
            alt="Anatomical structure" 
          />
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <h3>Identify Structure: <span className="letter-badge">{currentItem.letter}</span></h3>
          
          <div className="input-group">
            <input 
              key={currentItem.id}
              ref={inputRef}
              id="spaced-rep-input"
              type="text" 
              value={userAns}
              onChange={(e) => setUserAns(e.target.value)}
              disabled={submitted}
              placeholder={`Type answer for ${currentItem.letter}...`}
              style={{ padding: '12px', fontSize: '1.1rem', width: '100%' }}
              autoFocus
              autoComplete="off"
            />
            {submitted && (
              <div className="correct-answer-text" style={{ marginTop: '10px' }}>
                {isCorrect ? (
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={20} /> Correct! Next review in {(currentItem.interval || 1) * 2} days.
                  </span>
                ) : (
                  <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={20} /> Incorrect. The answer is: <strong>{currentItem.answer}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="controls" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {!submitted ? (
              <>
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
              </>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary" 
                id="spaced-rep-continue-btn"
                onClick={nextCard}
                autoFocus
              >
                {isLast ? 'Finish Review' : 'Continue Reviewing'} <ChevronRight size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default SpacedRepetition;
