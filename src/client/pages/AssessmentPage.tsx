import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Question {
  id: number;
  text: string;
  options: { value: number; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "When you think about your own death, what's the most honest description of your reaction?",
    options: [
      { value: 1, label: "I avoid thinking about it entirely - it's too uncomfortable" },
      { value: 2, label: "I think about it occasionally but feel anxious when I do" },
      { value: 3, label: "I can sit with the thought, though it still unsettles me" },
      { value: 4, label: "I think about it regularly and have made some peace with it" },
      { value: 5, label: "I hold it with curiosity and some degree of equanimity" },
    ]
  },
  {
    id: 2,
    text: "Have you completed an advance directive (living will) that reflects your actual wishes?",
    options: [
      { value: 1, label: "No, and I haven't thought about it" },
      { value: 2, label: "No, but I know I should" },
      { value: 3, label: "I've thought about it but haven't done it yet" },
      { value: 4, label: "I have one but it's outdated or incomplete" },
      { value: 5, label: "Yes - it's current, specific, and my people know where it is" },
    ]
  },
  {
    id: 3,
    text: "Have you had honest conversations with the people closest to you about your end-of-life wishes?",
    options: [
      { value: 1, label: "No - we don't talk about that kind of thing" },
      { value: 2, label: "Not really - I've hinted but never said it plainly" },
      { value: 3, label: "A little - we've touched on it but not gone deep" },
      { value: 4, label: "Yes, with some people, though not everyone who needs to know" },
      { value: 5, label: "Yes - the key people in my life know my wishes clearly" },
    ]
  },
  {
    id: 4,
    text: "Do you have a spiritual or philosophical framework for understanding what death is?",
    options: [
      { value: 1, label: "No - it's just the end, and I try not to think about it" },
      { value: 2, label: "I have vague beliefs but nothing I've really examined" },
      { value: 3, label: "I've explored some traditions but haven't settled into anything" },
      { value: 4, label: "I have a working framework that gives me some comfort" },
      { value: 5, label: "Yes - I have a clear view I've arrived at through genuine inquiry" },
    ]
  },
  {
    id: 5,
    text: "If you received a terminal diagnosis today, how prepared would your practical affairs be?",
    options: [
      { value: 1, label: "Completely unprepared - no will, no instructions, nothing" },
      { value: 2, label: "Mostly unprepared - there are some things in place but not much" },
      { value: 3, label: "Partially prepared - some things are in order but gaps remain" },
      { value: 4, label: "Mostly prepared - the main things are handled" },
      { value: 5, label: "Well prepared - will, healthcare proxy, financial instructions, all current" },
    ]
  },
  {
    id: 6,
    text: "How much have you engaged with the actual process of dying - what it looks like, what hospice involves, what the body does?",
    options: [
      { value: 1, label: "Almost nothing - I deliberately avoid this information" },
      { value: 2, label: "Very little - I know it exists but haven't looked into it" },
      { value: 3, label: "Some - I've read a little or had some exposure" },
      { value: 4, label: "Quite a bit - I've read books, talked to people, done some research" },
      { value: 5, label: "Substantially - I understand the process and have engaged with it directly" },
    ]
  },
  {
    id: 7,
    text: "Is there anything you would deeply regret leaving unsaid or undone if you died in the next year?",
    options: [
      { value: 1, label: "Yes - many things, and I haven't started addressing them" },
      { value: 2, label: "Yes - several significant things I keep putting off" },
      { value: 3, label: "A few things - I'm aware of them but haven't acted" },
      { value: 4, label: "One or two things - I'm working on them" },
      { value: 5, label: "Not really - I try to live without accumulating that kind of debt" },
    ]
  },
  {
    id: 8,
    text: "Have you thought about what kind of death you want - where, with whom, with what kind of support?",
    options: [
      { value: 1, label: "No - I've never thought about it" },
      { value: 2, label: "Vaguely - I have preferences but haven't articulated them" },
      { value: 3, label: "Some - I know what I don't want but not clearly what I do" },
      { value: 4, label: "Yes - I have a clear picture and have shared it with some people" },
      { value: 5, label: "Yes - I've thought about it carefully and the people who matter know" },
    ]
  },
  {
    id: 9,
    text: "How do you relate to the grief of the people who will survive you?",
    options: [
      { value: 1, label: "I don't think about it - it's too painful" },
      { value: 2, label: "I think about it but feel helpless about it" },
      { value: 3, label: "I've thought about what I'd want for them but haven't done much" },
      { value: 4, label: "I've taken some steps - letters, instructions, conversations" },
      { value: 5, label: "I've actively prepared for their grief - legacy letters, clear wishes, conversations" },
    ]
  },
  {
    id: 10,
    text: "Do you have a practice - meditation, prayer, journaling, ritual - that helps you stay connected to the reality of impermanence?",
    options: [
      { value: 1, label: "No - I actively avoid reminders of impermanence" },
      { value: 2, label: "No regular practice, though I think about it sometimes" },
      { value: 3, label: "Occasionally - I have something but it's not consistent" },
      { value: 4, label: "Yes - I have a practice that touches on this regularly" },
      { value: 5, label: "Yes - impermanence is woven into how I live and practice" },
    ]
  },
];

