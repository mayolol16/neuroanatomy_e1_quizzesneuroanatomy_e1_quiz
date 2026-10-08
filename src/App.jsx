import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Info, RefreshCw, BarChart2, X } from 'lucide-react';
import stringSimilarity from 'string-similarity';
import quizData from './quiz_data.json';

const BASE_URL = import.meta.env.BASE_URL + 'images/';

const ALTERNATIVE_ANSWERS = {
  "als": ["lateral spinothalamic tract", "anterolateral system", "spinothalamic tract"],
  "spinal trigeminal nucleus": ["nucleus of the spinal tract of v", "spinal nucleus of v", "spinal nucleus of 5"],
  "spinal trigeminal tract": ["spinal tract of v", "spinal tract of 5"],
  "spinal trigeminal nucleustract": ["spinal trigeminal nucleus and tract", "spinal tract of v", "nucleus of the spinal tract of v", "spinal trigeminal nucleus", "spinal trigeminal tract"],
  "fasciculus gracilis": ["gracile fasciculus", "tract of goll"],
  "fasciculus cuneatus": ["cuneate fasciculus", "tract of burdach"],
  "nucleus gracilis": ["gracile nucleus"],
  "nucleus cuneatus": ["cuneate nucleus"],
  "medial lemniscus": ["reils band", "ribbon of reil"],
  "decussation of medial lemniscus": ["internal arcuate fibers decussation", "sensory decussation"],
  "internal arcuate fibers": ["internal arcuate fibres"],
  "corticospinal tract": ["pyramidal tract"],
  "mlf": ["medial longitudinal fasciculus"],
  "fourth ventricle": ["4th ventricle", "iv ventricle"],
  "third ventricle": ["3rd ventricle", "iii ventricle"],
  "ventral trigeminothalamic tract": ["vtt", "ventral trigeminalthalamic tract", "ventral trigeminal tract", "ventral trigeminothalamic"],
  "vtt": ["ventral trigeminothalamic tract", "ventral trigeminalthalamic tract", "ventral trigeminal tract"],
  "trigeminal nerve": ["cn v", "cn 5", "cranial nerve v", "cranial nerve 5", "cranial nerve five"],
  "cn v": ["trigeminal nerve", "cranial nerve v", "cn 5", "cranial nerve 5"],
  "fibers of trigeminal nerve": ["trigeminal nerve fibers", "cn v fibers", "cn 5 fibers"],
  "chief sensory nucleus of v": ["principal sensory nucleus of v", "main sensory nucleus of v", "chief sensory nucleus of 5"],
  "trigeminal motor nucleus": ["motor nucleus of v", "motor nucleus of 5", "masticatory nucleus"],
  "pag": ["periaqueductal gray", "periaqueductal grey", "central gray"],
  "periaqueductal gray": ["pag", "periaqueductal grey", "central gray"],
  "vpl": ["ventral posterolateral nucleus", "ventral posterolateral", "vpl nucleus"],
  "vpm": ["ventral posteromedial nucleus", "ventral posteromedial", "vpm nucleus"],
  "anterior white commissure": ["ventral white commissure"],
  "dorsal median sulcus": ["posterior median sulcus"],
  "dorsolateral fasciculus": ["tract of lissauer", "lissauers tract"],
  "dorsolateral sulcus": ["posterolateral sulcus"],
  "substantia gelatinosa": ["lamina ii", "lamina 2"],
  "nucleus proprius": ["lamina iii and iv", "lamina 3 and 4"],
  "intermediolateral cell column": ["iml", "lateral horn"],
  "ventral median fissure": ["anterior median fissure"],
  "cerebral aqueduct": ["aqueduct of sylvius", "mesencephalic aqueduct"],
  "interventricular foramen": ["foramen of monro"],
  "lateral ventricle anterior horn": ["frontal horn of lateral ventricle", "anterior horn of lateral ventricle", "anterior horn", "frontal horn"],
  "lateral ventricle posterior horn": ["occipital horn of lateral ventricle", "posterior horn of lateral ventricle", "posterior horn", "occipital horn"],
  "lateral ventricle temporal horn": ["inferior horn of lateral ventricle", "temporal horn of lateral ventricle", "lateral ventricle inferior horn", "inferior horn", "temporal horn"],
  "internal capsule anterior limb": ["anterior limb of internal capsule", "anterior limb internal capsule"],
  "internal capsule posterior limb": ["posterior limb of internal capsule", "posterior limb internal capsule"],
  "internal capsule genu": ["genu of internal capsule", "genu internal capsule"],
  "central sulcus": ["fissure of rolando", "rolandic fissure"],
  "postcentral gyrus": ["primary somatosensory cortex", "somatosensory cortex", "s1"],
  "cingulate gyrus": ["cingulate cortex"],
  "subarachnoid space": ["subarachnoid cavity"],
  "pia": ["pia mater"],
  "dura": ["dura mater"],
  "arachnoid": ["arachnoid mater"],
  "gray matter": ["grey matter", "substantia grisea"],
  "white matter": ["substantia alba"],
};

function App() {
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

  const currentQuiz = quizData[currentIndex];
  
  const checkAnswer = (userAns, correctAns) => {
    if (!userAns) return false;
    const clean = (str) => str.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
    
    const cleanUser = clean(userAns);
    const cleanCorrect = clean(correctAns);
    
    // Check main answer
    if (cleanUser === cleanCorrect || stringSimilarity.compareTwoStrings(cleanUser, cleanCorrect) > 0.8) {
      return true;
    }
    
    // Check alternatives
    const alternatives = ALTERNATIVE_ANSWERS[cleanCorrect] || [];
    for (const alt of alternatives) {
      const cleanAlt = clean(alt);
      if (cleanUser === cleanAlt || stringSimilarity.compareTwoStrings(cleanUser, cleanAlt) > 0.8) {
        return true;
      }
    }
    
    return false;
  };

  const handleInputChange = (letter, value) => {
    setAnswers(prev => ({ ...prev, [letter]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setSubmitted(true);

    // Update stats
    const newStats = { ...stats };
    currentQuiz.questions.forEach(q => {
      const isCorrect = checkAnswer(answers[q.letter] || '', q.answer);
      if (!newStats[q.answer]) {
        newStats[q.answer] = { correct: 0, total: 0 };
      }
      newStats[q.answer].total += 1;
      if (isCorrect) {
        newStats[q.answer].correct += 1;
      }
    });
    setStats(newStats);
    localStorage.setItem('neuroQuizStats', JSON.stringify(newStats));
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
    if (window.confirm('Are you sure you want to clear your statistics?')) {
      setStats({});
      localStorage.removeItem('neuroQuizStats');
    }
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

  return (
    <div className="app-container">
      <div className="header">
        <h1>Neuro Practical Exam 1</h1>
        <p>Interactive Quiz Mode with Flexible Grading</p>
        <button className="btn btn-secondary stats-toggle-btn" onClick={toggleStats}>
          <BarChart2 size={18} /> View Analytics
        </button>
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
