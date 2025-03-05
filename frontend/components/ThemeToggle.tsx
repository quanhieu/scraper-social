import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: '100px', height: '36px' }}></div>; // Placeholder with same dimensions
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        background: 'none',
        border: '1px solid var(--foreground)',
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: 'pointer',
        color: 'var(--foreground)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {theme === 'light' ? (
        <>
          <span>🌙</span>
          <span>Switch to Dark</span>
        </>
      ) : (
        <>
          <span>☀️</span>
          <span>Switch to Light (Default)</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle; 