import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const emptyForm = {
  title: '', description: '', category_id: '', difficulty: 'BEGINNER',
  duration_minutes: 20, passing_score: 60, max_attempts: 1,
};

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    api.get('/quizzes').then((res) => setQuizzes(res.data));
    api.get('/categories').then((res) => setCategories(res.data));
  }
  useEffect(load, []);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/quizzes/${editingId}`, form);
    } else {
      await api.post('/quizzes', form);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    load();
  }

  function startEdit(q) {
    setForm({
      title: q.title, description: q.description || '', category_id: q.category_id || '',
      difficulty: q.difficulty, duration_minutes: q.duration_minutes,
      passing_score: q.passing_score, max_attempts: q.max_attempts,
    });
    setEditingId(q.id);
    setShowForm(true);
  }

  async function togglePublish(q) {
    const status = q.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
    await api.patch(`/quizzes/${q.id}/publish`, { status });
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this quiz and all its questions?')) return;
    await api.delete(`/quizzes/${id}`);
    load();
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Quizzes</h1>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm((s) => !s); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded">
          {showForm ? 'Cancel' : '+ New Quiz'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8 grid grid-cols-2 gap-4">
          <input placeholder="Title" value={form.title} onChange={(e) => updateField('title', e.target.value)}
            className="border rounded px-3 py-2 col-span-2" required />
          <textarea placeholder="Description" value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="border rounded px-3 py-2 col-span-2" rows={2} />
          <select value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)}
            className="border rounded px-3 py-2">
            <option value="">No Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={form.difficulty} onChange={(e) => updateField('difficulty', e.target.value)}
            className="border rounded px-3 py-2">
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <input type="number" placeholder="Duration (minutes)" value={form.duration_minutes}
            onChange={(e) => updateField('duration_minutes', Number(e.target.value))}
            className="border rounded px-3 py-2" required />
          <input type="number" placeholder="Passing Score (%)" value={form.passing_score}
            onChange={(e) => updateField('passing_score', Number(e.target.value))}
            className="border rounded px-3 py-2" required />
          <input type="number" placeholder="Max Attempts" value={form.max_attempts}
            onChange={(e) => updateField('max_attempts', Number(e.target.value))}
            className="border rounded px-3 py-2" required />
          <button className="bg-green-600 text-white rounded px-4 py-2 col-span-2">
            {editingId ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow divide-y">
        {quizzes.map((q) => (
          <div key={q.id} className="flex justify-between items-center px-5 py-4">
            <div>
              <p className="font-medium">{q.title}</p>
              <p className="text-xs text-slate-400">
                {q.category_name || 'Uncategorized'} · {q.difficulty} · {q.question_count} questions ·
                <span className={`ml-1 font-semibold ${q.status === 'PUBLISHED' ? 'text-green-600' : 'text-slate-500'}`}>
                  {q.status}
                </span>
              </p>
            </div>
            <div className="space-x-3 text-sm">
              <Link to={`/admin/quizzes/${q.id}/questions`} className="text-indigo-600">Questions</Link>
              <button onClick={() => startEdit(q)} className="text-indigo-600">Edit</button>
              <button onClick={() => togglePublish(q)} className="text-amber-600">
                {q.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => handleDelete(q.id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {quizzes.length === 0 && <p className="px-5 py-4 text-slate-400 text-sm">No quizzes yet.</p>}
      </div>
    </div>
  );
}
