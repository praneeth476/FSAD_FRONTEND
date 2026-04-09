import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
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
        border: 'var(--glass-border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-heading)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        transition: 'var(--transition-base)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      aria-label="Toggle Theme"
      title="Toggle Dark/Light Mode"
    >
      {theme === 'light' ? <Moon size={24} color="currentColor" /> : <Sun size={24} color="currentColor" />}
    </button>
  );
}
