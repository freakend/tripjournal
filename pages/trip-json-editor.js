
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';



export default function TripJsonEditor() {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTripJson();
  }, []);

  const fetchTripJson = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/trip');
      if (!response.ok) throw new Error('Failed to fetch trip.json');
      const data = await response.json();
      setJsonText(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const parsed = JSON.parse(jsonText);
      const response = await fetch('/api/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed, null, 2)
      });
      if (!response.ok) throw new Error('Failed to save trip.json');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center px-2 py-4 sm:px-0">
      {/* Header with back button */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between py-4 px-2 sm:px-0">
        <button
          className="flex items-center gap-2 text-indigo-600 bg-white rounded-lg px-3 py-1 shadow hover:bg-indigo-50 transition"
          onClick={() => router.push('/')}
        >
          <span className="text-lg">←</span>
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit trip.json</h1>
        <div style={{ width: 80 }}></div> {/* Spacer for layout symmetry */}
      </div>

      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-4">
        {loading ? (
          <div className="text-gray-600 text-center py-10">Loading...</div>
        ) : (
          <>
            {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
            {success && <div className="text-green-600 mb-2 text-center">Saved successfully!</div>}
            <textarea
              className="w-full h-[350px] sm:h-[500px] p-3 border border-gray-200 rounded-lg font-mono text-xs sm:text-sm focus:border-indigo-400 focus:outline-none resize-none transition"
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              spellCheck={false}
            />
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold text-base w-full sm:w-auto"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-base w-full sm:w-auto"
                onClick={async () => {
                  await handleSave();
                  router.push('/');
                }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save and Redirect'}
              </button>
            </div>
          </>
        )}
      </div>
      <div className="text-xs text-gray-400 mt-4 text-center">Directly edit your trip.json file. Be careful!</div>
    </div>
  );
}