interface Result {
  range: [number, number];
  title: string;
  description: string;
  recommendations: string[];
  color: string;
}

const RESULTS: Result[] = [
  {
    range: [10, 19],
    title: "The Avoider",
    color: "#B8805A",
    description: "You're in the majority. Most people in this culture are exactly where you are - death is kept at arm's length, the paperwork is undone, the conversations haven't happened. This isn't a character flaw. It's what happens when a culture treats death as a failure rather than a fact. The good news: awareness is the first step, and you've just taken it.",
    recommendations: [
      "Start with one conversation - not about dying, but about what matters to you",
      "Read Stephen Levine's 'A Year to Live' - it's the gentlest entry point",
      "Take 10 minutes to write down your basic end-of-life wishes, even informally",
      "Explore the Death Positive movement - Caitlin Doughty's work is a good start",
    ]
  },
  {
    range: [20, 29],
    title: "The Acknowledger",
    color: "#C4A060",
    description: "You know death is real and you've started to look at it. You haven't fully turned toward it yet, but you're not running either. There's something in you that's ready for more - more honesty, more preparation, more depth. That readiness is worth trusting.",
    recommendations: [
      "Complete an advance directive - it takes an hour and changes everything",
      "Have one explicit conversation with your closest person about your wishes",
      "Try a death meditation practice - even 5 minutes of sitting with your mortality",
      "Read Frank Ostaseski's 'The Five Invitations'",
    ]
  },
  {
    range: [30, 39],
    title: "The Preparer",
    color: "#D4A857",
    description: "You've done real work here. The practical pieces are mostly in place, you've had some of the conversations, and you have a framework for understanding what death is. The next layer is depth - not more preparation, but more presence. The difference between preparing for death and being ready for it.",
    recommendations: [
      "Deepen your spiritual or philosophical inquiry into what death actually is",
      "Write legacy letters to the people who matter most",
      "Consider working with a death doula or attending a Death Cafe",
      "Explore Sogyal Rinpoche's 'The Tibetan Book of Living and Dying'",
    ]
  },
  {
    range: [40, 45],
    title: "The Conscious One",
    color: "#E8BE6A",
    description: "You've done the work. Not perfectly - no one does - but you've turned toward death with honesty and some degree of grace. Your affairs are in order, the conversations have happened, and you have a practice that keeps you connected to the reality of impermanence. This is rare. Keep going. The depth available here is inexhaustible.",
    recommendations: [
      "Consider how you might support others in this work",
      "Deepen your meditation practice around death and dissolution",
      "Read Kathleen Dowling Singh's 'The Grace in Dying'",
      "Explore the Vedantic teaching on Atman - what is it that doesn't die?",
    ]
  },
];

function getResult(score: number): Result {
  return RESULTS.find(r => score >= r.range[0] && score <= r.range[1]) || RESULTS[0];
}

