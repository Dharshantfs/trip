import React, { useState } from 'react';

export function Avatar({ user, name, src, size = 38, className = '' }) {
  const [imgError, setImgError] = useState(false);
  const displayName = name || user?.name || 'User';
  const displaySrc = src || user?.avatar;
  const initial = displayName.charAt(0).toUpperCase();

  // Consistent color generation based on name
  const colors = [
    '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#3b82f6', '#14b8a6'
  ];
  const colorIndex = displayName.charCodeAt(0) % colors.length;
  const bgColor = user?.color || colors[colorIndex];

  return (
    <div
      className={`avatar-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: bgColor,
        color: '#ffffff',
        fontWeight: 700,
        fontSize: size * 0.42,
        userSelect: 'none',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
      }}
      title={displayName}
    >
      {displaySrc && !imgError ? (
        <img
          src={displaySrc}
          alt={displayName}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
