'use client';

import { useState, useEffect } from 'react';

export default function ClientBody() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Don't render anything on the server
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 select-none">
      {/* This component can be used for client-side only functionality */}
      {/* For example, modals, tooltips, or other interactive elements */}
    </div>
  );
}