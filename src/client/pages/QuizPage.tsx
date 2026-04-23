import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "In Tibetan Buddhism, what is the 'bardo'?",
    options: [
      "A type of death meditation",
      "An intermediate state between death and rebirth",
      "A funeral ritual",
      "A sacred text about dying"
    ],
    correct: 1,
    explanation: "Bardo (literally 'intermediate state' in Tibetan) refers to the transitional state between death and the next rebirth. The Tibetan Book of the Dead (Bardo Thodol) is a guide for navigating this state. There are actually multiple bardos - the bardo of dying, the bardo of dharmata, and the bardo of becoming.",
    category: "Tibetan Buddhism"
  },
  {
    id: 2,
    question: "What is an advance directive?",
    options: [
      "A letter to your family about your wishes",
      "A legal document specifying your medical wishes if you can't speak for yourself",
      "A will that covers your financial assets",
      "A document naming your funeral home"
    ],
    correct: 1,
    explanation: "An advance directive (also called a living will) is a legal document that specifies your wishes for medical treatment if you become unable to communicate them. It can include preferences about life support, resuscitation, pain management, and other end-of-life care. It's different from a will, which covers assets after death.",
    category: "Practical Planning"
  },
  {
    id: 3,
    question: "Who wrote 'The Five Invitations: Discovering What Death Can Teach Us About Living Fully'?",
    options: [
      "Stephen Levine",
      "Elisabeth Kübler-Ross",
      "Frank Ostaseski",
      "Sogyal Rinpoche"
    ],
    correct: 2,
    explanation: "Frank Ostaseski wrote 'The Five Invitations' based on his decades of work co-founding the Zen Hospice Project in San Francisco. The five invitations are: Don't wait; Welcome everything, push away nothing; Bring your whole self to the experience; Find a place of rest in the middle of things; Cultivate don't-know mind.",
    category: "Books & Teachers"
  },
  {
    id: 4,
    question: "What is 'anticipatory grief'?",
    options: [
      "Grief that comes after a sudden death",
      "Grief experienced before a death actually occurs",
      "Grief that is suppressed and comes out later",
      "Grief that is shared by a community"
    ],
    correct: 1,
    explanation: "Anticipatory grief is the grief experienced before a death occurs - by both the dying person and those who love them. It's a real, valid form of grief that deserves as much attention as grief after death. It can include mourning the loss of the person's future, the relationship as it was, and one's own sense of safety.",
    category: "Grief & Loss"
  },
  {
    id: 5,
    question: "In Vedantic philosophy, what is the 'Atman'?",
    options: [
      "The physical body that dies",
      "The ego or personality",
      "The eternal, unchanging self or consciousness",
      "The soul that reincarnates"
    ],
    correct: 2,
    explanation: "In Vedanta, Atman refers to the eternal, unchanging self - pure consciousness that is not born and does not die. The teaching is that Atman is identical to Brahman (universal consciousness). What dies at death is the body, the mind, and the ego - but not the Atman. This is different from the concept of a soul that reincarnates.",
    category: "Spiritual Philosophy"
  },
  {
    id: 6,
    question: "What is the difference between hospice and palliative care?",
    options: [
      "They are the same thing",
      "Hospice is for any illness; palliative care is only for terminal patients",
      "Palliative care focuses on comfort at any stage; hospice is specifically for end-of-life",
      "Hospice is hospital-based; palliative care is home-based"
    ],
    correct: 2,
    explanation: "Palliative care focuses on improving quality of life and managing symptoms for people with serious illness at any stage - it can be combined with curative treatment. Hospice is a specific type of palliative care for people who are expected to have six months or less to live, and it shifts the focus entirely to comfort rather than cure.",
    category: "Practical Planning"
  },
  {
    id: 7,
    question: "Who popularized the 'five stages of grief' model?",
    options: [
      "Frank Ostaseski",
      "Stephen Levine",
      "Ira Byock",
      "Elisabeth Kübler-Ross"
    ],
    correct: 3,
    explanation: "Elisabeth Kübler-Ross introduced the five stages (denial, anger, bargaining, depression, acceptance) in her 1969 book 'On Death and Dying.' Important note: she developed these stages based on interviews with dying patients, not bereaved survivors. The model has been widely misapplied and she herself clarified that the stages don't happen in order and not everyone experiences all of them.",
    category: "Books & Teachers"
  },
  {
    id: 8,
    question: "What is a 'death doula'?",
    options: [
      "A medical professional who administers end-of-life medication",
      "A non-medical guide who supports the dying person and family through the dying process",
      "A grief counselor who works with bereaved families",
      "A legal professional who handles estate planning"
    ],
    correct: 1,
    explanation: "A death doula (also called end-of-life doula or death midwife) is a non-medical professional who provides emotional, spiritual, and practical support to dying people and their families. Like a birth doula, they don't replace medical care - they complement it. They might help with legacy projects, facilitate difficult conversations, create meaningful rituals, or simply provide presence.",
    category: "Practical Planning"
  },
  {
    id: 9,
    question: "What is 'phowa' in Tibetan Buddhist practice?",
    options: [
      "A death meditation done while alive",
      "A ritual performed after death",
      "A practice of consciousness transference at the moment of death",
      "A type of funeral ceremony"
    ],
    correct: 2,
    explanation: "Phowa is a Tibetan Buddhist practice of consciousness transference - training the mind to eject consciousness through the crown of the head at the moment of death, directing it toward a pure realm or toward liberation. It's considered one of the most important practices to prepare for death, and practitioners train in it extensively while alive.",
    category: "Tibetan Buddhism"
  },
  {
    id: 10,
    question: "What is a 'green burial'?",
    options: [
      "Burial in a park or garden",
      "Burial without embalming, in a biodegradable container, allowing natural decomposition",
      "Burial with plants placed on the grave",
      "A burial ceremony that includes environmental pledges"
    ],
    correct: 1,
    explanation: "Green burial (also called natural burial) involves interring the body without embalming chemicals, in a biodegradable shroud or container, at a depth that allows natural decomposition and return to the earth. It's the oldest form of burial - what's new is the industrial funeral industry that replaced it. Green burial grounds are growing in number and often double as nature preserves.",
    category: "Practical Planning"
  },
];

