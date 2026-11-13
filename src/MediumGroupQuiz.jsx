import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Shuffle,
  Image as ImageIcon,
  Layers,
  Compass,
  Edit3,
  Eye,
  EyeOff,
  Send
} from 'lucide-react';
import mediumGroupData from './medium_group_data.json';
import vestibularNucleiData from './vestibular_nuclei_data.json';
import { checkAnswer } from './utils';

const BASE_URL = import.meta.env.BASE_URL + 'images/';

const ALL_DATES = [
  { id: 'all', label: 'All Questions' },
  { id: '11/02', label: '11/02', title: 'Basal Ganglia & MS' },
  { id: '11/03', label: '11/03', title: 'Cerebellar Anatomy & Peduncles' },
  { id: '11/04', label: '11/04', title: 'Brainstem Pathways & Tumors' },
  { id: '11/05', label: '11/05', title: 'CNS Infections & Pathophysiology' },
  { id: '11/06', label: '11/06', title: 'Cerebral Vasculature & Aphasia' },
  { id: '11/09', label: '11/09', title: 'Stroke, CBF & Brain Death' },
  { id: '11/10', label: '11/10', title: 'Stroke Syndromes & Angiography' },
  { id: '11/11', label: '11/11', title: 'Limbic System & Hippocampus' }
];

const VESTIBULAR_SECTIONS = [
  { id: 'all', label: 'All Vestibular' },
  { id: 'Slide 6', label: 'Slide 6 (Caudal Pons)' },
  { id: 'Slide 7', label: 'Slide 7 (Facial Colliculus)' },
  { id: 'Slide 5', label: 'Slide 5 (PM Junction)' },
  { id: 'Slide 4', label: 'Slide 4 (Rostral Medulla)' },
  { id: '11/03', label: '11/03 (Open Medulla)' },
  { id: 'Pathways', label: 'Pathways (LVST & VOR)' },
  { id: 'Histology', label: 'Histology Recognition' }
];

function isAnswerMatch(userInput, q) {
  if (!userInput || !q) return false;
  const cleanInput = userInput.trim().toLowerCase();
  const cleanCorrect = (q.correctAnswer || '').trim().toLowerCase();

  // 1. Direct exact or lowercase match
  if (cleanInput === cleanCorrect) return true;

  // 2. checkAnswer utility from utils.js (handles synonyms, typos, suffixes)
  if (checkAnswer(userInput, q.correctAnswer)) return true;

  // 3. Match against acceptedAnswers list
  if (Array.isArray(q.acceptedAnswers)) {
    for (const alt of q.acceptedAnswers) {
      if (cleanInput === alt.toLowerCase()) return true;
      if (checkAnswer(userInput, alt)) return true;
    }
  }

  // 4. Letter match (e.g. user typed 'A' or 'a')
  if (q.letter && cleanInput === q.letter.toLowerCase()) return true;

  return false;
}

