import { useTheme } from '../store/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleDark } = useTheme();

  return (
    <button
      onClick={toggleDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        width: 36,
        height: 36,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: 18,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