export function AssessmentPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(q => q + 1), 300);
    }
  };

  const handleSubmit = () => {
    if (allAnswered) setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentQ(0);
  };

  if (submitted) {
    const result = getResult(totalScore);
    return (
      <div className="assessment-page">
        <div className="assessment-header">
          <div className="container">
            <h1>Death Readiness Assessment</h1>
            <p>Your results</p>
          </div>
        </div>

        <div className="container">
          <div className="result-card" style={{ borderColor: result.color }}>
            <div className="result-score">
              <span className="score-number">{totalScore}</span>
              <span className="score-max">/ 50</span>
            </div>
            <h2 className="result-title" style={{ color: result.color }}>{result.title}</h2>
            <p className="result-description">{result.description}</p>

            <div className="result-recommendations">
              <h3>What to explore next</h3>
              <ul>
                {result.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="result-actions">
              <Link to="/articles" className="btn btn-primary">Explore the Articles</Link>
              <button className="btn btn-secondary" onClick={handleReset}>Take Again</button>
            </div>

            <div className="result-quote">
              <p>"The question isn't whether you'll die. The question is whether you'll be present for it."</p>
              <cite>- Kalesh</cite>
            </div>
          </div>
        </div>

        <style>{`
          .result-card {
            max-width: 700px;
            margin: var(--space-2xl) auto;
            background: var(--bg-card);
            border: 2px solid;
            border-radius: var(--radius-xl);
            padding: var(--space-2xl);
          }

          .result-score {
            text-align: center;
            margin-bottom: var(--space-lg);
          }

          .score-number {
            font-family: var(--font-display);
            font-size: 4rem;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1;
          }

          .score-max {
            font-family: var(--font-sans);
            font-size: 1.5rem;
            color: var(--text-muted);
          }

          .result-title {
            text-align: center;
            font-size: clamp(1.5rem, 3vw, 2.2rem);
            margin-bottom: var(--space-xl);
            margin-top: 0;
          }

          .result-description {
            font-family: var(--font-serif);
            font-size: 1.05rem;
            color: var(--text-secondary);
            line-height: 1.75;
            margin-bottom: var(--space-2xl);
          }

          .result-recommendations {
            background: var(--bg-elevated);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin-bottom: var(--space-2xl);
          }

          .result-recommendations h3 {
            font-family: var(--font-sans);
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-bottom: var(--space-md);
            margin-top: 0;
          }

          .result-recommendations ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .result-recommendations li {
            font-family: var(--font-serif);
            font-size: 0.95rem;
            color: var(--text-secondary);
            padding: var(--space-sm) 0;
            border-bottom: 1px solid var(--border-subtle);
            padding-left: var(--space-lg);
            position: relative;
          }

          .result-recommendations li::before {
            content: '&#9670;';
            position: absolute;
            left: 0;
            color: var(--accent);
            font-size: 0.6rem;
            top: 50%;
            transform: translateY(-50%);
          }

          .result-recommendations li:last-child { border-bottom: none; }

          .result-actions {
            display: flex;
            gap: var(--space-md);
            flex-wrap: wrap;
            margin-bottom: var(--space-2xl);
          }

          .result-quote {
            text-align: center;
            padding-top: var(--space-xl);
            border-top: 1px solid var(--border-subtle);
          }

          .result-quote p {
            font-family: var(--font-display);
            font-style: italic;
            color: var(--text-secondary);
            font-size: 1rem;
            margin-bottom: var(--space-sm);
          }

          .result-quote cite {
            font-family: var(--font-sans);
            font-size: 0.8rem;
            color: var(--accent);
            font-style: normal;
          }
        `}</style>
      </div>
    );
  }

  const question = QUESTIONS[currentQ];
  const progress = (answeredCount / QUESTIONS.length) * 100;

  return (
    <div className="assessment-page">
      <div className="assessment-header">
        <div className="container">
          <h1>Death Readiness Assessment</h1>
          <p className="assessment-subtitle">
            10 honest questions about your relationship with mortality. Not a test. A mirror.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="assessment-body">
          {/* Progress */}
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-text">{answeredCount} of {QUESTIONS.length}</span>
          </div>

          {/* Question navigation */}
          <div className="question-nav">
            {QUESTIONS.map((q, i) => (
              <button
                key={q.id}
                className={`q-dot${i === currentQ ? ' current' : ''}${answers[q.id] ? ' answered' : ''}`}
                onClick={() => setCurrentQ(i)}
                aria-label={`Question ${i + 1}`}
              />
            ))}
          </div>

          {/* Current question */}
          <div className="question-card">
            <div className="question-number">Question {currentQ + 1}</div>
            <h2 className="question-text">{question.text}</h2>

            <div className="options-list">
              {question.options.map(opt => (
                <button
                  key={opt.value}
                  className={`option-btn${answers[question.id] === opt.value ? ' selected' : ''}`}
                  onClick={() => handleAnswer(question.id, opt.value)}
                >
                  <span className="option-indicator" />
                  <span className="option-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="assessment-nav">
            <button
              className="btn btn-secondary"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ(q => q - 1)}
            >
              &larr; Previous
            </button>

            {currentQ < QUESTIONS.length - 1 ? (
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentQ(q => q + 1)}
              >
                Next &rarr;
              </button>
            ) : (
              <button
                className={`btn btn-primary${!allAnswered ? ' disabled' : ''}`}
                onClick={handleSubmit}
                disabled={!allAnswered}
              >
                See My Results
              </button>
            )}
          </div>

          {!allAnswered && answeredCount > 0 && (
            <p className="incomplete-note">
              Answer all {QUESTIONS.length} questions to see your results. ({QUESTIONS.length - answeredCount} remaining)
            </p>
          )}
        </div>
      </div>

      <style>{`
        .assessment-page {
          padding-bottom: var(--space-3xl);
        }

        .assessment-header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: var(--space-3xl) 0 var(--space-2xl);
          margin-bottom: var(--space-2xl);
        }

        .assessment-header h1 { margin-bottom: var(--space-sm); }

        .assessment-subtitle {
          font-family: var(--font-serif);
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin: 0;
        }

        .assessment-body {
          max-width: 700px;
          margin: 0 auto;
        }

        .progress-bar-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
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

        .question-nav {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
          margin-bottom: var(--space-2xl);
        }

        .q-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid var(--border);
          background: transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
          font-size: 0.65rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .q-dot.answered {
          background: var(--accent-dim);
          border-color: var(--accent);
          color: var(--accent);
        }

        .q-dot.current {
          border-color: var(--accent);
          background: var(--accent);
          color: #1E1B18;
          font-weight: 700;
        }

        .question-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          margin-bottom: var(--space-xl);
        }

        .question-number {
          font-family: var(--font-sans);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: var(--space-md);
        }

        .question-text {
          font-family: var(--font-display);
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: var(--space-xl);
          margin-top: 0;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .option-btn {
          display: flex;
          align-items: flex-start;
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

        .option-btn:hover {
          border-color: var(--accent);
          background: var(--accent-dim);
        }

        .option-btn.selected {
          border-color: var(--accent);
          background: var(--accent-dim);
        }

        .option-indicator {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid var(--border);
          flex-shrink: 0;
          margin-top: 2px;
          transition: all var(--transition-fast);
        }

        .option-btn.selected .option-indicator {
          border-color: var(--accent);
          background: var(--accent);
          box-shadow: inset 0 0 0 3px var(--bg-elevated);
        }

        .option-label {
          font-family: var(--font-serif);
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .option-btn.selected .option-label {
          color: var(--text-primary);
        }

        .assessment-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
        }

        .incomplete-note {
          text-align: center;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
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

        .btn-primary:hover:not(:disabled) {
          background: var(--accent-hover);
          border-color: var(--accent-hover);
        }

        .btn-primary:disabled, .btn-primary.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: transparent;
          color: var(--text-secondary);
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }

        .btn-secondary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
