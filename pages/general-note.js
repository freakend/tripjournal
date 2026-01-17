import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
 
export default function GeneralNote() {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [content, setContent] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchNote();
  }, []);

  const fetchNote = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/allnote');
      if (!response.ok) throw new Error('Failed to fetch allnote.json');
      const data = await response.json();
      setNote(data);
      setContent((data.content || []).join('\n'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = {
        ...note,
        updatedAt: new Date().toISOString(),
        content: content.split('\n'),
      };
      const response = await fetch('/api/allnote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated, null, 2),
      });
      if (!response.ok) throw new Error('Failed to save allnote.json');
      setNote(updated);
      setEditMode(false);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <Navbar title="General Note" />
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-8">
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-4">
        {loading ? (
          <div className="text-gray-600 text-center py-10">Loading...</div>
        ) : (
          <>
            {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
            {success && <div className="text-green-600 mb-2 text-center">Saved successfully!</div>}
            <div className="mb-2">
              <div className="text-lg font-semibold text-gray-800">{note?.title}</div>
              <div className="text-xs text-gray-400">Created: {note?.createdAt}</div>
              <div className="text-xs text-gray-400">Last updated: {note?.updatedAt}</div>
            </div>
            {editMode ? (
              <textarea
                className="w-full h-[350px] sm:h-[500px] p-3 border border-gray-200 rounded-lg font-mono text-xs sm:text-sm focus:border-orange-400 focus:outline-none resize-none transition"
                value={content}
                onChange={e => setContent(e.target.value)}
                spellCheck={false}
                autoFocus
              />
            ) : (
              <pre className="w-full h-[350px] sm:h-[500px] p-3 border border-gray-200 rounded-lg font-mono text-xs sm:text-sm bg-gray-50 overflow-auto whitespace-pre-wrap">{content}</pre>
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              {!editMode && (
                <button
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-semibold text-base w-full sm:w-auto"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              )}
              {editMode && (
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-base w-full sm:w-auto"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </>
        )}
        </div>
        <div className="text-xs text-gray-400 mt-4 text-center">All-in-one note. Click Edit to modify.</div>
      </div>
    </div>
  );
}
