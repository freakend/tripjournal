import React from 'react';

function TooltipLocation({ location, locationMaxLength }) {
  const [show, setShow] = React.useState(false);
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

export default TooltipLocation;
