import { runSecureMCP } from './illustration';
import { runPattern } from './pattern';
import { initGlobalParallax } from './osmo';
import { initScrambleText } from './osmo';
import { initContentRevealScroll } from './osmo';
import { initGraphsAnimation } from './graphAnimations';
import { initHighlightMarkerTextReveal } from './osmo';
import { initPlatformDots } from './platform';

gsap.registerPlugin(SplitText, ScrollTrigger, DrawSVGPlugin);

window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    initGraphsAnimation();
    initPlatformDots();
    runSecureMCP();

    // Requires <style>body { opacity: 0; }</style> inline in <head> to prevent flash.
    // Delay also ensures once:true triggers from initGraphsAnimation have fully cleaned up
    // before initGlobalParallax/initScrambleText create new ScrollTriggers and call refresh().
    setTimeout(() => {
      $('body').attr('data-anim-loaded', 'true');
      initGlobalParallax();
      initScrambleText();
      runPattern();
      initHighlightMarkerTextReveal();
      initContentRevealScroll();
    }, 400);
  });
});
