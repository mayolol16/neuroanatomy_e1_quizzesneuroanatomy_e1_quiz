import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowLeft, CheckCircle, XCircle, HelpCircle, BookOpen } from 'lucide-react';
import { checkAnswer, isExamMistake } from './utils';

const BASE_URL = import.meta.env.BASE_URL + 'images/';

function SpacedRepetitionSession({ exam, mistakes, updateMistake, onSwitchExam, onExit }) {
  // Snapshot the review queue for this exam session
  const [reviewQueue] = useState(() => {
    return Object.values(mistakes || {}).filter(m => isExamMistake(m, exam) && m.nextReviewDate <= Date.now());
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

  const examTitle = exam === 'exam1' 
    ? 'Exam 1 (Sensory)' 
    : exam === 'exam2' 
      ? 'Exam 2 (Motor & Special Senses)' 
      : 'Exam 3 (Comprehensive)';

  if (reviewQueue.length === 0) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>You're all caught up on {examTitle}! 🎉</h2>
        <p style={{ color: 'var(--text-color-muted)', margin: '15px 0' }}>
          You have no structures to review for this exam right now.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
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

  if (currentIndex >= reviewQueue.length) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Great job! Finished {examTitle} Review 🎉</h2>
        <p style={{ color: 'var(--text-color-muted)', margin: '15px 0' }}>
          You've completed all due review cards for this exam session.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onSwitchExam}>
            Review Other Exam
          </button>
          <button className="btn btn-primary" onClick={onExit}>
            Back to Main Quiz
          </button>
        </div>
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
      updateMistake(currentItem.id, {
        interval: currentInterval * 2,
        nextReviewDate: Date.now() + (currentInterval * 2 * 24 * 60 * 60 * 1000)
      });
    } else {
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

  return (
    <div className="app-container">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button className="btn btn-secondary" onClick={onExit}>
            <ArrowLeft size={18} style={{ marginRight: '6px' }}/> Exit Review
          </button>
          <button className="btn btn-secondary" onClick={onSwitchExam} style={{ fontSize: '0.9rem' }}>
            <BookOpen size={16} style={{ marginRight: '6px' }} /> Switch Exam
          </button>
        </div>
        <h1>Spaced Repetition: {examTitle}</h1>
        <p>Targeted review of structures you previously missed on this exam.</p>
      </div>

      <div className="progress-container">
        <span>Reviewing {currentIndex + 1} of {reviewQueue.length}</span>
      </div>

      <div className="quiz-card">
        <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 600, color: '#64748b', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
          <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
            {exam === 'exam1' ? 'Exam 1' : exam === 'exam2' ? 'Exam 2' : 'Exam 3'}
          </span>
          <span>Slide: {currentItem.slideId || currentItem.id.split('_')[1] || currentItem.id.split('_')[0]}</span>
        </div>

        <div className="image-container">
          <img 
            src={BASE_URL + (submitted ? currentItem.labeled_image : currentItem.unlabeled_image)} 
            alt="Anatomical structure" 
          />
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <h3>
            Identify Structure: 
            <span 
              className="letter-badge"
              style={{
                backgroundColor: currentItem.letter.toLowerCase().includes('red') 
                  ? '#ef4444' 
                  : currentItem.letter.toLowerCase().includes('pink') 
                    ? '#ec4899' 
                    : currentItem.letter.toLowerCase().includes('blue')
                      ? '#0284c7'
                      : undefined,
                marginLeft: '8px'
              }}
            >
              {currentItem.letter}
            </span>
            {currentItem.description && (
              <span style={{ fontSize: '0.95rem', color: '#94a3b8', fontWeight: 500, marginLeft: '8px' }}>
                ({currentItem.description})
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

function SpacedRepetition({ mistakes, updateMistake, onExit, initialExam }) {
  const [selectedExam, setSelectedExam] = useState(initialExam || null);

  const exam1Due = Object.values(mistakes || {}).filter(m => isExamMistake(m, 'exam1') && m.nextReviewDate <= Date.now()).length;
  const exam2Due = Object.values(mistakes || {}).filter(m => isExamMistake(m, 'exam2') && m.nextReviewDate <= Date.now()).length;
  const exam3Due = Object.values(mistakes || {}).filter(m => isExamMistake(m, 'exam3') && m.nextReviewDate <= Date.now()).length;

  if (!selectedExam) {
    return (
      <div className="app-container">
        <div className="header">
          <button className="btn btn-secondary" onClick={onExit} style={{ float: 'left' }}>
            <ArrowLeft size={18} style={{ marginRight: '8px' }}/> Back to Main
          </button>
          <h1>Spaced Repetition Review</h1>
          <p>Select which exam you want to review structures from:</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '30px' }}>
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
            <h2 style={{ color: '#38bdf8' }}>Exam 3: Comprehensive</h2>
            <p style={{ color: 'var(--text-color-muted)', margin: '10px 0' }}>
              Cerebellum, Basal Ganglia, Cortex, Vasculature & Gross Neuroanatomy
            </p>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: exam3Due > 0 ? '#ef4444' : '#10b981', margin: '15px 0' }}>
              {exam3Due} {exam3Due === 1 ? 'card' : 'cards'} due for review
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Start Exam 3 Review
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
