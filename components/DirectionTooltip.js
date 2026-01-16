import React from 'react';

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
      >
        Direction
      </button>
      {show && (
        <span className="absolute left-1/2 -translate-x-1/2 mt-2 z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
          {desc}
        </span>
      )}
    </span>
  );
}

export default DirectionTooltip;
