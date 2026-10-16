import React from 'react';

export default function AnnouncementBar({ text }) {
  return (
    <div className="bg-brand-peach py-2 text-center text-sm font-medium text-brand-dark px-4">
      {text}
    </div>
  );
}
