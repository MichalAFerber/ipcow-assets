// Set the footer
document.getElementById('footer-copyright').innerHTML = `&copy; ${new Date().getFullYear()} | Created with <i class="icon-heart" title="Love"></i> by <a href="https://michalferber.com" target="_blank">Michal Ferber, aka TechGuyWithABeard</a>`;

/* 
 * Utility: Click-to-copy with floating tooltip
 * Adapted from ipcow.com assets
 */
function makeCopyable(element, textGetter = (el) => el.textContent.trim(), options = {}) {
    if (!element || element.dataset.copyableBound === '1') return;
    element.dataset.copyableBound = '1';

    const { lockBackgroundOnHover = false } = options;
    const lockedBackgroundColor = lockBackgroundOnHover
        ? window.getComputedStyle(element).backgroundColor
        : null;

    // Avoid collisions with Bootstrap/other CSS by not using generic class names.
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'copy-tooltip';
    document.body.appendChild(tooltipEl);

    const setImportantStyles = (styles) => {
        for (const [key, value] of Object.entries(styles)) {
            tooltipEl.style.setProperty(key, value, 'important');
        }
    };

    const applyBaseTooltipStyle = () => {
        setImportantStyles({
            'display': 'none',
            'position': 'fixed',
            'z-index': '2147483647',
            'background-color': '#111827',
            'color': '#ffffff',
            'padding': '6px 10px',
            'border-radius': '6px',
            'font-size': '13px',
            'font-weight': '600',
            'line-height': '1.2',
            'font-family': 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
            'white-space': 'nowrap',
            'pointer-events': 'none',
            'box-shadow': '0 8px 24px rgba(0, 0, 0, 0.35)',
            'opacity': '1',
            'visibility': 'visible',
            'mix-blend-mode': 'normal',
            'text-rendering': 'geometricPrecision',
            '-webkit-font-smoothing': 'antialiased',
            '-webkit-text-fill-color': '#ffffff',
            'text-shadow': '0 1px 1px rgba(0, 0, 0, 0.35)'
        });
    };

    const positionTooltip = (left, top) => {
        // Clamp to viewport with a little padding.
        const padding = 8;
        const rect = tooltipEl.getBoundingClientRect();
        const width = rect.width || 160;
        const height = rect.height || 28;

        let x = left;
        let y = top;
        if (x < padding) x = padding;
        if (x + width > window.innerWidth - padding) x = window.innerWidth - padding - width;
        if (y < padding) y = padding;
        if (y + height > window.innerHeight - padding) y = window.innerHeight - padding - height;

        setImportantStyles({
            'left': `${Math.round(x)}px`,
            'top': `${Math.round(y)}px`
        });
    };

    const showTooltipAtCursor = (event, text) => {
        tooltipEl.textContent = text;
        applyBaseTooltipStyle();
        setImportantStyles({ 'display': 'block' });
        // Measure then position.
        positionTooltip(event.clientX + 12, event.clientY - 34);
    };

    const showTooltipAboveElement = (text) => {
        tooltipEl.textContent = text;
        applyBaseTooltipStyle();
        setImportantStyles({ 'display': 'block' });

        const rect = element.getBoundingClientRect();
        // Measure then position.
        const measured = tooltipEl.getBoundingClientRect();
        const width = measured.width || 160;
        positionTooltip(rect.left + rect.width / 2 - width / 2, rect.top - 42);
    };

    const hideTooltip = () => {
        setImportantStyles({ 'display': 'none' });
    };

    // UX: show it's interactive.
    if (!element.style.cursor) element.style.cursor = 'copy';
    if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '0');

    const getPointerLike = (e) => {
        if (!e) return null;
        if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
            return { clientX: e.clientX, clientY: e.clientY };
        }
        const touch = e.touches && e.touches[0]
            ? e.touches[0]
            : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : null);
        if (touch && typeof touch.clientX === 'number' && typeof touch.clientY === 'number') {
            return { clientX: touch.clientX, clientY: touch.clientY };
        }
        return null;
    };

    const copyTextWithFallback = async (text) => {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function' && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (!ok) throw new Error('execCommand(copy) failed');
    };

    let lastPointer = null;
    let isShowingResult = false;

    // Mobile: capture touch/pointer coordinates so "Copied!" can appear at the tap location.
    element.addEventListener('pointerdown', (e) => {
        const p = getPointerLike(e);
        if (p) lastPointer = p;
    }, { passive: true });
    element.addEventListener('touchstart', (e) => {
        const p = getPointerLike(e);
        if (p) lastPointer = p;
    }, { passive: true });

    let mousemoveHandler;
    element.addEventListener('mouseenter', (e) => {
        if (lockBackgroundOnHover && lockedBackgroundColor) {
            element.style.setProperty('background-color', lockedBackgroundColor, 'important');
        }
        lastPointer = getPointerLike(e) || lastPointer;
        showTooltipAtCursor(e, 'click to copy');
        mousemoveHandler = (ev) => {
            lastPointer = getPointerLike(ev) || lastPointer;
            if (isShowingResult) return;
            showTooltipAtCursor(ev, 'click to copy');
        };
        document.addEventListener('mousemove', mousemoveHandler);
    });

    element.addEventListener('mouseleave', () => {
        hideTooltip();
        if (mousemoveHandler) {
            document.removeEventListener('mousemove', mousemoveHandler);
            mousemoveHandler = null;
        }
    });

    const doCopy = async (event) => {
        const text = textGetter(element);
        const pointerEvent = getPointerLike(event) || lastPointer;

        try {
            await copyTextWithFallback(text);
            isShowingResult = true;
            if (pointerEvent) {
                showTooltipAtCursor(pointerEvent, 'Copied!');
            } else {
                showTooltipAboveElement('Copied!');
            }
        } catch (err) {
            console.error('Failed to copy: ', err);
            isShowingResult = true;
            if (pointerEvent) {
                showTooltipAtCursor(pointerEvent, 'Failed to copy');
            } else {
                showTooltipAboveElement('Failed to copy');
            }
        }

        setTimeout(() => {
            hideTooltip();
            isShowingResult = false;
        }, 1500);
    };

    // Mobile support: "touchend" often works better than "click" to trigger actions on mobile,
    // avoiding the 300ms delay and ghost clicks.
    // However, if we add 'touchend', we must be careful not to trigger 'click' twice if the browser fires both.
    // We'll use a simple debounce/flag or just rely on 'click' but ensure tap highlighting is suppressed.
    // For now, let's keep 'click', but add 'touchend' that calls preventDefault() to stop the ghost click.
    
    element.addEventListener('touchend', (e) => {
        // Prevent default to stop phantom clicks and selection behavior
        // multiple listeners might be fine, but let's ensure we only copy once per tap.
        if (e.cancelable) e.preventDefault();
        doCopy(e);
    });

    element.addEventListener('click', doCopy);
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            doCopy(null);
        }
    });
}

// Automatically apply to park.ipcow.com elements if present
// Since this script is async, we generally wait for DOMContentLoaded, but check now just in case.
(function() {
    function init() {
        const parkDomain = document.getElementById('domain-name');
        if (parkDomain && typeof makeCopyable === 'function') {
            makeCopyable(parkDomain);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
