import { pausePatterns, resumePatterns } from './pattern';

/**
 * Platform Dots Animation
 * Gray-side rects and purple-side groups animate via CSS keyframes —
 * compositor thread only, zero per-frame JS cost.
 * JS only assigns random animation-delay once per element at init.
 *
 * Attrs:
 *   data-dots="platform"  → SVG wrapper
 */

// ─── Config ──────────────────────────────────────────────────────────────────
const GRAY_DUR_MIN = 2; // seconds — slowest gray rect flicker cycle
const GRAY_DUR_MAX = 5; // seconds — fastest gray rect flicker cycle
const GROUP_DUR = 3; // seconds — purple group breathe cycle
const GROUP_SPREAD = 3; // seconds — total stagger spread across all groups
// ─────────────────────────────────────────────────────────────────────────────

export function initPlatformDots(selector = '[data-dots="platform"]') {
  const svg = document.querySelector(selector);
  if (!svg) return;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes platform-gray-flicker {
      0%, 100% { opacity: var(--op-lo); }
      50%       { opacity: var(--op-hi); }
    }

    @keyframes platform-group-breathe {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.2; }
    }

    [data-dots="platform"] #gray-side rect {
      animation: platform-gray-flicker var(--dur) ease-in-out infinite;
      animation-play-state: paused;
    }

    [data-dots="platform"] #purple-side g[id^="group-"] {
      transform-box: fill-box;
      transform-origin: center;
      animation: platform-group-breathe ${GROUP_DUR}s ease-in-out infinite;
      animation-play-state: paused;
    }
  `;
  document.head.appendChild(style);

  // Assign random duration + opacity range per gray rect
  svg.querySelectorAll('#gray-side rect').forEach((rect) => {
    const dur = (GRAY_DUR_MIN + Math.random() * (GRAY_DUR_MAX - GRAY_DUR_MIN)).toFixed(2);
    const lo = (0.1 + Math.random() * 0.3).toFixed(2);
    const hi = (0.5 + Math.random() * 0.5).toFixed(2);
    const delay = (Math.random() * parseFloat(dur)).toFixed(2);
    rect.style.setProperty('--dur', `${dur}s`);
    rect.style.setProperty('--op-lo', lo);
    rect.style.setProperty('--op-hi', hi);
    rect.style.animationDelay = `-${delay}s`; // negative = start mid-cycle, no ramp-up
  });

  // Assign staggered delay across all purple groups
  const groups = [...svg.querySelectorAll('#purple-side g[id^="group-"]')];
  const total = groups.length;
  groups.forEach((group, i) => {
    const delay = (((total - 1 - i) / total) * GROUP_SPREAD).toFixed(2);
    group.style.animationDelay = `-${delay}s`;
  });

  const els = '#gray-side rect, #purple-side g[id^="group-"]';

  const attachObserver = () => {
    // IntersectionObserver toggles play-state — no JS runs while off-screen
    new IntersectionObserver(([entry]) => {
      const state = entry.isIntersecting ? 'running' : 'paused';
      svg.querySelectorAll(els).forEach((el) => {
        el.style.animationPlayState = state;
      });
      if (entry.isIntersecting) pausePatterns();
      else resumePatterns();
    }).observe(svg);
  };

  // Wait for the platform illustration reveal to finish before showing dots.
  // Falls back to immediate start if the illustration doesn't exist on this page.
  if (document.querySelector('[data-anim="platform"]')) {
    gsap.set(svg, { autoAlpha: 0 });
    window.addEventListener(
      'platform-illustration-complete',
      () => {
        gsap.to(svg, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' });
        attachObserver();
      },
      { once: true }
    );
  } else {
    attachObserver();
  }
}
