/* Theme toggle (shared)
   Controls html[data-theme] with localStorage key: ipcow-theme */

(function () {
    const STORAGE_KEY = 'ipcow-theme';

    const getTheme = () => {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    };

    const setTheme = (theme) => {
        const html = document.documentElement;
        if (theme) {
            html.setAttribute('data-theme', theme);
        } else {
            html.removeAttribute('data-theme');
        }

        try {
            if (theme) {
                localStorage.setItem(STORAGE_KEY, theme);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch {
            // ignore
        }

        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
            toggle.setAttribute('aria-label', 'Toggle theme');
        }
    };

    const resolveInitialTheme = () => {
        const saved = getTheme();
        if (saved === 'dark' || saved === 'light') return saved;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    };

    const init = () => {
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;

        // Initialize state
        const currentTheme = resolveInitialTheme();
        setTheme(currentTheme);

        // Click handler
        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            setTheme(next);
        });

        // System preference listener
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!getTheme()) { // only if no manual override
                    setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