function MediumGroupQuiz({ onExit }) {
  // Mode: 'comprehensive' (all 77 Qs), 'images_only' (40 Qs with images), 'vestibular' (20 Vestibular Nuclei Drill Qs)
  const [subMode, setSubMode] = useState(() => {
    return localStorage.getItem('neuroQuizMediumGroupSubMode') || 'comprehensive';
  });

  const [selectedDate, setSelectedDate] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedImage, setExpandedImage] = useState(false);
  const [showLabeledImage, setShowLabeledImage] = useState(false);

  // Input method for vestibular drill: 'write_in' (default) vs 'multiple_choice'
  const [inputMethod, setInputMethod] = useState(() => {
    return localStorage.getItem('neuroQuizVestibularInputMethod') || 'write_in';
  });

  // Current typed input
  const [typedInput, setTypedInput] = useState('');

  // Store user selections: { [questionId]: selectedOptionOrCorrect }
  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('neuroQuizMediumGroupAnswers');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Store exact user typed responses: { [questionId]: userTypedText }
  const [userTypedInputs, setUserTypedInputs] = useState(() => {
    try {
      const saved = localStorage.getItem('neuroQuizMediumGroupTypedInputs');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const inputRef = useRef(null);

  // Base pool filtered by subMode
  const basePool = subMode === 'vestibular'
    ? vestibularNucleiData
    : subMode === 'images_only'
      ? mediumGroupData.filter(q => Boolean(q.image))
      : mediumGroupData;

  // Active question list filtered by selectedDate
  const filteredQuestions = selectedDate === 'all'
    ? basePool
    : basePool.filter(q => q.date === selectedDate);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];
  const selectedAnswer = currentQ ? userAnswers[currentQ.id] : null;
  const isAnswered = selectedAnswer !== undefined && selectedAnswer !== null;
  const isCorrect = isAnswered && selectedAnswer === currentQ?.correctAnswer;

  // Sync inputs and reset image label view on question / filter change
  useEffect(() => {
    setShowLabeledImage(false);
    if (currentQ) {
      setTypedInput(userTypedInputs[currentQ.id] || '');
    }
  }, [currentIndex, selectedDate, subMode]);

  // Auto-focus input when in write-in mode and not yet answered
  useEffect(() => {
    if ((subMode === 'vestibular' && inputMethod === 'write_in') && !isAnswered && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isAnswered, inputMethod, subMode]);

  // Switch subMode
  const handleSwitchSubMode = (newMode) => {
    setSubMode(newMode);
    localStorage.setItem('neuroQuizMediumGroupSubMode', newMode);
    setSelectedDate('all');
    setCurrentIndex(0);
    setExpandedImage(false);
    setShowLabeledImage(false);
  };

  const handleSelectDate = (dateId) => {
    setSelectedDate(dateId);
    setCurrentIndex(0);
    setExpandedImage(false);
    setShowLabeledImage(false);
  };

  // Multiple choice selection
  const handleSelectOption = (opt) => {
    if (isAnswered || !currentQ) return;
    const updated = { ...userAnswers, [currentQ.id]: opt };
    setUserAnswers(updated);
    try {
      localStorage.setItem('neuroQuizMediumGroupAnswers', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Typed response submission
  const handleWriteSubmit = (e) => {
    if (e) e.preventDefault();
    if (isAnswered || !currentQ) return;
    const trimmed = typedInput.trim();
    if (!trimmed) return;

    const isMatch = isAnswerMatch(trimmed, currentQ);
    const storedAns = isMatch ? currentQ.correctAnswer : `__WRONG__${trimmed}`;

    const updatedAnswers = { ...userAnswers, [currentQ.id]: storedAns };
    setUserAnswers(updatedAnswers);
    localStorage.setItem('neuroQuizMediumGroupAnswers', JSON.stringify(updatedAnswers));

    const updatedTyped = { ...userTypedInputs, [currentQ.id]: trimmed };
    setUserTypedInputs(updatedTyped);
    localStorage.setItem('neuroQuizMediumGroupTypedInputs', JSON.stringify(updatedTyped));
  };

  // Reset a single question to re-attempt
  const handleResetSingle = (questionId) => {
    const updatedAnswers = { ...userAnswers };
    delete updatedAnswers[questionId];
    setUserAnswers(updatedAnswers);
    localStorage.setItem('neuroQuizMediumGroupAnswers', JSON.stringify(updatedAnswers));

    const updatedTyped = { ...userTypedInputs };
    delete updatedTyped[questionId];
    setUserTypedInputs(updatedTyped);
    localStorage.setItem('neuroQuizMediumGroupTypedInputs', JSON.stringify(updatedTyped));

    setTypedInput('');
    setShowLabeledImage(false);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setExpandedImage(false);
      setShowLabeledImage(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setExpandedImage(false);
      setShowLabeledImage(false);
    }
  };

  const handleRandom = () => {
    if (filteredQuestions.length <= 1) return;
    let nextIdx = currentIndex;
    while (nextIdx === currentIndex) {
      nextIdx = Math.floor(Math.random() * filteredQuestions.length);
    }
    setCurrentIndex(nextIdx);
    setExpandedImage(false);
    setShowLabeledImage(false);
  };

  const handleResetSection = () => {
    const modeLabel = subMode === 'vestibular'
      ? 'Vestibular Nuclei Drill'
      : subMode === 'images_only'
        ? 'Images Only'
        : 'Comprehensive';
    if (!window.confirm(`Reset answers for the current ${modeLabel} filter?`)) return;
    const updated = { ...userAnswers };
    const updatedTyped = { ...userTypedInputs };
    filteredQuestions.forEach(q => {
      delete updated[q.id];
      delete updatedTyped[q.id];
    });
    setUserAnswers(updated);
    setUserTypedInputs(updatedTyped);
    localStorage.setItem('neuroQuizMediumGroupAnswers', JSON.stringify(updated));
    localStorage.setItem('neuroQuizMediumGroupTypedInputs', JSON.stringify(updatedTyped));
    setTypedInput('');
    setShowLabeledImage(false);
  };

  // Calculate score for currently active filter
  const totalInFilter = filteredQuestions.length;
  const answeredInFilter = filteredQuestions.filter(q => userAnswers[q.id] !== undefined);
  const correctInFilter = answeredInFilter.filter(q => userAnswers[q.id] === q.correctAnswer).length;
  const accuracyPct = answeredInFilter.length > 0 ? Math.round((correctInFilter / answeredInFilter.length) * 100) : 0;

  // Compute counts per date/section for active subMode
  const dateCounts = {};
  basePool.forEach(q => {
    dateCounts[q.date] = (dateCounts[q.date] || 0) + 1;
  });

  const activeFilterOptions = subMode === 'vestibular' ? VESTIBULAR_SECTIONS : ALL_DATES;

  // Determine active image: show labeled version only when toggled ON
  const activeImageFile = currentQ?.image
    ? (showLabeledImage && currentQ.labeled_image ? currentQ.labeled_image : (currentQ.unlabeled_image || currentQ.image))
    : null;

  const isWriteInActive = subMode === 'vestibular' ? inputMethod === 'write_in' : false;

  return (
    <div className="app-container" style={{ maxWidth: '980px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* TOP HEADER & EXIT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
        <button
          className="btn"
          onClick={onExit}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)' }}
        >
          <ArrowLeft size={18} /> Back to Practical Exams
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn"
            onClick={handleRandom}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            title="Jump to a random question"
          >
            <Shuffle size={16} /> Random
          </button>
          <button
            className="btn"
            onClick={handleResetSection}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#f87171' }}
            title="Clear all saved answers for current view"
          >
            <RotateCcw size={16} /> Reset Section
          </button>
        </div>
      </div>

      {/* MODE TITLE & BADGE */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(30, 41, 59, 0.7))',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.35rem' }}>🍝</span>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#fbbf24' }}>
                Medium Group Knowledge Checks
              </h1>
              <span style={{
                background: '#f59e0b',
                color: '#000',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Secret Mode
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
              Complete high-yield questions from the 8 Google Form Knowledge Checks (11/02 – 11/11) + Dedicated Vestibular Drills.
            </p>
          </div>

          {/* STATS CHIP */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '8px 14px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Filter Progress</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              {answeredInFilter.length} / {totalInFilter} Answered
            </div>
            <div style={{ fontSize: '0.8rem', color: accuracyPct >= 70 ? '#34d399' : accuracyPct > 0 ? '#f59e0b' : '#94a3b8' }}>
              {accuracyPct}% Accuracy ({correctInFilter} Correct)
            </div>
          </div>
        </div>
      </div>

      {/* SUB-MODE SELECTOR TABS (3 MODES) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '10px',
        marginBottom: '1.25rem'
      }}>
        {/* COMPREHENSIVE CARD */}
        <div
          onClick={() => handleSwitchSubMode('comprehensive')}
          style={{
            cursor: 'pointer',
            padding: '12px 14px',
            borderRadius: '10px',
            border: subMode === 'comprehensive' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
            background: subMode === 'comprehensive' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: subMode === 'comprehensive' ? '#fbbf24' : '#f8fafc'
            }}>
              <Layers size={17} /> Comprehensive
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              background: '#f59e0b',
              color: '#000'
            }}>
              77 QUESTIONS
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.35 }}>
            All clinical cases, neuroanatomy slides, lesion vignettes & pathology across all 8 forms.
          </span>
        </div>

        {/* JUST IMAGES CARD */}
        <div
          onClick={() => handleSwitchSubMode('images_only')}
          style={{
            cursor: 'pointer',
            padding: '12px 14px',
            borderRadius: '10px',
            border: subMode === 'images_only' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
            background: subMode === 'images_only' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: subMode === 'images_only' ? '#fbbf24' : '#f8fafc'
            }}>
              <ImageIcon size={17} /> Just Images
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              background: '#f59e0b',
              color: '#000'
            }}>
              40 QUESTIONS
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.35 }}>
            Focus strictly on specimen slides, MRIs, CT scans, and anatomical letter-identification questions.
          </span>
        </div>

        {/* VESTIBULAR NUCLEI DRILL CARD */}
        <div
          onClick={() => handleSwitchSubMode('vestibular')}
          style={{
            cursor: 'pointer',
            padding: '12px 14px',
            borderRadius: '10px',
            border: subMode === 'vestibular' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
            background: subMode === 'vestibular' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: subMode === 'vestibular' ? '#c084fc' : '#e9d5ff'
            }}>
              <Compass size={17} /> Vestibular Nuclei
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              background: '#a855f7',
              color: '#fff'
            }}>
              20 DRILLS
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.35 }}>
            Unlabeled slices with type-in recall: Superior, Lateral, Medial & Inferior Vestibular Nuclei.
          </span>
        </div>
      </div>

      {/* FILTER PILLS (DATES OR VESTIBULAR SECTIONS) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '6px',
        marginBottom: '1.25rem',
        scrollbarWidth: 'thin'
      }}>
        {activeFilterOptions.map(d => {
          const isSelected = selectedDate === d.id;
          const count = d.id === 'all' ? basePool.length : (dateCounts[d.id] || 0);

          if (d.id !== 'all' && count === 0) {
            return null;
          }

          const accentColor = subMode === 'vestibular' ? '#a855f7' : '#f59e0b';
          const accentTextColor = subMode === 'vestibular' ? '#d8b4fe' : '#fbbf24';
          const accentBg = subMode === 'vestibular' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(245, 158, 11, 0.18)';

          return (
            <button
              key={d.id}
              onClick={() => handleSelectDate(d.id)}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                border: isSelected ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.08)',
                background: isSelected ? accentBg : 'rgba(30, 41, 59, 0.6)',
                color: isSelected ? accentTextColor : '#cbd5e1',
                transition: 'all 0.15s ease'
              }}
            >
              {d.label} ({count})
            </button>
          );
        })}
      </div>

      {/* QUESTION CARD HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        padding: '0 4px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
            Question {currentIndex + 1} of {filteredQuestions.length}
          </span>
          {currentQ && (
            <span style={{
              fontSize: '0.8rem',
              color: subMode === 'vestibular' ? '#c084fc' : '#94a3b8',
              background: subMode === 'vestibular' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.08)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 600
            }}>
              {currentQ.date} • {currentQ.formTitle}
            </span>
          )}
        </div>

        {/* INPUT METHOD TOGGLE (ONLY FOR VESTIBULAR DRILL) */}
        {subMode === 'vestibular' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginRight: '4px' }}>Mode:</span>
            <button
              type="button"
              onClick={() => {
                setInputMethod('write_in');
                localStorage.setItem('neuroQuizVestibularInputMethod', 'write_in');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: inputMethod === 'write_in' ? 700 : 500,
                background: inputMethod === 'write_in' ? '#a855f7' : 'transparent',
                color: inputMethod === 'write_in' ? '#fff' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Edit3 size={13} /> Write It Out
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMethod('multiple_choice');
                localStorage.setItem('neuroQuizVestibularInputMethod', 'multiple_choice');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: inputMethod === 'multiple_choice' ? 700 : 500,
                background: inputMethod === 'multiple_choice' ? '#a855f7' : 'transparent',
                color: inputMethod === 'multiple_choice' ? '#fff' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              🔘 Multiple Choice
            </button>
          </div>
        )}
      </div>

      {/* QUIZ MAIN CARD */}
      {!currentQ ? (
        <div className="quiz-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>No questions match the current filter.</p>
          <button className="btn" onClick={() => setSelectedDate('all')}>View All Questions</button>
        </div>
      ) : (
        <div className="quiz-card" style={{ padding: '1.75rem', gap: '1.5rem', background: '#1e293b' }}>
          {/* NAVIGATION BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              {subMode === 'vestibular' ? `Drill #${currentIndex + 1} of ${filteredQuestions.length}` : `Slide #${currentQ.id} of ${mediumGroupData.length}`}
            </span>
            <button
              className="btn"
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>

          {/* IMAGE DISPLAY */}
          {activeImageFile && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                className="image-container"
                onClick={() => setExpandedImage(prev => !prev)}
                style={{
                  cursor: 'pointer',
                  maxHeight: expandedImage ? '900px' : '520px',
                  width: '100%',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#090d16',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}
                title="Click to toggle zoom"
              >
                <img
                  src={BASE_URL + activeImageFile}
                  alt="Neuroanatomy specimen"
                  style={{
                    maxHeight: expandedImage ? '900px' : '520px',
                    objectFit: 'contain',
                    width: 'auto',
                    maxWidth: '100%'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.65)',
                  color: '#cbd5e1',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  backdropFilter: 'blur(4px)'
                }}>
                  🔍 {expandedImage ? 'Click to shrink' : 'Click to enlarge'}
                </span>
              </div>

              {/* TOGGLE LABELED ANSWER SLIDE BUTTON */}
              {currentQ.labeled_image && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowLabeledImage(prev => !prev)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.84rem',
                    background: showLabeledImage ? 'rgba(59, 130, 246, 0.22)' : 'rgba(30, 41, 59, 0.75)',
                    border: showLabeledImage ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.15)',
                    color: showLabeledImage ? '#93c5fd' : '#cbd5e1',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {showLabeledImage ? <EyeOff size={15} /> : <Eye size={15} />}
                  {showLabeledImage ? 'Hide Labeled Slide (Back to Unlabeled)' : '👁️ Show Labeled Answer Slide'}
                </button>
              )}
            </div>
          )}

          {/* QUESTION PROMPT */}
          <div style={{ marginTop: activeImageFile ? '0.5rem' : '0' }}>
            <h2 style={{
              fontSize: '1.25rem',
              lineHeight: 1.45,
              fontWeight: 700,
              color: '#f8fafc',
              marginBottom: '0.25rem'
            }}>
              {currentQ.question}
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {isAnswered
                ? 'Question completed • Check feedback below or advance to next'
                : isWriteInActive
                  ? 'Type your answer below (e.g. structure name or pointer letter) and press Enter:'
                  : 'Select the single best answer:'}
            </span>
          </div>

          {/* WRITE-IT-OUT FORM */}
          {isWriteInActive ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <form onSubmit={handleWriteSubmit} style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Write structure name (e.g. superior vestibular nucleus) or letter..."
                    value={typedInput}
                    onChange={e => setTypedInput(e.target.value)}
                    disabled={isAnswered}
                    style={{
                      flex: 1,
                      padding: '14px 18px',
                      fontSize: '1.05rem',
                      borderRadius: '10px',
                      border: isAnswered
                        ? (isCorrect ? '2px solid #10b981' : '2px solid #ef4444')
                        : '2px solid rgba(168, 85, 247, 0.45)',
                      background: isAnswered
                        ? (isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)')
                        : '#0f172a',
                      color: '#f8fafc',
                      outline: 'none',
                      boxShadow: !isAnswered ? '0 0 12px rgba(168, 85, 247, 0.18)' : 'none'
                    }}
                  />
                  {!isAnswered ? (
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        padding: '0 24px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        background: '#a855f7',
                        borderColor: '#9333ea',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      Submit <Send size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => handleResetSingle(currentQ.id)}
                      style={{
                        padding: '0 18px',
                        fontSize: '0.92rem',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <RotateCcw size={15} /> Try Again
                    </button>
                  )}
                </div>
              </form>

              {isAnswered && (
                <div style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                  fontSize: '0.95rem',
                  color: isCorrect ? '#34d399' : '#f87171'
                }}>
                  {isCorrect ? (
                    <span>✓ <strong>Correct!</strong> Your written response: <em>"{userTypedInputs[currentQ.id] || typedInput}"</em></span>
                  ) : (
                    <span>✗ <strong>Incorrect.</strong> You wrote: <em>"{userTypedInputs[currentQ.id] || typedInput}"</em> • Expected: <strong>{currentQ.correctAnswer}</strong></span>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* MULTIPLE CHOICE OPTIONS GRID */
            <div style={{
              display: 'grid',
              gridTemplateColumns: currentQ.options.length > 6 ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr',
              gap: '10px'
            }}>
              {currentQ.options.map((option, idx) => {
                const isThisSelected = selectedAnswer === option;
                const isThisCorrect = option === currentQ.correctAnswer;

                let bgColor = 'rgba(30, 41, 59, 0.8)';
                let borderColor = 'rgba(255, 255, 255, 0.08)';
                let textColor = '#f8fafc';
                let icon = null;

                if (isAnswered) {
                  if (isThisCorrect) {
                    bgColor = 'rgba(16, 185, 129, 0.18)';
                    borderColor = '#10b981';
                    textColor = '#34d399';
                    icon = <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0 }} />;
                  } else if (isThisSelected && !isThisCorrect) {
                    bgColor = 'rgba(239, 68, 68, 0.18)';
                    borderColor = '#ef4444';
                    textColor = '#f87171';
                    icon = <XCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />;
                  } else {
                    bgColor = 'rgba(15, 23, 42, 0.4)';
                    borderColor = 'rgba(255, 255, 255, 0.04)';
                    textColor = '#64748b';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    disabled={isAnswered}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '10px',
                      border: `2px solid ${borderColor}`,
                      background: bgColor,
                      color: textColor,
                      fontSize: '1rem',
                      fontWeight: isAnswered && (isThisSelected || isThisCorrect) ? 600 : 500,
                      cursor: isAnswered ? 'default' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isThisSelected ? '0 0 12px rgba(59,130,246,0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isAnswered
                          ? (isThisCorrect ? '#10b981' : isThisSelected ? '#ef4444' : 'rgba(255,255,255,0.08)')
                          : 'rgba(255,255,255,0.08)',
                        color: isAnswered && (isThisCorrect || isThisSelected) ? '#fff' : '#cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>
                    {icon}
                  </button>
                );
              })}
            </div>
          )}

          {/* EXPLANATION FEEDBACK BOX */}
          {isAnswered && (
            <div style={{
              background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isCorrect ? (
                  <>
                    <CheckCircle size={22} color="#10b981" />
                    <strong style={{ color: '#34d399', fontSize: '1.05rem' }}>Correct!</strong>
                  </>
                ) : (
                  <>
                    <XCircle size={22} color="#ef4444" />
                    <strong style={{ color: '#f87171', fontSize: '1.05rem' }}>
                      Incorrect. The correct answer is: {currentQ.correctAnswer}
                    </strong>
                  </>
                )}
              </div>

              {currentQ.explanation && (
                <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                  💡 <strong>High-Yield Concept:</strong> {currentQ.explanation}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleResetSingle(currentQ.id)}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.88rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#cbd5e1'
                  }}
                >
                  <RotateCcw size={15} /> Try Again
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={currentIndex === filteredQuestions.length - 1}
                  style={{ padding: '8px 20px', fontSize: '0.95rem' }}
                >
                  {currentIndex === filteredQuestions.length - 1 ? 'End of Section' : 'Next Question'} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MediumGroupQuiz;
