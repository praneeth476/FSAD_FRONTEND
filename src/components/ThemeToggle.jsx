import { useEffect, useState } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'glass';
      return 'light';
    });
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Moon size={24} color="currentColor" />;
    if (theme === 'dark') return <Palette size={24} color="currentColor" />;
    return <Sun size={24} color="currentColor" />;
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-heading)',
        transition: 'var(--transition-base)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      aria-label="Toggle Theme"
      title={`Current theme: ${theme}. Click to change.`}
    >
      {getThemeIcon()}
    </button>
  );
}
