import React, { useState } from 'react';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';

function PriorityBadge({ priority }) {
  const color = priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{priority}</span>
  );
}

export default function TodoListPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('low');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await fetch('/api/todo');
        if (!res.ok) throw new Error('Failed to fetch todos');
        const data = await res.json();
        setTodos(data.todo || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setAdding(true);
    const newTodo = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      priority,
    };
    const updated = { todo: [...todos, newTodo] };
    try {
      const res = await fetch('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Failed to add todo');
      setTodos(updated.todo);
      setNewTask('');
      setPriority('low');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-8 pb-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">To Do List</h1>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Add new task..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            disabled={adding}
          />
          <select
            className="px-3 py-3 rounded-lg border border-gray-300 text-gray-700 focus:outline-none"
            value={priority}
            onChange={e => setPriority(e.target.value)}
            disabled={adding}
          >
            <option value="low">Low</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            disabled={adding}
          >
            Add
          </button>
        </form>
        {loading && <div className="text-gray-500 mb-4 text-center">Loading...</div>}
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        <div className="space-y-4">
          {todos.length === 0 && !loading && (
            <div className="text-gray-400 text-center">No tasks yet.</div>
          )}
          {todos.map(todo => (
            <div key={todo.id} className="bg-white rounded-2xl shadow flex items-center px-4 py-4 gap-3 justify-between">
              <div className="flex items-center gap-3 w-full">
                <button
                  aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all focus:outline-none ${todo.completed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 hover:border-indigo-400'}`}
                  onClick={async () => {
                    const updatedTodos = todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t);
                    setTodos(updatedTodos);
                    await fetch('/api/todo', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ todo: updatedTodos }),
                    });
                  }}
                >
                  {todo.completed ? (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#4F46E5"/><path d="M7 10.5l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#fff" stroke="#D1D5DB" strokeWidth="2"/></svg>
                  )}
                </button>
                <span className={`flex-1 text-base font-medium text-gray-900 truncate ${todo.completed ? 'line-through opacity-60' : ''}`}>{todo.text}</span>
              </div>
              <PriorityBadge priority={todo.priority} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
