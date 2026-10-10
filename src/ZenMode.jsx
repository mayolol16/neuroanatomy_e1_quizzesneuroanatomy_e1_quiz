import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { checkAnswer } from './utils';

const BASE_URL = import.meta.env.BASE_URL + 'images/';

function ZenMode({ quizData, stats, setStats, mistakes, setMistakes, onExit }) {
  // Pick initial random index
  const pickRandomIndex = () => {
    // Heavy emphasis on first 30 slides (index 0 to 29)
    // 70% chance to pick from first 30, 30% chance to pick from anywhere
    const focusLimit = Math.min(30, quizData.length);
    const rand = Math.random();
    if (rand < 0.7) {
      return Math.floor(Math.random() * focusLimit);
    } else {
      return Math.floor(Math.random() * quizData.length);
    }
  };

  const [currentIndex, setCurrentIndex] = useState(pickRandomIndex());
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showLabeled, setShowLabeled] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);

  const currentQuiz = quizData[currentIndex];

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
      
      const mistakeKey = `${currentQuiz.id}_${q.letter}`;
      
      if (isCorrect) {
        newStats[q.answer].correct += 1;
      } else {
        if (!newMistakes[mistakeKey]) {
          newMistakes[mistakeKey] = {
            id: mistakeKey,
            slideId: currentQuiz.id,
            letter: q.letter,
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
  if (submitted && currentQuiz) {
    currentQuiz.questions.forEach(q => {
      if (checkAnswer(answers[q.letter] || '', q.answer)) {
        correctCount++;
      }
    });
  }

  if (!currentQuiz) return <div className="app-container">Loading...</div>;

  return (
    <div className="app-container">
      <div className="header">
        <button className="btn btn-secondary" onClick={onExit} style={{ float: 'left' }}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }}/> Exit Zen Mode
        </button>
        <h1>Zen Mode 🧘</h1>
        <p>Endless random practice. Heavy emphasis on the first 30 slides.</p>
      </div>

      <div className="quiz-card">
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
                  <label>
                    <span className="letter-badge">{q.letter}</span>
                    {submitted && (
                      <span className={`status-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </label>
                  <input 
                    type="text" 
                    value={userAns}
                    onChange={(e) => handleInputChange(q.letter, e.target.value)}
                    disabled={submitted}
                    placeholder={`Structure ${q.letter}`}
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

export default ZenMode;
