import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpoints } from '../../services/api';
import toast from 'react-hot-toast';
import { Clock, AlertCircle, Save, CheckCircle2, ChevronRight, ChevronLeft, Terminal, Code2, ChevronDown } from 'lucide-react';
import Editor from '@monaco-editor/react';

// Supported languages with Monaco IDs and default starter code
const LANGUAGES = [
  { id: 'python',     label: 'Python 3',    monaco: 'python',     ext: 'py',  starter: '# Write your solution here\ndef solution():\n    pass\n' },
  { id: 'javascript', label: 'JavaScript',  monaco: 'javascript', ext: 'js',  starter: '// Write your solution here\nfunction solution() {\n\n}\n' },
  { id: 'cpp',        label: 'C++',         monaco: 'cpp',        ext: 'cpp', starter: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n' },
  { id: 'java',       label: 'Java',        monaco: 'java',       ext: 'java',starter: 'import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n' },
  { id: 'c',          label: 'C',           monaco: 'c',          ext: 'c',   starter: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n' },
];

// ─── Monaco Editor with language picker ──────────────────────────────────────
const CodeEditor = ({ questionId, value, onChange, blacklist = [], whitelist = [] }) => {
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [langOpen, setLangOpen] = useState(false);
  const [violations, setViolations] = useState([]);
  const editorRef = useRef(null);

  // Init with starter code when question changes
  useEffect(() => {
    if (!value) onChange(lang.starter);
  }, [questionId]);

  const handleLangChange = (l) => {
    setLang(l);
    setLangOpen(false);
    // Only replace if still on starter code or empty
    if (!value || LANGUAGES.some(x => value === x.starter)) {
      onChange(l.starter);
    }
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register custom autocomplete for whitelisted keywords
    if (whitelist.length > 0) {
      monaco.languages.registerCompletionItemProvider(lang.monaco, {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          return {
            suggestions: whitelist.map(kw => ({
              label: kw,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: kw,
              range,
              detail: '✅ Required keyword',
              sortText: '0' + kw,
            })),
          };
        },
      });
    }
  };

  const handleCodeChange = (code = '') => {
    onChange(code);
    // Check blacklisted keywords
    const found = blacklist.filter(kw => code.includes(kw));
    setViolations(found);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e2e] border-b border-[#313244]">
        {/* Language picker */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#cdd6f4] bg-[#313244] hover:bg-[#45475a] transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-[#89b4fa]" />
            {lang.label}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {langOpen && (
            <div className="absolute top-full mt-1 left-0 w-40 bg-[#1e1e2e] border border-[#313244] rounded-xl shadow-2xl z-50 overflow-hidden">
              {LANGUAGES.map(l => (
                <button
                  key={l.id}
                  onClick={() => handleLangChange(l)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${lang.id === l.id ? 'bg-[#89b4fa]/20 text-[#89b4fa]' : 'text-[#cdd6f4] hover:bg-[#313244]'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {whitelist.length > 0 && (
            <div className="text-xs text-[#a6e3a1] bg-[#a6e3a1]/10 px-2 py-1 rounded-lg border border-[#a6e3a1]/20">
              ✅ Use: {whitelist.slice(0, 3).join(', ')}{whitelist.length > 3 ? '…' : ''}
            </div>
          )}
          <span className="text-xs text-[#6c7086]">main.{lang.ext}</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={lang.monaco}
          value={value || lang.starter}
          theme="vs-dark"
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            suggestOnTriggerCharacters: true,
            quickSuggestions: { other: true, comments: false, strings: false },
            acceptSuggestionOnEnter: 'on',
            tabSize: lang.id === 'python' ? 4 : 4,
            wordWrap: 'off',
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true },
            formatOnPaste: true,
          }}
        />
      </div>

      {/* Violation banner */}
      {violations.length > 0 && (
        <div className="px-4 py-2 bg-red-900/80 border-t border-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
          <p className="text-xs text-red-200">
            <strong>Blacklisted keywords detected:</strong> {violations.join(', ')} — Remove them before submitting.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main TakeTest component ──────────────────────────────────────────────────
const TakeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [codingAnswers, setCodingAnswers] = useState({});

  useEffect(() => {
    endpoints.student.getTestDetails(id)
      .then(res => {
        if (res.data.success) {
          setTest(res.data.data.test);
          const att = res.data.data.attempt;
          setAttempt(att);
          if (att?.status === 'in-progress') {
            const mcq = {};
            att.mcqAnswers?.forEach(a => { mcq[a.questionId] = a.selectedOptionIndex; });
            setMcqAnswers(mcq);
            const coding = {};
            att.codingAnswers?.forEach(a => { coding[a.questionId] = a.code; });
            setCodingAnswers(coding);
          }
        }
      })
      .catch(err => {
        toast.error(err.response?.data?.error || 'Failed to load test');
        navigate('/student-dashboard/tests');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Timer
  useEffect(() => {
    if (!test || !attempt || attempt.status !== 'in-progress') return;
    const end = new Date(attempt.startTime).getTime() + test.settings.durationMinutes * 60000;
    const tick = setInterval(() => {
      const rem = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft(rem);
      if (rem === 0) { clearInterval(tick); toast('⏳ Time up! Submitting…'); submitFinalTest(); }
    }, 1000);
    return () => clearInterval(tick);
  }, [test, attempt]);

  const handleStartTest = async () => {
    try {
      const res = await endpoints.student.startTest(id);
      if (res.data.success) { setAttempt(res.data.data); toast.success('Test started. Good luck! 🚀'); }
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to start test'); }
  };

  const submitFinalTest = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await endpoints.student.submitTest(id, {
        mcqAnswers: Object.keys(mcqAnswers).map(qId => ({ questionId: qId, selectedOptionIndex: mcqAnswers[qId] })),
        codingAnswers: Object.keys(codingAnswers).map(qId => ({ questionId: qId, code: codingAnswers[qId] })),
      });
      if (res.data.success) { setAttempt(res.data.data); toast.success('Submitted! ✅'); }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Submit failed');
      setSubmitting(false);
    }
  };

  const handleManualSubmit = () => {
    if (window.confirm('Submit test? You cannot change answers after this.')) submitFinalTest();
  };

  const fmt = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading test…</div>;
  if (!test) return <div className="p-12 text-center text-red-500">Test not found.</div>;

  // ── Submitted view ──
  if (attempt?.status === 'submitted') {
    return (
      <div className="max-w-2xl mx-auto py-16 animate-fade-in-up">
        <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Test Submitted!</h2>
          <p className="text-muted-foreground mb-8">You have completed "<strong>{test.title}</strong>".</p>

          {test.type === 'mcq' && (
            <div className="inline-block px-8 py-5 rounded-2xl mb-8"
              style={{ background: 'linear-gradient(135deg, hsl(243 75% 59% / 0.1), hsl(280 70% 55% / 0.07))' }}>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Final Score</p>
              <p className="text-5xl font-black text-primary">{attempt.score}
                <span className="text-xl font-normal text-muted-foreground"> / {test.settings.totalMarks}</span>
              </p>
            </div>
          )}
          {test.type === 'coding' && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm mb-8 max-w-sm mx-auto">
              Your code is pending manual review by your instructor.
            </div>
          )}

          <button onClick={() => navigate('/student-dashboard/tests')}
            className="btn-primary">
            ← Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  // ── Pre-test info view ──
  if (!attempt) {
    return (
      <div className="max-w-2xl mx-auto py-16 animate-fade-in-up">
        <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="h-2" style={{ background: test.type === 'mcq' ? 'linear-gradient(90deg,#6366f1,#8b5cf6)' : 'linear-gradient(90deg,#f59e0b,#ef4444)' }} />
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: test.type === 'mcq' ? '#6366f115' : '#f59e0b15' }}>
                {test.type === 'mcq' ? <CheckCircle2 className="w-6 h-6 text-indigo-500" /> : <Terminal className="w-6 h-6 text-amber-500" />}
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground">{test.title}</h1>
                <p className="text-muted-foreground text-sm">{test.type === 'mcq' ? 'MCQ Exam' : 'Coding Challenge'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { label: `${test.settings.durationMinutes} min`, icon: Clock },
                { label: `${test.settings.totalMarks} marks`, icon: Save },
                { label: `${test.type === 'mcq' ? test.mcqQuestions?.length : test.codingQuestions?.length} questions`, icon: AlertCircle },
              ].map(({ label, icon: Icon }) => (
                <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-sm font-medium text-muted-foreground">
                  <Icon className="w-3.5 h-3.5" />{label}
                </span>
              ))}
            </div>

            {test.type === 'coding' && (
              <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
                <p className="font-bold mb-1">💡 Coding Challenge Info</p>
                <p>You can write code in Python, JavaScript, C++, Java, or C. Choose your preferred language in the editor. Your code will be reviewed by your instructor.</p>
              </div>
            )}

            <div className="mb-8 prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Instructions</h3>
              <p>{test.description || 'No special instructions provided.'}</p>
              <ul className="text-sm space-y-1 mt-2 text-muted-foreground">
                <li>Do not refresh the page during the exam.</li>
                <li>The exam auto-submits when the timer reaches 0.</li>
                <li>Ensure a stable internet connection.</li>
                {test.type === 'coding' && <li>Select your preferred programming language before writing code.</li>}
              </ul>
            </div>

            <button onClick={handleStartTest} className="btn-primary w-full justify-center py-4 text-base rounded-2xl">
              Begin Assessment →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active test view ──
  const questions = test.type === 'mcq' ? test.mcqQuestions : test.codingQuestions;
  const currentQ = questions[currentQuestion];
  const isLast = currentQuestion === questions.length - 1;

  return (
    <div style={{ height: 'calc(100vh - 8rem)' }} className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between bg-white dark:bg-card border border-border rounded-2xl px-5 py-3 shadow-sm">
        <div>
          <h2 className="font-bold text-foreground">{test.title}</h2>
          <p className="text-xs text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</p>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg transition-colors ${
          timeLeft < 300 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-muted text-foreground'
        }`}>
          <Clock className="w-4 h-4" />{fmt(timeLeft)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white dark:bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
        {test.type === 'mcq' ? (
          <div className="flex-1 overflow-y-auto p-8">
            <p className="text-lg font-semibold text-foreground mb-6">{currentQ.questionText}</p>
            <div className="space-y-3 max-w-2xl">
              {currentQ.options.map((opt, idx) => (
                <label key={idx}
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all select-none ${
                    mcqAnswers[currentQ._id] === idx
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    mcqAnswers[currentQ._id] === idx ? 'border-primary' : 'border-border'
                  }`}>
                    {mcqAnswers[currentQ._id] === idx && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <input type="radio" className="sr-only" checked={mcqAnswers[currentQ._id] === idx}
                    onChange={() => setMcqAnswers({ ...mcqAnswers, [currentQ._id]: idx })} />
                  <span className="text-foreground">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Problem panel */}
            <div className="w-80 flex-shrink-0 border-r border-border overflow-y-auto p-5 bg-muted/30">
              <h3 className="font-bold text-foreground mb-1">{currentQ.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                ⏱ {currentQ.timeLimitSeconds}s · 💾 {currentQ.memoryLimitMB}MB
              </p>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-sm">{currentQ.problemStatement}</p>
                {currentQ.constraints && (
                  <>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-1">Constraints</h4>
                    <pre className="text-xs bg-white dark:bg-background p-3 rounded-xl border border-border overflow-x-auto">{currentQ.constraints}</pre>
                  </>
                )}
                {currentQ.blacklistedKeywords?.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">🚫 Blacklisted</p>
                    <p className="text-xs text-red-600 dark:text-red-400">{currentQ.blacklistedKeywords.join(', ')}</p>
                  </div>
                )}
                {currentQ.whitelistedKeywords?.length > 0 && (
                  <div className="mt-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-1">✅ Must Use</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{currentQ.whitelistedKeywords.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Monaco editor panel */}
            <div className="flex-1 overflow-hidden flex flex-col bg-[#1e1e2e]">
              <CodeEditor
                questionId={currentQ._id}
                value={codingAnswers[currentQ._id]}
                onChange={(code) => setCodingAnswers({ ...codingAnswers, [currentQ._id]: code })}
                blacklist={currentQ.blacklistedKeywords || []}
                whitelist={currentQ.whitelistedKeywords || []}
              />
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="flex-shrink-0 flex items-center justify-between border-t border-border px-5 py-3 bg-muted/20">
          <button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(q => q - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex gap-2">
            {questions.map((q, idx) => {
              const answered = test.type === 'mcq' ? mcqAnswers[q._id] !== undefined : !!codingAnswers[q._id];
              return (
                <button key={idx} onClick={() => setCurrentQuestion(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentQuestion === idx
                      ? 'bg-primary text-white shadow-md scale-110'
                      : answered
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-800'
                        : 'bg-white dark:bg-card border border-border hover:border-primary/50 text-muted-foreground'
                  }`}>
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {isLast ? (
            <button onClick={handleManualSubmit} disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-60">
              <Save className="w-4 h-4" />{submitting ? 'Submitting…' : 'Submit Test'}
            </button>
          ) : (
            <button onClick={() => setCurrentQuestion(q => q + 1)}
              className="btn-primary text-sm px-5 py-2">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
