import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowRight, Save, Terminal, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const CreateTest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    type: 'mcq',
    durationMinutes: 60,
    startDate: '',
    endDate: ''
  });

  const [mcqQuestions, setMcqQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, marks: 1 }
  ]);

  const [codingQuestions, setCodingQuestions] = useState([
    { 
      title: '', problemStatement: '', constraints: '', 
      memoryLimitMB: 256, timeLimitSeconds: 2, 
      blacklistedKeywords: '', whitelistedKeywords: '',
      testCases: [{ input: '', expectedOutput: '', isHidden: false, marks: 10 }]
    }
  ]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Teacher needs to get subjects they teach
        const res = await api.get('/teacher/subjects'); // Assume this exists or fetch all and filter
        if (res.data.success) {
          setSubjects(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load subjects");
      }
    };
    fetchSubjects();
  }, []);

  const handleCreateTest = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        subjectId: formData.subjectId,
        type: formData.type,
        settings: { 
          durationMinutes: formData.durationMinutes, 
          totalMarks: 0,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined
        },
      };

      if (formData.type === 'mcq') {
        payload.mcqQuestions = mcqQuestions;
      } else {
        // format coding keywords
        payload.codingQuestions = codingQuestions.map(q => ({
          ...q,
          blacklistedKeywords: q.blacklistedKeywords.split(',').map(k => k.trim()).filter(k => k),
          whitelistedKeywords: q.whitelistedKeywords.split(',').map(k => k.trim()).filter(k => k),
        }));
      }

      const res = await endpoints.teacher.createTest(payload);
      if (res.data.success) {
        toast.success('Test created successfully!');
        navigate('/teacher-dashboard/tests');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create test');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Assessment</h2>
          <p className="text-sm text-gray-500 mt-1">Step {step} of 2: {step === 1 ? 'Basic Details' : 'Question Builder'}</p>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white dark:bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Test Title</label>
              <input type="text" className="w-full border rounded-lg p-2 bg-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Midterm Examination" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea className="w-full border rounded-lg p-2 bg-input h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Instructions for the students..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <select className="w-full border rounded-lg p-2 bg-input" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} required>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (Minutes)</label>
              <input type="number" min="5" className="w-full border rounded-lg p-2 bg-input" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Available From (Optional)</label>
              <input type="datetime-local" className="w-full border rounded-lg p-2 bg-input" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Available Until (Optional)</label>
              <input type="datetime-local" className="w-full border rounded-lg p-2 bg-input" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-3">Assessment Type</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({...formData, type: 'mcq'})}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${formData.type === 'mcq' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-gray-50 dark:hover:bg-accent'}`}
                >
                  <CheckCircle2 className={`w-8 h-8 mb-2 ${formData.type === 'mcq' ? 'text-primary' : 'text-gray-400'}`} />
                  <h4 className="font-bold">Multiple Choice (MCQ)</h4>
                  <p className="text-xs text-gray-500 mt-1">Standard multiple choice questions with automated grading.</p>
                </div>
                <div 
                  onClick={() => setFormData({...formData, type: 'coding'})}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${formData.type === 'coding' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-gray-50 dark:hover:bg-accent'}`}
                >
                  <Terminal className={`w-8 h-8 mb-2 ${formData.type === 'coding' ? 'text-primary' : 'text-gray-400'}`} />
                  <h4 className="font-bold">Coding Challenge</h4>
                  <p className="text-xs text-gray-500 mt-1">Advanced programming problems with custom test cases and limits.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-border">
            <button 
              onClick={() => {
                if(!formData.title || !formData.subjectId) return toast.error('Please fill required fields');
                setStep(2);
              }}
              className="flex items-center bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              Continue to Builder <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && formData.type === 'mcq' && (
        <div className="space-y-6">
          {mcqQuestions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white dark:bg-card border border-border p-6 rounded-xl shadow-sm relative">
              <button onClick={() => setMcqQuestions(mcqQuestions.filter((_, i) => i !== qIndex))} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
              <h3 className="font-bold mb-4">Question {qIndex + 1}</h3>
              <div className="space-y-4">
                <textarea className="w-full border rounded-lg p-2 bg-input h-20" placeholder="Type your question here..." value={q.questionText} onChange={(e) => {
                  const newQ = [...mcqQuestions]; newQ[qIndex].questionText = e.target.value; setMcqQuestions(newQ);
                }} required />
                <div className="grid grid-cols-2 gap-4">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <input type="radio" name={`correct-${qIndex}`} checked={q.correctOptionIndex === oIndex} onChange={() => {
                        const newQ = [...mcqQuestions]; newQ[qIndex].correctOptionIndex = oIndex; setMcqQuestions(newQ);
                      }} />
                      <input type="text" className="w-full border rounded-lg p-2 bg-input text-sm" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => {
                        const newQ = [...mcqQuestions]; newQ[qIndex].options[oIndex] = e.target.value; setMcqQuestions(newQ);
                      }} required />
                    </div>
                  ))}
                </div>
                <div className="w-1/3">
                  <label className="text-xs font-medium text-gray-500">Marks</label>
                  <input type="number" min="1" className="w-full border rounded-lg p-2 bg-input text-sm" value={q.marks} onChange={(e) => {
                    const newQ = [...mcqQuestions]; newQ[qIndex].marks = parseInt(e.target.value); setMcqQuestions(newQ);
                  }} />
                </div>
              </div>
            </div>
          ))}
          
          <button onClick={() => setMcqQuestions([...mcqQuestions, { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, marks: 1 }])} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-border rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-accent hover:text-primary transition-colors flex items-center justify-center font-medium">
            <Plus className="w-5 h-5 mr-2" /> Add Another Question
          </button>
        </div>
      )}

      {step === 2 && formData.type === 'coding' && (
        <div className="space-y-6">
          {codingQuestions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white dark:bg-card border border-border p-6 rounded-xl shadow-sm relative">
              <h3 className="font-bold mb-4 text-primary flex items-center"><Terminal className="w-5 h-5 mr-2" /> Problem {qIndex + 1}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Problem Title</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-input" value={q.title} onChange={(e) => {
                    const newQ = [...codingQuestions]; newQ[qIndex].title = e.target.value; setCodingQuestions(newQ);
                  }} placeholder="e.g. Two Sum" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Problem Statement</label>
                  <textarea className="w-full border rounded-lg p-2 bg-input font-mono text-sm h-32" value={q.problemStatement} onChange={(e) => {
                    const newQ = [...codingQuestions]; newQ[qIndex].problemStatement = e.target.value; setCodingQuestions(newQ);
                  }} placeholder="Write the problem description, constraints, and examples..." required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-500">Memory Limit (MB)</label>
                    <input type="number" className="w-full border rounded-lg p-2 bg-input" value={q.memoryLimitMB} onChange={(e) => {
                      const newQ = [...codingQuestions]; newQ[qIndex].memoryLimitMB = parseInt(e.target.value); setCodingQuestions(newQ);
                    }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-500">Time Limit (Seconds)</label>
                    <input type="number" step="0.5" className="w-full border rounded-lg p-2 bg-input" value={q.timeLimitSeconds} onChange={(e) => {
                      const newQ = [...codingQuestions]; newQ[qIndex].timeLimitSeconds = parseFloat(e.target.value); setCodingQuestions(newQ);
                    }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-red-500">Blacklisted Keywords (Comma separated)</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-input" value={q.blacklistedKeywords} onChange={(e) => {
                      const newQ = [...codingQuestions]; newQ[qIndex].blacklistedKeywords = e.target.value; setCodingQuestions(newQ);
                    }} placeholder="eval, exec, import os" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-green-500">Whitelisted Keywords (Must include)</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-input" value={q.whitelistedKeywords} onChange={(e) => {
                      const newQ = [...codingQuestions]; newQ[qIndex].whitelistedKeywords = e.target.value; setCodingQuestions(newQ);
                    }} placeholder="for, while" />
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <h4 className="font-bold text-sm mb-3">Test Cases</h4>
                  <div className="space-y-3">
                    {q.testCases.map((tc, tcIndex) => (
                      <div key={tcIndex} className="bg-gray-50 dark:bg-accent p-4 rounded-lg grid grid-cols-12 gap-3 relative">
                         <div className="col-span-5">
                            <label className="text-xs text-gray-500">Input</label>
                            <input type="text" className="w-full border rounded p-1.5 text-sm font-mono bg-white dark:bg-input" value={tc.input} onChange={(e) => {
                              const newQ = [...codingQuestions]; newQ[qIndex].testCases[tcIndex].input = e.target.value; setCodingQuestions(newQ);
                            }} placeholder="[2,7,11,15]\n9" />
                         </div>
                         <div className="col-span-4">
                            <label className="text-xs text-gray-500">Expected Output</label>
                            <input type="text" className="w-full border rounded p-1.5 text-sm font-mono bg-white dark:bg-input" value={tc.expectedOutput} onChange={(e) => {
                              const newQ = [...codingQuestions]; newQ[qIndex].testCases[tcIndex].expectedOutput = e.target.value; setCodingQuestions(newQ);
                            }} placeholder="[0,1]" />
                         </div>
                         <div className="col-span-1">
                            <label className="text-xs text-gray-500">Marks</label>
                            <input type="number" className="w-full border rounded p-1.5 text-sm bg-white dark:bg-input" value={tc.marks} onChange={(e) => {
                              const newQ = [...codingQuestions]; newQ[qIndex].testCases[tcIndex].marks = parseInt(e.target.value); setCodingQuestions(newQ);
                            }} />
                         </div>
                         <div className="col-span-2 flex items-center mt-4">
                            <label className="flex items-center text-xs">
                              <input type="checkbox" className="mr-1.5" checked={tc.isHidden} onChange={(e) => {
                                const newQ = [...codingQuestions]; newQ[qIndex].testCases[tcIndex].isHidden = e.target.checked; setCodingQuestions(newQ);
                              }} /> Hidden
                            </label>
                         </div>
                      </div>
                    ))}
                    <button onClick={(e) => {
                      e.preventDefault();
                      const newQ = [...codingQuestions]; newQ[qIndex].testCases.push({ input: '', expectedOutput: '', isHidden: false, marks: 10 }); setCodingQuestions(newQ);
                    }} className="text-sm text-primary font-medium flex items-center hover:underline">
                      <Plus className="w-4 h-4 mr-1" /> Add Test Case
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}

          <button onClick={() => setCodingQuestions([...codingQuestions, { title: '', problemStatement: '', constraints: '', memoryLimitMB: 256, timeLimitSeconds: 2, blacklistedKeywords: '', whitelistedKeywords: '', testCases: [{ input: '', expectedOutput: '', isHidden: false, marks: 10 }] }])} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-border rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-accent hover:text-primary transition-colors flex items-center justify-center font-medium">
            <Plus className="w-5 h-5 mr-2" /> Add Another Coding Problem
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex justify-between items-center pt-6">
          <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-900 font-medium px-4 py-2">
            Back to Details
          </button>
          <button onClick={handleCreateTest} disabled={isSubmitting} className="flex items-center bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 shadow-md disabled:opacity-70">
            <Save className="w-5 h-5 mr-2" /> {isSubmitting ? 'Publishing...' : 'Publish Test'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateTest;
