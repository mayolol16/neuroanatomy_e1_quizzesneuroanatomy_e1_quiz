import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { checkAnswer } from './utils';

const BASE_URL = import.meta.env.BASE_URL + 'images/';

function SpacedRepetition({ mistakes, updateMistake, onExit }) {
  const dueItems = Object.values(mistakes).filter(m => m.nextReviewDate <= Date.now());
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAns, setUserAns] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);

  if (dueItems.length === 0) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>You're all caught up!</h2>
        <p>You have no structures to review right now. Come back later or take the main quiz.</p>
        <button className="btn btn-primary" onClick={onExit} style={{ marginTop: '20px' }}>
          Back to Main Quiz
        </button>
      </div>
    );
  }

  const currentItem = dueItems[currentIndex];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitted || !canSubmit) return;
    
    const correct = checkAnswer(userAns, currentItem.answer);
    setIsCorrect(correct);
    setSubmitted(true);
    
    // Update spaced repetition state
    if (correct) {
      // Increase interval
      updateMistake(currentItem.id, {
        interval: currentItem.interval * 2,
        nextReviewDate: Date.now() + (currentItem.interval * 2 * 24 * 60 * 60 * 1000)
      });
    } else {
      // Reset interval to 1 day
      updateMistake(currentItem.id, {
        interval: 1,
        nextReviewDate: Date.now() + (24 * 60 * 60 * 1000)
      });
    }
  };

  const nextCard = () => {
    setUserAns('');
    setSubmitted(false);
    if (currentIndex < dueItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished all due items
      setCurrentIndex(0);
    }
    
    setCanSubmit(false);
    setTimeout(() => setCanSubmit(true), 400);
  };

  if (!currentItem) {
      return (
      <div className="app-container" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Great job!</h2>
        <p>You have finished your review session for now.</p>
        <button className="btn btn-primary" onClick={onExit} style={{ marginTop: '20px' }}>
          Back to Main Quiz
        </button>
      </div>
    );
  }

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
        <span>Reviewing {currentIndex + 1} of {dueItems.length}</span>
      </div>

      <div className="quiz-card">
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
              type="text" 
              value={userAns}
              onChange={(e) => setUserAns(e.target.value)}
              disabled={submitted}
              placeholder={`Type answer for ${currentItem.letter}...`}
              style={{ padding: '12px', fontSize: '1.1rem', width: '100%' }}
              autoFocus
            />
            {submitted && (
              <div className="correct-answer-text" style={{ marginTop: '10px' }}>
                {isCorrect ? (
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={20} /> Correct! Next review in {currentItem.interval * 2} days.
                  </span>
                ) : (
                  <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={20} /> Incorrect. The answer is: <strong>{currentItem.answer}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="controls" style={{ marginTop: '20px' }}>
            {!submitted ? (
              <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                Check Answer
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={nextCard}
              >
                Continue Reviewing <ChevronRight size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default SpacedRepetition;
