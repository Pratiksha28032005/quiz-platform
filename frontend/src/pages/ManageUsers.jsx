import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  function load() {
    api.get('/users', { params: search ? { search } : {} }).then((res) => setUsers(res.data));
  }
  useEffect(load, [search]);

  async function toggleStatus(u) {
    const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await api.patch(`/users/${u.id}/status`, { status: newStatus });
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this student account?')) return;
    await api.delete(`/users/${id}`);
    load();
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Students</h1>
      <input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-full" />
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Attempts</th>
              <th className="px-4 py-2">Avg Score</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.quizzes_attempted}</td>
                <td className="px-4 py-2">{u.average_score}%</td>
                <td className="px-4 py-2">
                  <span className={u.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}>{u.status}</span>
                </td>
                <td className="px-4 py-2 space-x-3">
                  <button onClick={() => toggleStatus(u)} className="text-indigo-600">
                    {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
