import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Info, RefreshCw, BarChart2, X, BrainCircuit } from 'lucide-react';
import quizData from './quiz_data.json';
import { checkAnswer } from './utils';
import SpacedRepetition from './SpacedRepetition';

const BASE_URL = import.meta.env.BASE_URL + 'images/';

function App() {
  const [mode, setMode] = useState('quiz');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showLabeled, setShowLabeled] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('neuroQuizStats');
    return saved ? JSON.parse(saved) : {};
  });

  const [mistakes, setMistakes] = useState(() => {
    const saved = localStorage.getItem('neuroQuizMistakes');
    return saved ? JSON.parse(saved) : {};
  });

  const currentQuiz = quizData[currentIndex];
  
  const handleInputChange = (letter, value) => {
    setAnswers(prev => ({ ...prev, [letter]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setSubmitted(true);

    // Update stats
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
        // Record mistake for spaced repetition
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
          // Reset interval if missed again on main quiz
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
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswers({});
      setSubmitted(false);
      setShowLabeled(false);
      window.scrollTo(0, 0);
      
      setCanSubmit(false);
      setTimeout(() => setCanSubmit(true), 400);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setAnswers({});
      setSubmitted(false);
      setShowLabeled(false);
      window.scrollTo(0, 0);
      
      setCanSubmit(false);
      setTimeout(() => setCanSubmit(true), 400);
    }
  };

  const toggleImage = () => setShowLabeled(prev => !prev);
  const toggleStats = () => setShowStats(prev => !prev);
  const clearStats = () => {
    if (window.confirm('Are you sure you want to clear your statistics and review queue?')) {
      setStats({});
      setMistakes({});
      localStorage.removeItem('neuroQuizStats');
      localStorage.removeItem('neuroQuizMistakes');
    }
  };

  const updateMistake = (id, updates) => {
    setMistakes(prev => {
      const updated = { ...prev, [id]: { ...prev[id], ...updates } };
      localStorage.setItem('neuroQuizMistakes', JSON.stringify(updated));
      return updated;
    });
  };

  let correctCount = 0;
  if (submitted && currentQuiz) {
    currentQuiz.questions.forEach(q => {
      if (checkAnswer(answers[q.letter] || '', q.answer)) {
        correctCount++;
      }
    });
  }

  // Process stats for display
  const statsArray = Object.entries(stats).map(([structure, data]) => ({
    structure,
    correct: data.correct,
    total: data.total,
    accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
  })).sort((a, b) => a.accuracy - b.accuracy || b.total - a.total); // Weakest first

  if (!currentQuiz) return <div className="app-container">Loading...</div>;

  if (mode === 'review') {
    return (
      <SpacedRepetition 
        mistakes={mistakes} 
        updateMistake={updateMistake} 
        onExit={() => setMode('quiz')} 
      />
    );
  }

  const dueItemsCount = Object.values(mistakes).filter(m => m.nextReviewDate <= Date.now()).length;

  return (
    <div className="app-container">
      <div className="header">
        <h1>Neuro Practical Exam 1</h1>
        <p>Interactive Quiz Mode with Flexible Grading</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary stats-toggle-btn" onClick={toggleStats} style={{ position: 'static' }}>
            <BarChart2 size={18} /> View Analytics
          </button>
          <button className="btn btn-primary" onClick={() => setMode('review')}>
            <BrainCircuit size={18} style={{ marginRight: '8px' }} /> 
            Spaced Repetition Review {dueItemsCount > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 8px', marginLeft: '5px', fontSize: '0.8rem' }}>{dueItemsCount}</span>}
          </button>
        </div>
      </div>

      {showStats && (
        <div className="stats-modal-overlay">
          <div className="stats-modal">
            <div className="stats-modal-header">
              <h2>Performance Analytics</h2>
              <button className="icon-btn" onClick={toggleStats}><X size={24} /></button>
            </div>
            
            <div className="stats-content">
              {statsArray.length === 0 ? (
                <p className="no-stats">Answer some questions to see your strengths and weaknesses!</p>
              ) : (
                <>
                  <div className="stats-legend">
                    <p>Structures are ordered by your accuracy, helping you focus on your <strong>weaknesses</strong> first.</p>
                  </div>
                  <div className="stats-list">
                    {statsArray.map((stat) => (
                      <div key={stat.structure} className="stat-row">
                        <div className="stat-name">{stat.structure}</div>
                        <div className="stat-bar-container">
                          <div className="stat-bar-bg">
                            <div 
                              className={`stat-bar-fill ${stat.accuracy > 70 ? 'strong' : stat.accuracy > 40 ? 'medium' : 'weak'}`}
                              style={{ width: `${stat.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="stat-numbers">
                          {stat.correct}/{stat.total} ({Math.round(stat.accuracy)}%)
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className="btn" onClick={clearStats} style={{color: '#ef4444'}}>Reset Stats</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="progress-container">
        <span>Question {currentIndex + 1} of {quizData.length}</span>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentIndex + 1) / quizData.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="quiz-card">
        <div className="navigation">
          <button 
            className="btn" 
            onClick={prevQuestion} 
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          <span style={{ fontWeight: 600 }}>Slide: {currentQuiz.id}</span>
          <button 
            className="btn" 
            onClick={nextQuestion} 
            disabled={currentIndex === quizData.length - 1}
          >
            Next <ChevronRight size={20} />
          </button>
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
                disabled={currentIndex === quizData.length - 1}
              >
                Continue to Next Slide <ChevronRight size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
