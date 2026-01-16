import React from 'react';

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

export default EditableCost;
