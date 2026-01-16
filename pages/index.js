import React, { useState, useEffect } from 'react';
import { Check, MapPin, Clock, DollarSign, AlertCircle, Train, Bus, Car, Navigation, RefreshCw, Notebook } from 'lucide-react';

const TripTodoApp = () => {
    // Get current time in HH:mm format
    const [currentTime, setCurrentTime] = useState(() => {
      const now = new Date();
      return now.toTimeString().slice(0,5);
    });

    // Update current time every minute
    useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date();
        setCurrentTime(now.toTimeString().slice(0,5));
      }, 60000);
      return () => clearInterval(interval);
    }, []);
  const [tripData, setTripData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Notes state for all stops
  const [showNotesId, setShowNotesId] = useState(null);
  const [notesDraft, setNotesDraft] = useState({});

    // Toggle completion for a stop
    const toggleComplete = (stopId) => {
      const currentDay = tripData.trip.days[selectedDay];
      const updatedStops = currentDay.stops.map(s =>
        s.id === stopId ? { ...s, completed: !s.completed } : s
      );
      const newData = {
        ...tripData,
        trip: {
          ...tripData.trip,
          days: tripData.trip.days.map((day, idx) =>
            idx === selectedDay ? { ...day, stops: updatedStops } : day
          )
        }
      };
      setTripData(newData);
      saveTripData(newData);
    };

  // Save data to JSON file
  const saveTripData = async (newData) => {
    try {
      setSaving(true);
      const response = await fetch('/api/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });

      if (!response.ok) throw new Error('Failed to save trip data');
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Save notes to trip data
  // Track if a note has been edited before
  const [notesEditCount, setNotesEditCount] = useState({});

  const handleNotesSave = (stopId) => {
    // Always use stop.notes as fallback if notesDraft[stopId] is undefined
    const currentDay = tripData.trip.days[selectedDay];
    const stop = currentDay.stops.find(s => s.id === stopId);
    const value = notesDraft[stopId] !== undefined ? notesDraft[stopId] : (stop ? stop.notes || '' : '');
    const wasNotePresent = stop && stop.notes && stop.notes.trim() !== '';
    const editCount = notesEditCount[stopId] || 0;

    // Only save if value changed
    if ((stop && stop.notes === value)) {
      setShowNotesId(null);
      setNotesDraft(draft => {
        const newDraft = { ...draft };
        delete newDraft[stopId];
        return newDraft;
      });
      return;
    }

    // If note was present and this is the second edit, ask for confirmation
    if (wasNotePresent && editCount >= 1) {
      if (!window.confirm('Are you sure you want to update this note again?')) {
        setShowNotesId(null);
        setNotesDraft(draft => {
          const newDraft = { ...draft };
          delete newDraft[stopId];
          return newDraft;
        });
        return;
      }
    }

    const updatedStops = currentDay.stops.map(s =>
      s.id === stopId ? { ...s, notes: value } : s
    );
    const newData = {
      ...tripData,
      trip: {
        ...tripData.trip,
        days: tripData.trip.days.map((day, idx) =>
          idx === selectedDay ? { ...day, stops: updatedStops } : day
        )
      }
    };
    setShowNotesId(null);
    setNotesDraft(draft => {
      const newDraft = { ...draft };
      delete newDraft[stopId];
      return newDraft;
    });
    setNotesEditCount(counts => ({ ...counts, [stopId]: wasNotePresent ? editCount + 1 : 1 }));
    saveTripData(newData);
    setTripData(newData);
  };

  // Fetch data on mount
  useEffect(() => {
    fetchTripData();
  }, []);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trip');
      if (!response.ok) throw new Error('Failed to fetch trip data');
      const data = await response.json();
      setTripData(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Transport badge component
  const TransportBadge = ({ mode }) => {
    const modes = mode.split('+');
    return (
      <div className="flex gap-1 flex-wrap">
        {modes.map((m, i) => {
          const configs = {
            mrt: { icon: Train, bg: 'bg-purple-100', text: 'text-purple-700', label: 'MRT' },
            bus: { icon: Bus, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Bus' },
            car: { icon: Car, bg: 'bg-green-100', text: 'text-green-700', label: 'Car' },
            walk: { icon: Navigation, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Walk' },
            none: { icon: null, bg: '', text: '', label: '' }
          };

          const config = configs[m] || configs.walk;
          if (!config.icon) return null;

          const Icon = config.icon;
          return (
            <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
              <Icon size={12} />
              {config.label}
            </span>
          );
        })}
      </div>
    );
  };

  // Category icon
  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍴',
      transit: '🚇',
      sightseeing: '🏛️',
      rest: '🛏️',
      shopping: '🛍️'
    };
    return icons[category] || '📍';
  };

  // Priority color
  const getPriorityColor = () => 'border-l-gray-300';

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
          <p className="text-gray-600">Loading your trip...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tripData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
          <p className="text-red-600 font-medium mb-2">Error loading trip data</p>
          <p className="text-gray-600 text-sm mb-4">{error || 'Unknown error'}</p>
          <button
            onClick={fetchTripData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentDay = tripData.trip.days[selectedDay];
  const { meta, stops } = currentDay;


  // Location max length for tooltip truncation
  const locationMaxLength = 20;

  // Calculate budget stats
  const totalSpent = stops
    .filter(s => s.completed)
    .reduce((sum, s) => sum + s.estimated_cost_sgd, 0);

  const totalEstimated = stops.reduce((sum, s) => sum + s.estimated_cost_sgd, 0);
  const completedCount = stops.filter(s => s.completed).length;
  const totalCount = stops.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Trip Planner</h1>
              <button
                className="ml-2 text-xl bg-white rounded-full shadow hover:bg-indigo-50 transition"
                title="Edit trip.json"
                onClick={() => window.location.href = '/trip-json-editor'}
              >
                <span role="img" aria-label="Edit trip.json">📝</span>
              </button>
            </div>
            {saving && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <RefreshCw size={12} className="animate-spin" />
                Saving...
              </span>
            )}
          </div>
          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tripData.trip.days.map((day, idx) => {
              const location = day.meta.city
                ? `${day.meta.country} - ${day.meta.city}`
                : day.meta.country;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(idx)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedDay === idx
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {location}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Refactored Day Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Hotel & Date */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-indigo-100 rounded-full p-2 sm:p-3 flex items-center justify-center">
              <MapPin size={20} className="text-indigo-600 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-base sm:text-2xl">
                {meta.hotel.name}
              </div>
              <div className="text-xs text-gray-600">{meta.hotel.area}</div>
              <div className="text-xs text-gray-500">{meta.date}</div>
            </div>
          </div>

          {/* Right: Progress & Budget */}
          <div className="text-sm text-gray-700 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              <span className="font-medium">Stops:</span>{" "}
              <span className="font-semibold text-gray-900">
                {completedCount}/{totalCount}
              </span>
            </span>

            <span className="text-gray-400">•</span>

            <span>
              <span className="font-medium">Spent:</span>{" "}
              <span className="font-semibold text-green-600">
                ${totalSpent.toFixed(2)}
              </span>
            </span>

            <span className="text-gray-400">•</span>

            <span>
              <span className="font-medium">Budget:</span>{" "}
              <span className="text-gray-600">
                ${totalEstimated.toFixed(2)}
              </span>
            </span>
          </div>

        </div>

        {/* Right: Engagement (example, you can replace with your own metric) */}
        {/* <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                <Clock size={20} className="text-blue-500" />
              </div>
              <span className="font-semibold text-gray-700">{totalCount}</span>
            </div>
            <div className="text-xs text-gray-400">Total Stops</div>
          </div> */}
      </div>

      {/* Stops List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        <div className="space-y-3">
          {stops.map((stop) => {
            // Highlight if stop.time is in HH:mm and within the next 30 minutes
            let isNow = false;
            if (stop.time && /^\d{1,2}:\d{2}$/.test(stop.time)) {
              const [stopHour, stopMin] = stop.time.split(':').map(Number);
              const now = new Date();
              const stopDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), stopHour, stopMin);
              const nowPlus30 = new Date(now.getTime() + 30 * 60000);
              isNow = stopDate >= now && stopDate <= nowPlus30;
            }
            return (
              <div
                key={stop.id}
                className={`bg-white rounded-xl shadow-sm transition-all flex items-center pl-4 pr-6 py-4 ${stop.completed ? 'opacity-60' : ''} ${isNow ? 'ring-2 ring-indigo-400 bg-indigo-50 ring-offset-2' : ''}`}
              >
              {/* Left: Icon & Complete Button */}
              <div className="flex flex-col items-center mr-4 sm:mr-6">
                <button
                  onClick={() => toggleComplete(stop.id)}
                  className={`mb-2 w-5 h-5 sm:w-7 sm:h-7 rounded-md border-2 flex items-center justify-center transition-all ${stop.completed
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300 hover:border-indigo-400'
                    }`}
                >
                  {stop.completed && <Check size={12} className="text-white sm:w-4 sm:h-4" />}
                </button>
              </div>
              {/* Center: Main Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center mb-1 justify-between">
                  <div className="flex items-center">
                    <span className="mr-1 sm:mr-2 text-base sm:text-lg align-middle">{getCategoryIcon(stop.category)}</span>
                    <h3 className={`font-semibold text-gray-900 text-base sm:text-lg ${stop.completed ? 'line-through' : ''}`}>{stop.activity}</h3>
                  </div>
                  {stop.estimated_cost_sgd > 0 && (
                    <EditableCost
                      value={stop.estimated_cost_sgd}
                      onChange={newValue => {
                        const updatedStops = stops.map(s =>
                          s.id === stop.id ? { ...s, estimated_cost_sgd: newValue } : s
                        );
                        const newData = {
                          ...tripData,
                          trip: {
                            ...tripData.trip,
                            days: tripData.trip.days.map((day, idx) =>
                              idx === selectedDay ? { ...day, stops: updatedStops } : day
                            )
                          }
                        };
                        saveTripData(newData);
                        setTripData(newData);
                      }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-1">
                  <Clock size={12} className="sm:w-4 sm:h-4" />
                  <span>{stop.time}</span>
                  <span className="text-gray-400">•</span>
                  <MapPin size={12} className="sm:w-4 sm:h-4" />
                  <TooltipLocation location={stop.location} locationMaxLength={locationMaxLength} />
                </div>

                {stop.movement.mode !== 'none' && (
                  <div className="flex items-center gap-2 mb-1 ">

                    <TransportBadge className="px-2 py-0.5 rounded-full font-medium" mode={stop.movement.mode} />
                    {stop.movement.desc && (
                      <DirectionTooltip className="px-2 py-0.5 rounded-full font-medium" desc={stop.movement.desc} />
                    )}
                    {/* Maps button if maps link present */}
                    {stop.maps && stop.maps.trim() !== '' && (
                      <a
                        href={stop.maps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium cursor-pointer flex items-center"
                        title="Open location in Maps"
                        style={{ textDecoration: 'none' }}
                      >
                        <MapPin size={14} className="inline-block" />
                        Maps
                      </a>
                    )}
                    <button
                      type="button"
                      className="gap-1 text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full font-medium cursor-pointer"
                      onClick={() => setShowNotesId(showNotesId === stop.id ? null : stop.id)}
                      title="Show or edit notes"
                    >
                      <span className="mr-1">📝</span>
                      Notes
                    </button>
                  </div>

                )
                }

                {/* Notes Icon and Area */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ${showNotesId === stop.id || (stop.notes && stop.notes.trim() !== '') ? 'max-h-40 mt-2' : 'max-h-0'}`}
                      >
                        {(showNotesId === stop.id || (stop.notes && stop.notes.trim() !== '')) && (
                          <textarea
                            className={`w-full text-xs text-gray-700 rounded-lg p-2 border mt-2 border-gray-200 focus:border-indigo-400 focus:outline-none resize-none transition ${stop.notes && stop.notes.trim() !== '' ? 'bg-gray-50' : 'bg-white'}`}
                            rows={3}
                            placeholder="Write your notes here..."
                            value={notesDraft[stop.id] !== undefined ? notesDraft[stop.id] : (stop.notes || '')}
                            onChange={e => setNotesDraft({ ...notesDraft, [stop.id]: e.target.value })}
                            onBlur={() => handleNotesSave(stop.id)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleNotesSave(stop.id);
                              }
                            }}
                            autoFocus={showNotesId === stop.id}
                          />
                        )}
                </div>
              </div>
              {/* Right: Secondary Info removed, EditableCost moved above */}
            </div>
          );})}
        </div>

      </div>
    </div>
  );
};

function TooltipLocation({ location, locationMaxLength }) {
  const [show, setShow] = useState(false);
  const truncated = location.length > locationMaxLength ? location.slice(0, locationMaxLength) + '…' : location;
  return (
    <span className="relative">
      <span
        className="cursor-pointer underline decoration-dotted"
        onClick={() => setShow(!show)}
        tabIndex={0}
        onBlur={() => setShow(false)}
      >
        {truncated}
      </span>
      {show && (
        <span className="absolute left-1/2 -translate-x-1/2 mt-2 z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
          {location}
        </span>
      )}
    </span>
  );
}

// DirectionTooltip component for static badge and tooltip
function DirectionTooltip({ desc }) {
  const [show, setShow] = React.useState(false);
  return (
    <span className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium cursor-pointer"
        onClick={() => setShow(!show)}
        tabIndex={0}
        onBlur={() => setShow(false)}
        title="Show direction info"
      >
        <Navigation size={14} className="inline-block" />
        Dir
      </button>
      {show && (
        <span className="absolute left-1/2 -translate-x-1/2 mt-2 z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
          {desc}
        </span>
      )}
    </span>
  );
}

function EditableCost({ value, onChange }) {
  const [editing, setEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleBlur = () => {
    setEditing(false);
    if (inputValue !== value) {
      const parsed = parseFloat(inputValue);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setInputValue(value);
    }
  };

  return editing ? (
    <input
      type="number"
      className="text-sm font-medium text-green-600 bg-white border border-green-300 rounded px-1 w-16 text-right"
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
      min="0"
      step="0.01"
    />
  ) : (
    <span
      className="text-sm font-medium text-green-600 cursor-pointer hover:underline"
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      ${value}
    </span>
  );
}

export default TripTodoApp;
