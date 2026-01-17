import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function TodoListPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState('');
  const [priority, setPriority] = useState('low');
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({ text: '', note: '', priority: 'low' });

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
      note: newNote,
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
      setNewNote('');
      setPriority('low');
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar title="To Do List" />
      <div className="max-w-md mx-auto px-4 pt-8 pb-8">
        
        {!showAddForm ? (
          <button
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition mb-6"
            onClick={() => setShowAddForm(true)}
          >
            + Add New Task
          </button>
        ) : (
          <form onSubmit={handleAdd} className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-gray-900">Add New Task</h2>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowAddForm(false);
                  setNewTask('');
                  setNewNote('');
                  setPriority('low');
                }}
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="px-4 py-3 rounded-lg border border-gray-300 shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Task title..."
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                disabled={adding}
                required
              />
              <input
                type="text"
                className="px-4 py-3 rounded-lg border border-gray-300 shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Note (optional)..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                disabled={adding}
              />
              <select
                className="px-3 py-3 rounded-lg border border-gray-300 text-gray-700 focus:outline-none"
                value={priority}
                onChange={e => setPriority(e.target.value)}
                disabled={adding}
              >
                <option value="low">Low Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                disabled={adding}
              >
                {adding ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        )}
        {loading && <div className="text-gray-500 mb-4 text-center">Loading...</div>}
        {error && <div className="text-red-600 mb-4 texAt-center">{error}</div>}
        <div className="space-y-4">
          {todos.length === 0 && !loading && (
            <div className="text-gray-400 text-center">No tasks yet.</div>
          )}
          {todos.sort((a, b) => a.completed - b.completed).map(todo => {
            const isEditing = editId === todo.id;
            const isHigh = todo.priority === 'high';
            return (
              <div key={todo.id} className={`bg-white rounded-2xl shadow px-4 py-4 gap-3 ${isHigh ? 'border-2 border-red-500' : ''}` + ' flex flex-col'}>
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
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`text-base font-medium truncate ${todo.completed ? 'line-through opacity-60' : ''} ${isHigh ? 'text-red-700' : 'text-gray-900'}`}>{todo.text}</span>
                    <span className={`text-sm truncate ${todo.completed ? 'line-through opacity-60' : ''} ${isHigh ? 'text-red-400' : 'text-gray-600'}`}>{todo.note}</span>
                  </div>
                  <button
                    className="ml-2 px-2 py-1 rounded bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 border border-gray-200"
                    onClick={() => {
                      setEditId(isEditing ? null : todo.id);
                      setEditFields({ text: todo.text, note: todo.note || '', priority: todo.priority || 'low' });
                    }}
                  >
                    {isEditing ? 'X' : '✎'}
                  </button>
                </div>
                {isEditing && (
                  <form
                    className="mt-3 flex flex-col gap-2 bg-gray-50 rounded-xl p-3"
                    onSubmit={async e => {
                      e.preventDefault();
                      const updatedTodos = todos.map(t =>
                        t.id === todo.id ? { ...t, ...editFields } : t
                      );
                      setTodos(updatedTodos);
                      setEditId(null);
                      await fetch('/api/todo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ todo: updatedTodos }),
                      });
                    }}
                  >
                    <input
                      className="px-3 py-2 rounded border border-gray-300 text-gray-700 focus:outline-none"
                      value={editFields.text}
                      onChange={e => setEditFields(f => ({ ...f, text: e.target.value }))}
                      placeholder="Task"
                      required
                    />
                    <input
                      className="px-3 py-2 rounded border border-gray-300 text-gray-700 focus:outline-none"
                      value={editFields.note}
                      onChange={e => setEditFields(f => ({ ...f, note: e.target.value }))}
                      placeholder="Note"
                    />
                    <select
                      className="px-3 py-2 rounded border border-gray-300 text-gray-700 focus:outline-none"
                      value={editFields.priority}
                      onChange={e => setEditFields(f => ({ ...f, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="high">High</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded font-semibold hover:bg-indigo-700 transition"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this task?')) {
                            const updatedTodos = todos.filter(t => t.id !== todo.id);
                            setTodos(updatedTodos);
                            setEditId(null);
                            await fetch('/api/todo', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ todo: updatedTodos }),
                            });
                          }
                        }}
                      >
                        DELETE
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
