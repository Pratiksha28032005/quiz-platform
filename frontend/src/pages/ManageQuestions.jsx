import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const emptyOptions = [
  { option_text: '', is_correct: true },
  { option_text: '', is_correct: false },
  { option_text: '', is_correct: false },
  { option_text: '', is_correct: false },
];

export default function ManageQuestions() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(1);
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState(emptyOptions);
  const [showForm, setShowForm] = useState(false);

  function load() {
    api.get(`/quizzes/${quizId}`).then((res) => setQuiz(res.data));
    api.get(`/quizzes/${quizId}/questions`).then((res) => setQuestions(res.data));
  }
  useEffect(load, [quizId]);

  function updateOption(idx, field, value) {
    setOptions((prev) => prev.map((o, i) => {
      if (field === 'is_correct') {
        // single-correct-answer model: selecting one clears the others
        return { ...o, is_correct: i === idx };
      }
      return i === idx ? { ...o, [field]: value } : o;
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post(`/quizzes/${quizId}/questions`, {
      question_text: questionText, marks, explanation, options,
    });
    setQuestionText(''); setMarks(1); setExplanation(''); setOptions(emptyOptions);
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/questions/${id}`);
    load();
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <Link to="/admin/quizzes" className="text-sm text-indigo-600">&larr; Back to Quizzes</Link>
      <div className="flex justify-between items-center mt-2 mb-6">
        <h1 className="text-2xl font-bold">{quiz?.title} — Questions</h1>
        <button onClick={() => setShowForm((s) => !s)} className="bg-indigo-600 text-white px-4 py-2 rounded">
          {showForm ? 'Cancel' : '+ Add Question'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8 space-y-3">
          <textarea placeholder="Question text" value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="border rounded px-3 py-2 w-full" rows={2} required />
          <div className="flex gap-3">
            <input type="number" min={1} placeholder="Marks" value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              className="border rounded px-3 py-2 w-32" />
            <input placeholder="Explanation (optional)" value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="border rounded px-3 py-2 flex-1" />
          </div>
          <p className="text-sm text-slate-500">Select the radio button next to the correct option.</p>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input type="radio" name="correct" checked={opt.is_correct}
                onChange={() => updateOption(idx, 'is_correct', true)} />
              <input placeholder={`Option ${idx + 1}`} value={opt.option_text}
                onChange={(e) => updateOption(idx, 'option_text', e.target.value)}
                className="border rounded px-3 py-2 flex-1" required />
            </div>
          ))}
          <button className="bg-green-600 text-white rounded px-4 py-2">Save Question</button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow divide-y">
        {questions.map((q, idx) => (
          <div key={q.id} className="px-5 py-4">
            <div className="flex justify-between">
              <p className="font-medium">{idx + 1}. {q.question_text} <span className="text-xs text-slate-400">({q.marks} mark{q.marks > 1 ? 's' : ''})</span></p>
              <button onClick={() => handleDelete(q.id)} className="text-red-600 text-sm">Delete</button>
            </div>
            <ul className="mt-2 text-sm text-slate-600 space-y-1">
              {q.options.map((o) => (
                <li key={o.id} className={o.is_correct ? 'text-green-700 font-medium' : ''}>
                  {o.option_text} {o.is_correct ? '✓' : ''}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {questions.length === 0 && <p className="px-5 py-4 text-slate-400 text-sm">No questions yet.</p>}
      </div>
    </div>
  );
}
