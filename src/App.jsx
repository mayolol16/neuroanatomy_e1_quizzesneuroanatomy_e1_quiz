import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, BarChart2, X, BrainCircuit, Zap, BookOpen } from 'lucide-react';
import exam1Data from './quiz_data.json';
import exam2Data from './exam2_data.json';
import exam3Data from './exam3_data.json';
import { checkAnswer, isExamMistake } from './utils';
import SpacedRepetition from './SpacedRepetition';
import ZenMode from './ZenMode';

const BASE_URL = import.meta.env.BASE_URL + 'images/';

function App() {
  const [activeExam, setActiveExam] = useState(() => {
    return localStorage.getItem('neuroQuizActiveExam') || 'exam2';
  });

  const [mode, setMode] = useState('quiz'); // 'quiz', 'review', 'zen'
  const [selectedReviewExam, setSelectedReviewExam] = useState(null);
  const [selectedZenExam, setSelectedZenExam] = useState(null);

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

  const currentQuizData = activeExam === 'exam1' ? exam1Data : activeExam === 'exam2' ? exam2Data : exam3Data;
  const currentQuiz = currentQuizData[currentIndex];

  const switchExam = (examKey) => {
    setActiveExam(examKey);
    localStorage.setItem('neuroQuizActiveExam', examKey);
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted(false);
    setShowLabeled(false);
    window.scrollTo(0, 0);
  };
  
  const handleInputChange = (letter, value) => {
    setAnswers(prev => ({ ...prev, [letter]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setSubmitted(true);

    // Update stats & mistakes
    const newStats = { ...stats };
    const newMistakes = { ...mistakes };
    
    currentQuiz.questions.forEach(q => {
      const isCorrect = checkAnswer(answers[q.letter] || '', q.answer);
      if (!newStats[q.answer]) {
        newStats[q.answer] = { correct: 0, total: 0 };
      }
      newStats[q.answer].total += 1;
      
      const mistakeKey = `${activeExam}_${currentQuiz.id}_${q.letter}`;
      
      if (isCorrect) {
        newStats[q.answer].correct += 1;
      } else {
        if (!newMistakes[mistakeKey]) {
          newMistakes[mistakeKey] = {
            id: mistakeKey,
            exam: activeExam,
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
    if (currentIndex < currentQuizData.length - 1) {
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
  if (submitted && currentQuiz && currentQuiz.questions) {
    currentQuiz.questions.forEach(q => {
      if (checkAnswer(answers[q.letter] || '', q.answer)) {
        correctCount++;
      }
    });
  }

  // Count due mistakes strictly separated by exam
  const exam1DueCount = Object.values(mistakes).filter(m => isExamMistake(m, 'exam1') && m.nextReviewDate <= Date.now()).length;
  const exam2DueCount = Object.values(mistakes).filter(m => isExamMistake(m, 'exam2') && m.nextReviewDate <= Date.now()).length;
  const exam3DueCount = Object.values(mistakes).filter(m => isExamMistake(m, 'exam3') && m.nextReviewDate <= Date.now()).length;
  const currentExamDueCount = activeExam === 'exam1' ? exam1DueCount : activeExam === 'exam2' ? exam2DueCount : exam3DueCount;

  // Process stats for display (filtered to structures appearing in current exam)
  const currentExamStructures = new Set(currentQuizData.flatMap(s => (s.questions || []).map(q => q.answer)));
  const statsArray = Object.entries(stats)
    .filter(([structure]) => currentExamStructures.has(structure))
    .map(([structure, data]) => ({
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
        initialExam={selectedReviewExam}
        onExit={() => {
          setSelectedReviewExam(null);
          setMode('quiz');
        }} 
      />
    );
  }

  if (mode === 'zen') {
    return (
      <ZenMode 
        quizData1={exam1Data}
        quizData2={exam2Data}
        quizData3={exam3Data}
        initialExam={selectedZenExam}
        stats={stats}
        setStats={setStats}
        mistakes={mistakes}
        setMistakes={setMistakes}
        onExit={() => {
          setSelectedZenExam(null);
          setMode('quiz');
        }}
      />
    );
  }

  const isStudySlide = !currentQuiz.questions || currentQuiz.questions.length === 0;

  return (
    <div className="app-container">
      <div className="header">
        {/* STEP 1: SELECT EXAM AT THE START */}
        <div style={{ 
          background: 'var(--surface-color)', 
          padding: '16px', 
          borderRadius: '14px', 
          marginBottom: '20px', 
          border: '1px solid var(--surface-color-light)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <div style={{ 
            fontSize: '0.85rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            color: '#94a3b8', 
            fontWeight: 700, 
            marginBottom: '12px', 
            textAlign: 'center' 
          }}>
            Step 1: Choose Exam to Review
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div 
              onClick={() => switchExam('exam1')}
              style={{
                padding: '16px',
                borderRadius: '10px',
                cursor: 'pointer',
                border: activeExam === 'exam1' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                background: activeExam === 'exam1' ? 'rgba(59, 130, 246, 0.16)' : 'rgba(0,0,0,0.25)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.1rem', color: activeExam === 'exam1' ? '#60a5fa' : '#f8fafc' }}>
                  Exam 1: Sensory Systems
                </strong>
                {activeExam === 'exam1' && (
                  <span style={{ background: '#3b82f6', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                    SELECTED
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>{exam1Data.length} Slides • Sensory Tracts, Nuclei & Brainstem</span>
              <div style={{ fontSize: '0.82rem', color: exam1DueCount > 0 ? '#f87171' : '#34d399', fontWeight: 600, marginTop: '2px' }}>
                {exam1DueCount} Spaced Repetition {exam1DueCount === 1 ? 'card' : 'cards'} due
              </div>
            </div>

            <div 
              onClick={() => switchExam('exam2')}
              style={{
                padding: '16px',
                borderRadius: '10px',
                cursor: 'pointer',
                border: activeExam === 'exam2' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                background: activeExam === 'exam2' ? 'rgba(59, 130, 246, 0.16)' : 'rgba(0,0,0,0.25)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.1rem', color: activeExam === 'exam2' ? '#60a5fa' : '#f8fafc' }}>
                  Exam 2: Motor & CNs
                </strong>
                {activeExam === 'exam2' && (
                  <span style={{ background: '#3b82f6', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                    SELECTED
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>{exam2Data.length} Slides • Motor Tracts, CNs, Ear & Eye, Nuclei</span>
              <div style={{ fontSize: '0.82rem', color: exam2DueCount > 0 ? '#f87171' : '#34d399', fontWeight: 600, marginTop: '2px' }}>
                {exam2DueCount} Spaced Repetition {exam2DueCount === 1 ? 'card' : 'cards'} due
              </div>
            </div>

            <div 
              onClick={() => switchExam('exam3')}
              style={{
                padding: '16px',
                borderRadius: '10px',
                cursor: 'pointer',
                border: activeExam === 'exam3' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                background: activeExam === 'exam3' ? 'rgba(59, 130, 246, 0.16)' : 'rgba(0,0,0,0.25)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.1rem', color: activeExam === 'exam3' ? '#60a5fa' : '#f8fafc' }}>
                  Exam 3: Comprehensive
                </strong>
                {activeExam === 'exam3' && (
                  <span style={{ background: '#3b82f6', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                    SELECTED
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>{exam3Data.length} Slides • Cerebellum, Basal Ganglia, Cortex & Gross</span>
              <div style={{ fontSize: '0.82rem', color: exam3DueCount > 0 ? '#f87171' : '#34d399', fontWeight: 600, marginTop: '2px' }}>
                {exam3DueCount} Spaced Repetition {exam3DueCount === 1 ? 'card' : 'cards'} due
              </div>
            </div>
          </div>
        </div>

        {/* TITLE & DESCRIPTION */}
        <h1>{activeExam === 'exam1' ? 'Neuro Practical Exam 1' : activeExam === 'exam2' ? 'Neuro Practical Exam 2' : 'Neuro Practical Exam 3'}</h1>
        <p>
          {activeExam === 'exam1' 
            ? 'Sensory Pathways & Brainstem Neuroanatomy' 
            : activeExam === 'exam2'
              ? 'Motor Pathways, Cranial Nerves, Auditory & Visual Systems'
              : 'Comprehensive Practical: Cerebellum, Basal Ganglia, Cortex, Vasculature & Gross Anatomy'}
        </p>

        {activeExam === 'exam3' && (
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.85rem', 
            color: '#cbd5e1', 
            background: 'rgba(59, 130, 246, 0.12)', 
            border: '1px solid rgba(59, 130, 246, 0.28)',
            padding: '6px 14px', 
            borderRadius: '999px',
            marginTop: '10px'
          }}>
            <span>💡 <strong>Black</strong> = Structures on Exam 1-2</span>
            <span>•</span>
            <span style={{ color: '#60a5fa', fontWeight: 700 }}>Blue = New structures on Exam 3</span>
          </div>
        )}

        {/* STEP 2: SELECT MODE */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary stats-toggle-btn" onClick={toggleStats} style={{ position: 'static' }}>
            <BarChart2 size={18} /> {activeExam === 'exam1' ? 'Exam 1' : activeExam === 'exam2' ? 'Exam 2' : 'Exam 3'} Analytics
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setSelectedReviewExam(activeExam);
              setMode('review');
            }}
          >
            <BrainCircuit size={18} style={{ marginRight: '8px' }} /> 
            {activeExam === 'exam1' ? 'Exam 1' : activeExam === 'exam2' ? 'Exam 2' : 'Exam 3'} Spaced Repetition 
            {currentExamDueCount > 0 && (
              <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 8px', marginLeft: '6px', fontSize: '0.8rem' }}>
                {currentExamDueCount}
              </span>
            )}
          </button>
          
          <button 
            className="btn" 
            onClick={() => {
              setSelectedZenExam(activeExam);
              setMode('zen');
            }} 
            style={{ backgroundColor: '#8b5cf6', color: 'white' }}
          >
            <Zap size={18} style={{ marginRight: '8px' }} /> {activeExam === 'exam1' ? 'Exam 1' : activeExam === 'exam2' ? 'Exam 2' : 'Exam 3'} Zen Mode
          </button>
        </div>
      </div>

      {showStats && (
        <div className="stats-modal-overlay">
          <div className="stats-modal">
            <div className="stats-modal-header">
              <h2>{activeExam === 'exam1' ? 'Exam 1' : activeExam === 'exam2' ? 'Exam 2' : 'Exam 3'} Analytics</h2>
              <button className="icon-btn" onClick={toggleStats}><X size={24} /></button>
            </div>
            
            <div className="stats-content">
              {statsArray.length === 0 ? (
                <p className="no-stats">Answer questions in {activeExam === 'exam1' ? 'Exam 1' : activeExam === 'exam2' ? 'Exam 2' : 'Exam 3'} to see your strengths and weaknesses!</p>
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
        <span>Slide {currentIndex + 1} of {currentQuizData.length}</span>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentIndex + 1) / currentQuizData.length) * 100}%` }}
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
          <span style={{ fontWeight: 600 }}>Slide {currentQuiz.id}</span>
          <button 
            className="btn" 
            onClick={nextQuestion} 
            disabled={currentIndex === currentQuizData.length - 1}
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
          {isStudySlide ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '24px', 
              background: 'rgba(59, 130, 246, 0.08)', 
              borderRadius: '12px', 
              border: '1px solid rgba(59, 130, 246, 0.25)',
              margin: '10px 0 20px 0'
            }}>
              <h4 style={{ color: '#93c5fd', marginBottom: '8px', fontSize: '1.2rem' }}>
                📖 Study Reference Slide
              </h4>
              <p style={{ color: 'var(--text-color-muted)', marginBottom: '12px' }}>
                Questions were not assigned for this slide on the original university practical exam.
              </p>
              <p style={{ color: 'var(--text-color)', fontSize: '0.95rem' }}>
                Click <strong>"Show Labeled Image"</strong> above to study these anatomical landmarks, then click Continue to proceed.
              </p>
            </div>
          ) : (
            <>
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
                        <span 
                          className="letter-badge"
                          style={{
                            backgroundColor: q.letter.toLowerCase().includes('red') 
                              ? '#ef4444' 
                              : q.letter.toLowerCase().includes('pink') 
                                ? '#ec4899' 
                                : q.letter.toLowerCase().includes('blue')
                                  ? '#0284c7'
                                  : undefined
                          }}
                        >
                          {q.letter}
                        </span>
                        {q.description && <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>({q.description})</span>}
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
            </>
          )}
          
          <div className="controls">
            {isStudySlide ? (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={nextQuestion}
                disabled={currentIndex === currentQuizData.length - 1}
              >
                Continue to Next Slide <ChevronRight size={20} />
              </button>
            ) : !submitted ? (
              <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                Submit Answers
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={nextQuestion}
                disabled={currentIndex === currentQuizData.length - 1}
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