export function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: number; selected: number; correct: boolean }[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = QUIZ_QUESTIONS[currentQ];
  const score = answers.filter(a => a.correct).length;

  const handleSelect = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    setShowExplanation(true);
    setAnswers(prev => [...prev, {
      questionId: question.id,
      selected: optionIndex,
      correct: optionIndex === question.correct
    }]);
  };

  const handleNext = () => {
    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowExplanation(false);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    let verdict = '';
    let verdictColor = '';
    if (pct >= 80) { verdict = "You know your way around this territory."; verdictColor = '#E8BE6A'; }
    else if (pct >= 60) { verdict = "A solid foundation. There's more to explore."; verdictColor = '#D4A857'; }
    else if (pct >= 40) { verdict = "You're at the beginning of this inquiry. Good place to be."; verdictColor = '#C4A060'; }
    else { verdict = "This is new territory for you. That's exactly why you're here."; verdictColor = '#B8805A'; }

    return (
      <div className="quiz-page">
        <div className="quiz-header">
          <div className="container">
            <h1>Conscious Dying Knowledge Quiz</h1>
          </div>
        </div>
        <div className="container">
          <div className="quiz-result">
            <div className="quiz-score-display">
              <span className="quiz-score-num" style={{ color: verdictColor }}>{score}</span>
              <span className="quiz-score-denom">/ {QUIZ_QUESTIONS.length}</span>
            </div>
            <p className="quiz-verdict" style={{ color: verdictColor }}>{verdict}</p>

            <div className="quiz-breakdown">
              {QUIZ_QUESTIONS.map((q, i) => {
                const ans = answers.find(a => a.questionId === q.id);
                return (
                  <div key={q.id} className={`breakdown-item${ans?.correct ? ' correct' : ' wrong'}`}>
                    <span className="breakdown-icon">{ans?.correct ? '✓' : '✗'}</span>
                    <span className="breakdown-q">{q.question}</span>
                    <span className="breakdown-cat">{q.category}</span>
                  </div>
                );
              })}
            </div>

            <div className="quiz-result-actions">
              <Link to="/articles" className="btn btn-primary">Explore the Articles</Link>
              <Link to="/assessment" className="btn btn-secondary">Take the Assessment</Link>
              <button className="btn btn-ghost" onClick={handleReset}>Retake Quiz</button>
            </div>
          </div>
        </div>

        <style>{`
          .quiz-result {
            max-width: 700px;
            margin: var(--space-2xl) auto;
          }

          .quiz-score-display {
            text-align: center;
            margin-bottom: var(--space-md);
          }

          .quiz-score-num {
            font-family: var(--font-display);
            font-size: 5rem;
            font-weight: 700;
            line-height: 1;
          }

          .quiz-score-denom {
            font-family: var(--font-sans);
            font-size: 2rem;
            color: var(--text-muted);
          }

          .quiz-verdict {
            text-align: center;
            font-family: var(--font-serif);
            font-size: 1.2rem;
            font-style: italic;
            margin-bottom: var(--space-2xl);
          }

          .quiz-breakdown {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-lg);
            overflow: hidden;
            margin-bottom: var(--space-2xl);
          }

          .breakdown-item {
            display: grid;
            grid-template-columns: 24px 1fr auto;
            gap: var(--space-md);
            align-items: center;
            padding: var(--space-md) var(--space-lg);
            border-bottom: 1px solid var(--border-subtle);
          }

          .breakdown-item:last-child { border-bottom: none; }

          .breakdown-icon {
            font-size: 0.9rem;
            font-weight: 700;
          }

          .breakdown-item.correct .breakdown-icon { color: #6FCF97; }
          .breakdown-item.wrong .breakdown-icon { color: #EB5757; }

          .breakdown-q {
            font-family: var(--font-sans);
            font-size: 0.85rem;
            color: var(--text-secondary);
          }

          .breakdown-cat {
            font-family: var(--font-sans);
            font-size: 0.7rem;
            color: var(--text-muted);
            white-space: nowrap;
          }

          .quiz-result-actions {
            display: flex;
            gap: var(--space-md);
            flex-wrap: wrap;
          }

          .btn-ghost {
            background: transparent;
            border: none;
            color: var(--accent);
            font-family: var(--font-sans);
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            text-decoration: underline;
            padding: 0.75em 0;
            min-height: var(--tap-target-min);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <div className="container">
          <h1>Conscious Dying Knowledge Quiz</h1>
          <p className="quiz-subtitle">
            10 questions on death preparation, spiritual traditions, and the practical realities of dying well.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="quiz-body">
          {/* Progress */}
          <div className="quiz-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentQ) / QUIZ_QUESTIONS.length) * 100}%` }} />
            </div>
            <span className="progress-text">Question {currentQ + 1} of {QUIZ_QUESTIONS.length}</span>
          </div>

          <div className="quiz-card">
            <div className="quiz-category">{question.category}</div>
            <h2 className="quiz-question">{question.question}</h2>

            <div className="quiz-options">
              {question.options.map((opt, i) => {
                let className = 'quiz-option';
                if (selected !== null) {
                  if (i === question.correct) className += ' correct';
                  else if (i === selected && selected !== question.correct) className += ' wrong';
                  else className += ' dimmed';
                }
                return (
                  <button
                    key={i}
                    className={className}
                    onClick={() => handleSelect(i)}
                    disabled={selected !== null}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="option-text">{opt}</span>
                    {selected !== null && i === question.correct && <span className="option-check">✓</span>}
                    {selected !== null && i === selected && selected !== question.correct && <span className="option-x">✗</span>}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="explanation">
                <div className="explanation-header">
                  {selected === question.correct ? (
                    <span className="explanation-correct">Correct.</span>
                  ) : (
                    <span className="explanation-wrong">Not quite.</span>
                  )}
                </div>
                <p className="explanation-text">{question.explanation}</p>
              </div>
            )}

            {selected !== null && (
              <button className="btn btn-primary next-btn" onClick={handleNext}>
                {currentQ < QUIZ_QUESTIONS.length - 1 ? 'Next Question →' : 'See Results'}
              </button>
            )}
          </div>

          {/* Score so far */}
          {answers.length > 0 && (
            <div className="running-score">
              Score so far: <strong>{score}</strong> / {answers.length}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .quiz-page {
          padding-bottom: var(--space-3xl);
        }

        .quiz-header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: var(--space-3xl) 0 var(--space-2xl);
          margin-bottom: var(--space-2xl);
        }

        .quiz-header h1 { margin-bottom: var(--space-sm); }

        .quiz-subtitle {
          font-family: var(--font-serif);
          color: var(--text-secondary);
          font-size: 1.05rem;
          margin: 0;
        }

        .quiz-body {
          max-width: 700px;
          margin: 0 auto;
        }

        .quiz-progress {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-2xl);
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: var(--bg-elevated);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          transition: width var(--transition-base);
        }

        .progress-text {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .quiz-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          margin-bottom: var(--space-lg);
        }

        .quiz-category {
          font-family: var(--font-sans);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: var(--space-md);
        }

        .quiz-question {
          font-family: var(--font-display);
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: var(--space-xl);
          margin-top: 0;
        }

        .quiz-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          margin-bottom: var(--space-xl);
        }

        .quiz-option {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
          min-height: var(--tap-target-min);
        }

        .quiz-option:hover:not(:disabled) {
          border-color: var(--accent);
          background: var(--accent-dim);
        }

        .quiz-option.correct {
          border-color: #6FCF97;
          background: rgba(111, 207, 151, 0.1);
        }

        .quiz-option.wrong {
          border-color: #EB5757;
          background: rgba(235, 87, 87, 0.1);
        }

        .quiz-option.dimmed {
          opacity: 0.4;
        }

        .quiz-option:disabled {
          cursor: default;
        }

        .option-letter {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .option-text {
          font-family: var(--font-serif);
          font-size: 0.95rem;
          color: var(--text-secondary);
          flex: 1;
          line-height: 1.4;
        }

        .option-check { color: #6FCF97; font-weight: 700; margin-left: auto; }
        .option-x { color: #EB5757; font-weight: 700; margin-left: auto; }

        .explanation {
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          margin-bottom: var(--space-xl);
          border-left: 3px solid var(--accent);
        }

        .explanation-header {
          margin-bottom: var(--space-sm);
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 0.9rem;
        }

        .explanation-correct { color: #6FCF97; }
        .explanation-wrong { color: #EB5757; }

        .explanation-text {
          font-family: var(--font-serif);
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.65;
          margin: 0;
        }

        .next-btn {
          width: 100%;
          justify-content: center;
        }

        .running-score {
          text-align: center;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .running-score strong {
          color: var(--accent);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          padding: 0.75em 1.75em;
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all var(--transition-base);
          min-height: var(--tap-target-min);
          border: 1px solid var(--border);
        }

        .btn-primary {
          background: var(--accent);
          color: #1E1B18;
          border-color: var(--accent);
        }

        .btn-primary:hover {
          background: var(--accent-hover);
          border-color: var(--accent-hover);
          color: #1E1B18;
        }

        .btn-secondary {
          background: transparent;
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
