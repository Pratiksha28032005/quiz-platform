import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function load() {
    api.get('/categories').then((res) => setCategories(res.data));
  }
  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    await api.post('/categories', { name, description });
    setName(''); setDescription('');
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    load();
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>
      <form onSubmit={handleAdd} className="bg-white rounded-lg shadow p-5 flex gap-3 mb-6">
        <input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 flex-1" required />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
          className="border rounded px-3 py-2 flex-1" />
        <button className="bg-indigo-600 text-white px-4 rounded">Add</button>
      </form>
      <div className="bg-white rounded-lg shadow divide-y">
        {categories.map((c) => (
          <div key={c.id} className="flex justify-between items-center px-5 py-3">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-slate-400">{c.description}</p>
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-red-600 text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
