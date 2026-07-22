/**
 * Theme Upgrade Script
 * 
 * This script enhances dark mode support across the application.
 * It upgrades Login, Register, and other pages to use ThemeContext
 * CSS custom properties instead of hardcoded colors.
 * 
 * Usage: Import in main.jsx or run standalone for theme migration.
 */

// CSS variable map for pages with hardcoded colors
const THEME_UPGRADE_MAP = {
  // Page selectors and their color properties to replace
  '.login-page': {
    'background-color': 'var(--bg-color)',
    'color': 'var(--text-primary)',
  },
  '.login-card': {
    'background-color': 'var(--surface-color)',
    'color': 'var(--text-primary)',
  },
  '.register-page': {
    'background-color': 'var(--bg-color)',
  },
};

/**
 * Injects theme upgrade styles into the document
 */
export function injectThemeUpgradeStyles() {
  const style = document.createElement('style');
  style.id = 'theme-upgrade-styles';
  style.textContent = getThemeUpgradeCSS();
  
  const existing = document.getElementById('theme-upgrade-styles');
  if (existing) {
    existing.remove();
  }
  
  document.head.appendChild(style);
  console.log('[ThemeUpgrade] Theme enhancement styles injected');
}

/**
 * Generates CSS for theme upgrades
 */
function getThemeUpgradeCSS() {
  return `
    /* ============================================
       Theme Upgrade - CSS Variable Integration
       Ensures all pages properly use CSS custom
       properties from :root and .dark-mode
       ============================================ */

    /* --- Login Page Enhancement --- */
    .login-page {
      background-color: var(--bg-color) !important;
      color: var(--text-primary) !important;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    .login-card {
      background-color: var(--surface-color) !important;
      color: var(--text-primary) !important;
      border: 1px solid var(--border-color) !important;
      box-shadow: var(--shadow-bento) !important;
    }

    .login-card h2,
    .login-card p,
    .login-card label {
      color: var(--text-primary) !important;
    }

    .login-card input {
      background-color: var(--bg-color) !important;
      border-color: var(--border-color) !important;
      color: var(--text-primary) !important;
    }

    .login-card input:focus {
      border-color: var(--text-primary) !important;
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05) !important;
    }

    body.dark-mode .login-card input:focus {
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1) !important;
    }

    .login-card .btn-submit {
      background-color: var(--text-primary) !important;
      color: var(--bg-color) !important;
    }

    .login-card a {
      color: var(--accent-teal) !important;
    }

    /* --- Register Page Enhancement --- */
    .register-page {
      background-color: var(--bg-color) !important;
      color: var(--text-primary) !important;
    }

    .register-card {
      background-color: var(--surface-color) !important;
      color: var(--text-primary) !important;
      border: 1px solid var(--border-color) !important;
    }

    .register-card h1,
    .register-card p {
      color: var(--text-primary) !important;
    }

    .register-card a {
      color: var(--accent-teal) !important;
    }

    /* --- Stats Page Enhancement --- */
    .stats-page {
      background-color: var(--bg-color) !important;
      color: var(--text-primary) !important;
    }

    /* --- Shared Roadmap Enhancement --- */
    .shared-roadmap-page {
      background-color: var(--bg-color) !important;
      color: var(--text-primary) !important;
    }

    /* --- Navbar consistency --- */
    .navbar-bg {
      background-color: var(--bg-color) !important;
    }

    /* --- Button consistency for dark mode --- */
    body.dark-mode .btn-solid-dark {
      background-color: #ffffff !important;
      color: #1e1e1e !important;
    }

    body.dark-mode .btn-primary-ghost {
      color: var(--text-primary) !important;
      border-color: var(--border-color) !important;
    }

    /* --- Smooth transitions for all themed elements --- */
    .theme-transition {
      transition: background-color 0.3s ease,
                  color 0.3s ease,
                  border-color 0.3s ease,
                  box-shadow 0.3s ease !important;
    }
  `;
}

/**
 * Migrates pages to use theme variables.
 * Call this once on app initialization.
 */
export function migratePagesToTheme() {
  injectThemeUpgradeStyles();
  
  // Add theme-transition class to body for smooth transitions
  document.body.classList.add('theme-transition');
  
  // Log the migration
  const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  console.log(`[ThemeUpgrade] Pages migrated to ${mode} theme successfully`);
}

// Auto-migrate on import
if (typeof window !== 'undefined') {
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', migratePagesToTheme);
  } else {
    migratePagesToTheme();
  }
}

export default {
  injectThemeUpgradeStyles,
  migratePagesToTheme,
};

