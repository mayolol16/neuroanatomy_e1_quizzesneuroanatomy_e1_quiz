import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, RotateCcw, ArrowLeft, Shuffle, Sparkles, Image as ImageIcon } from 'lucide-react';
import mediumGroupData from './medium_group_data.json';

const BASE_URL = import.meta.env.BASE_URL + 'images/';

const DATES = [
  { id: 'all', label: 'All Questions', count: 77 },
  { id: '11/02', label: '11/02', count: 6, title: 'Basal Ganglia & MS' },
  { id: '11/03', label: '11/03', count: 10, title: 'Cerebellar Anatomy & Peduncles' },
  { id: '11/04', label: '11/04', count: 11, title: 'Brainstem Pathways & Tumors' },
  { id: '11/05', label: '11/05', count: 6, title: 'CNS Infections & Pathophysiology' },
  { id: '11/06', label: '11/06', count: 13, title: 'Cerebral Vasculature & Aphasia' },
  { id: '11/09', label: '11/09', count: 11, title: 'Stroke, CBF & Brain Death' },
  { id: '11/10', label: '11/10', count: 10, title: 'Stroke Syndromes & Angiography' },
  { id: '11/11', label: '11/11', count: 10, title: 'Limbic System & Hippocampus' }
];

function MediumGroupQuiz({ onExit }) {
  const [selectedDate, setSelectedDate] = useState('all');
  const [filteredQuestions, setFilteredQuestions] = useState(mediumGroupData);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Store user selections: { [questionId]: selectedOption }
  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('neuroQuizMediumGroupAnswers');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [expandedImage, setExpandedImage] = useState(false);

  // Filter questions whenever selectedDate changes
  useEffect(() => {
    if (selectedDate === 'all') {
      setFilteredQuestions(mediumGroupData);
    } else {
      setFilteredQuestions(mediumGroupData.filter(q => q.date === selectedDate));
    }
    setCurrentIndex(0);
    setExpandedImage(false);
  }, [selectedDate]);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];
  const selectedAnswer = currentQ ? userAnswers[currentQ.id] : null;
  const isAnswered = selectedAnswer !== undefined && selectedAnswer !== null;
  const isCorrect = isAnswered && selectedAnswer === currentQ.correctAnswer;

  const handleSelectOption = (opt) => {
    if (isAnswered) return; // already answered
    const updated = { ...userAnswers, [currentQ.id]: opt };
    setUserAnswers(updated);
    try {
      localStorage.setItem('neuroQuizMediumGroupAnswers', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setExpandedImage(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setExpandedImage(false);
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
  };

  const handleResetSection = () => {
    if (!window.confirm('Reset answers for the current filter?')) return;
    const updated = { ...userAnswers };
    filteredQuestions.forEach(q => {
      delete updated[q.id];
    });
    setUserAnswers(updated);
    localStorage.setItem('neuroQuizMediumGroupAnswers', JSON.stringify(updated));
  };

  // Calculate score for currently active filter
  const totalInFilter = filteredQuestions.length;
  const answeredInFilter = filteredQuestions.filter(q => userAnswers[q.id] !== undefined);
  const correctInFilter = answeredInFilter.filter(q => userAnswers[q.id] === q.correctAnswer).length;
  const accuracyPct = answeredInFilter.length > 0 ? Math.round((correctInFilter / answeredInFilter.length) * 100) : 0;

  if (!currentQ) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '40px' }}>
        <p>No questions found.</p>
        <button className="btn" onClick={onExit}>Return</button>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* TOP NAVIGATION BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <button
          className="btn"
          onClick={onExit}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)' }}
        >
          <ArrowLeft size={18} /> Back to Practical Exams
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.78rem',
            padding: '4px 10px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            🍝 SECRET UNLOCKED
          </span>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Medium Group (77 Qs)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn"
            onClick={handleRandom}
            title="Random Question"
            style={{ padding: '8px 12px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.06)' }}
          >
            <Shuffle size={16} /> Random
          </button>
          <button
            className="btn"
            onClick={handleResetSection}
            title="Reset Answers"
            style={{ padding: '8px 12px', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* DATE FILTER PILLS */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '10px',
        marginBottom: '1.25rem',
        scrollbarWidth: 'thin'
      }}>
        {DATES.map(d => {
          const isSelected = selectedDate === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDate(d.id)}
              style={{
                whiteSpace: 'nowrap',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                background: isSelected ? 'rgba(245, 158, 11, 0.18)' : 'rgba(30, 41, 59, 0.6)',
                color: isSelected ? '#fbbf24' : '#cbd5e1',
                transition: 'all 0.15s ease'
              }}
            >
              {d.label} <span style={{ opacity: 0.6, fontSize: '0.78rem' }}>({d.count})</span>
            </button>
          );
        })}
      </div>

      {/* PROGRESS & SCORE STATS BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(30, 41, 59, 0.7)',
        borderRadius: '10px',
        padding: '12px 18px',
        marginBottom: '1.25rem',
        border: '1px solid rgba(255,255,255,0.05)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc' }}>
            Question {currentIndex + 1} of {filteredQuestions.length}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
            {currentQ.date} • {currentQ.formTitle}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem' }}>
          <span style={{ color: '#10b981', fontWeight: 600 }}>
            ✓ {correctInFilter} Correct
          </span>
          <span style={{ color: '#ef4444', fontWeight: 600 }}>
            ✗ {answeredInFilter.length - correctInFilter} Incorrect
          </span>
          <span style={{ color: '#94a3b8' }}>
            ({accuracyPct}% Accuracy)
          </span>
        </div>
      </div>

      {/* QUIZ MAIN CARD */}
      <div className="quiz-card" style={{ padding: '1.75rem', gap: '1.5rem', background: '#1e293b' }}>
        {/* QUESTION NAVIGATION CONTROLS */}
        <div className="navigation" style={{ marginBottom: '-8px' }}>
          <button
            className="btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
          >
            <ChevronLeft size={18} /> Previous
          </button>
          <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            #{currentQ.id} of 77
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

        {/* IMAGE DISPLAY (IF PRESENT) */}
        {currentQ.image && (
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
                src={BASE_URL + currentQ.image}
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
          </div>
        )}

        {/* QUESTION PROMPT */}
        <div style={{ marginTop: currentQ.image ? '0.5rem' : '0' }}>
          <h2 style={{
            fontSize: '1.3rem',
            lineHeight: 1.45,
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '0.25rem'
          }}>
            {currentQ.question}
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {isAnswered ? 'Question completed • Select an action below or move to the next question' : 'Select the single best answer:'}
          </span>
        </div>

        {/* MULTIPLE CHOICE OPTIONS GRID */}
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
                  fontWeight: isThisSelected || isThisCorrect ? 600 : 500,
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
                    background: isThisSelected ? (isThisCorrect ? '#10b981' : '#ef4444') : (isThisCorrect && isAnswered ? '#10b981' : 'rgba(255,255,255,0.08)'),
                    color: isThisSelected || (isThisCorrect && isAnswered) ? '#fff' : '#cbd5e1',
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
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
    </div>
  );
}

export default MediumGroupQuiz;
