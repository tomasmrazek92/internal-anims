export function initGlobalParallax() {
  const mm = gsap.matchMedia();

  mm.add(
    {
      isMobile: '(max-width:479px)',
      isMobileLandscape: '(max-width:767px)',
      isTablet: '(max-width:991px)',
      isDesktop: '(min-width:992px)',
    },
    (context) => {
      const { isMobile, isMobileLandscape, isTablet } = context.conditions;

      const ctx = gsap.context(() => {
        document.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
          // Check if this trigger has to be disabled on smaller breakpoints
          const disable = trigger.getAttribute('data-parallax-disable');
          if (
            (disable === 'mobile' && isMobile) ||
            (disable === 'mobileLandscape' && isMobileLandscape) ||
            (disable === 'tablet' && isTablet)
          ) {
            return;
          }

          // Optional: you can target an element inside a trigger if necessary
          const target = trigger.querySelector('[data-parallax="target"]') || trigger;

          // Get the direction value to decide between xPercent or yPercent tween
          const direction = trigger.getAttribute('data-parallax-direction') || 'vertical';
          const prop = direction === 'horizontal' ? 'xPercent' : 'yPercent';

          // Get the scrub value, our default is 'true' because that feels nice with Lenis
          const scrubAttr = trigger.getAttribute('data-parallax-scrub');
          const scrub = scrubAttr ? parseFloat(scrubAttr) : true;

          // Get the start position in %
          const startAttr = trigger.getAttribute('data-parallax-start');
          const startVal = startAttr !== null ? parseFloat(startAttr) : 20;

          // Get the end position in %
          const endAttr = trigger.getAttribute('data-parallax-end');
          const endVal = endAttr !== null ? parseFloat(endAttr) : -20;

          // Get the start value of the ScrollTrigger
          const scrollStart = trigger.getAttribute('data-parallax-scroll-start') || 'top bottom';

          // Get the end value of the ScrollTrigger
          const scrollEnd = trigger.getAttribute('data-parallax-scroll-end') || 'bottom top';

          gsap.fromTo(
            target,
            { [prop]: startVal },
            {
              [prop]: endVal,
              ease: 'none',
              scrollTrigger: {
                trigger,
                start: scrollStart,
                end: scrollEnd,
                scrub,
              },
            }
          );
        });
      });

      return () => ctx.revert();
    }
  );
}

export function initScrambleText() {
  // Function to reveal stuff on load
  function initScrambleOnLoad() {
    let targets = document.querySelectorAll('[data-scramble="load"]');

    targets.forEach((target) => {
      // split into seperate words + letters
      let split = new SplitText(target, {
        type: 'words, chars',
        wordsClass: 'word',
        charsClass: 'char',
      });

      gsap.to(split.words, {
        duration: 1.2,
        stagger: 0.01,
        scrambleText: {
          text: '{original}',
          chars: '01', // experiment with different scramble characters here
          speed: 0.85,
        },
        // Once animation is done, revert the split to reduce DOM size
        onComplete: () => split.revert(),
      });
    });
  }

  // Function to reveal stuff on scroll
  function initScrambleOnScroll() {
    let targets = document.querySelectorAll('[data-scramble="scroll"]');

    targets.forEach((target) => {
      let split = new SplitText(target, {
        type: 'words, chars',
        wordsClass: 'word',
        charsClass: 'char',
      });

      gsap.to(split.words, {
        duration: 2,
        stagger: 0.015,
        scrambleText: {
          text: '{original}',
          chars: '01', // experiment with different scramble characters here
          speed: 0.1,
        },
        scrollTrigger: {
          trigger: target,
          start: 'top bottom',
          once: true,
        },
        // Once animation is done, revert the split to reduce DOM size
        onComplete: () => split.revert(),
      });
    });
  }

  function initScrambleOnHover() {
    let targets = document.querySelectorAll('[data-scramble-hover="link"]');

    targets.forEach((target) => {
      let textEl = target.querySelector('[data-scramble-hover="target"]');
      let originalText = textEl.textContent; // save original text
      let customHoverText = textEl.getAttribute('data-scramble-text'); // if this attribute is present, take a custom hover text

      let split = new SplitText(textEl, {
        type: 'words, chars',
        wordsClass: 'word',
        charsClass: 'char',
      });

      target.addEventListener('mouseenter', () => {
        gsap.to(textEl, {
          duration: 1,
          scrambleText: {
            text: customHoverText ? customHoverText : originalText,
            chars: '01',
          },
        });
      });

      target.addEventListener('mouseleave', () => {
        gsap.to(textEl, {
          duration: 0.6,
          scrambleText: {
            text: originalText,
            speed: 2,
            chars: '01',
          },
        });
      });
    });
  }

  initScrambleOnLoad();
  initScrambleOnScroll();
  initScrambleOnHover();
}

export function initContentRevealScroll() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctx = gsap.context(() => {
    document.querySelectorAll('[data-reveal-group]').forEach((groupEl) => {
      // Config from attributes or defaults (group-level)
      const groupStaggerSec = (parseFloat(groupEl.getAttribute('data-stagger')) || 100) / 1000; // ms → sec
      const groupDistance = groupEl.getAttribute('data-distance') || '2em';
      const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';

      const animDuration = 0.8;
      const animEase = 'power4.inOut';

      // Reduced motion: show immediately
      if (prefersReduced) {
        gsap.set(groupEl, { clearProps: 'all', y: 0, autoAlpha: 1 });
        return;
      }

      // If no direct children, animate the group element itself
      const directChildren = Array.from(groupEl.children).filter(
        (el) => el.nodeType === 1 && !el.hasAttribute('data-reveal-skip')
      );
      if (!directChildren.length) {
        gsap.set(groupEl, { y: groupDistance, autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: groupEl,
          start: triggerStart,
          once: true,
          onEnter: () =>
            gsap.to(groupEl, {
              y: 0,
              autoAlpha: 1,
              duration: animDuration,
              ease: animEase,
              onComplete: () => gsap.set(groupEl, { clearProps: 'all' }),
            }),
        });
        return;
      }

      // Build animation slots: item or nested (deep layers allowed)
      const slots = [];
      directChildren.forEach((child) => {
        const nestedGroup = child.matches('[data-reveal-group-nested]')
          ? child
          : child.querySelector(':scope [data-reveal-group-nested]');

        if (nestedGroup) {
          const includeParent =
            child.getAttribute('data-ignore') === 'false' ||
            nestedGroup.getAttribute('data-ignore') === 'false';
          slots.push({ type: 'nested', parentEl: child, nestedEl: nestedGroup, includeParent });
        } else {
          slots.push({ type: 'item', el: child });
        }
      });

      // Initial hidden state
      slots.forEach((slot) => {
        if (slot.type === 'item') {
          // If the element itself is a nested group, force group distance (prevents it from using its own data-distance)
          const isNestedSelf = slot.el.matches('[data-reveal-group-nested]');
          const d = isNestedSelf
            ? groupDistance
            : slot.el.getAttribute('data-distance') || groupDistance;
          gsap.set(slot.el, { y: d, autoAlpha: 0 });
        } else {
          // Parent follows the group's distance when included, regardless of nested's data-distance
          if (slot.includeParent) gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
          // Children use nested group's own distance (fallback to group distance)
          const nestedD = slot.nestedEl.getAttribute('data-distance') || groupDistance;
          Array.from(slot.nestedEl.children)
            .filter((el) => !el.hasAttribute('data-reveal-skip'))
            .forEach((target) => gsap.set(target, { y: nestedD, autoAlpha: 0 }));
        }
      });

      // Extra safety: if a nested parent is included, re-assert its distance to the group's value
      slots.forEach((slot) => {
        if (slot.type === 'nested' && slot.includeParent) {
          gsap.set(slot.parentEl, { y: groupDistance });
        }
      });

      // Reveal sequence
      ScrollTrigger.create({
        trigger: groupEl,
        start: triggerStart,
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();

          slots.forEach((slot, slotIndex) => {
            const slotTime = slotIndex * groupStaggerSec;

            if (slot.type === 'item') {
              tl.to(
                slot.el,
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: animDuration,
                  ease: animEase,
                  onComplete: () => gsap.set(slot.el, { clearProps: 'all' }),
                },
                slotTime
              );
            } else {
              // Optionally include the parent at the same slot time (parent uses group distance)
              if (slot.includeParent) {
                tl.to(
                  slot.parentEl,
                  {
                    y: 0,
                    autoAlpha: 1,
                    duration: animDuration,
                    ease: animEase,
                    onComplete: () => gsap.set(slot.parentEl, { clearProps: 'all' }),
                  },
                  slotTime
                );
              }
              // Nested children use nested stagger (ms → sec); fallback to group stagger
              const nestedMs = parseFloat(slot.nestedEl.getAttribute('data-stagger'));
              const nestedStaggerSec = isNaN(nestedMs) ? groupStaggerSec : nestedMs / 1000;
              Array.from(slot.nestedEl.children).filter((el) => !el.hasAttribute('data-reveal-skip')).forEach((nestedChild, nestedIndex) => {
                tl.to(
                  nestedChild,
                  {
                    y: 0,
                    autoAlpha: 1,
                    duration: animDuration,
                    ease: animEase,
                    onComplete: () => gsap.set(nestedChild, { clearProps: 'all' }),
                  },
                  slotTime + nestedIndex * nestedStaggerSec
                );
              });
            }
          });
        },
      });
    });
  });

  return () => ctx.revert();
}

export function initHighlightMarkerTextReveal() {
  const defaults = {
    direction: 'right',
    theme: 'dark',
    scrollStart: 'top 90%',
    staggerStart: 'start',
    stagger: 100,
    barDuration: 0.6,
    barEase: 'power3.inOut',
  };

  const colorMap = {
    dark: '#121416',
    white: '#FFFFFF',
  };

  const directionMap = {
    right: { prop: 'scaleX', origin: 'right center' },
    left: { prop: 'scaleX', origin: 'left center' },
    up: { prop: 'scaleY', origin: 'center top' },
    down: { prop: 'scaleY', origin: 'center bottom' },
  };

  function resolveColor(value) {
    if (colorMap[value]) return colorMap[value];
    if (value.startsWith('--')) {
      return getComputedStyle(document.body).getPropertyValue(value).trim() || value;
    }
    return value;
  }

  function createBar(color, origin) {
    const bar = document.createElement('div');
    bar.className = 'highlight-marker-bar';
    Object.assign(bar.style, {
      backgroundColor: color,
      transformOrigin: origin,
    });
    return bar;
  }

  function cleanupElement(el) {
    if (!el._highlightMarkerReveal) return;
    el._highlightMarkerReveal.timeline?.kill();
    el._highlightMarkerReveal.scrollTrigger?.kill();
    el._highlightMarkerReveal.split?.revert();
    el.querySelectorAll('.highlight-marker-bar').forEach((bar) => bar.remove());
    delete el._highlightMarkerReveal;
  }

  let reduceMotion = false;

  gsap.matchMedia().add({ reduce: '(prefers-reduced-motion: reduce)' }, (context) => {
    reduceMotion = context.conditions.reduce;
  });

  // Reduced motion: no animation at all
  if (reduceMotion) {
    document.querySelectorAll('[data-highlight-marker-reveal]').forEach((el) => {
      gsap.set(el, { autoAlpha: 1 });
    });
    return;
  }

  // Cleanup previous instances
  document.querySelectorAll('[data-highlight-marker-reveal]').forEach(cleanupElement);

  const elements = document.querySelectorAll('[data-highlight-marker-reveal]');
  if (!elements.length) return;

  elements.forEach((el) => {
    const direction = el.getAttribute('data-marker-direction') || defaults.direction;
    const theme = el.getAttribute('data-marker-theme') || defaults.theme;
    const scrollStart = el.getAttribute('data-marker-scroll-start') || defaults.scrollStart;
    const staggerStart = el.getAttribute('data-marker-stagger-start') || defaults.staggerStart;
    const staggerOffset =
      (parseFloat(el.getAttribute('data-marker-stagger')) || defaults.stagger) / 1000;

    const color = resolveColor(theme);
    const dirConfig = directionMap[direction] || directionMap.right;

    el._highlightMarkerReveal = {};

    const split = SplitText.create(el, {
      type: 'lines',
      linesClass: 'highlight-marker-line',
      autoSplit: true,
      onSplit(self) {
        const instance = el._highlightMarkerReveal;

        // Teardown previous build
        instance.timeline?.kill();
        instance.scrollTrigger?.kill();
        el.querySelectorAll('.highlight-marker-bar').forEach((bar) => bar.remove());

        // Build bars and timeline
        const lines = self.lines;
        const tl = gsap.timeline({ paused: true });

        lines.forEach((line, i) => {
          gsap.set(line, { position: 'relative', overflow: 'hidden' });

          const bar = createBar(color, dirConfig.origin);
          line.appendChild(bar);

          const staggerIndex = staggerStart === 'end' ? lines.length - 1 - i : i;

          tl.to(
            bar,
            {
              [dirConfig.prop]: 0,
              duration: defaults.barDuration,
              ease: defaults.barEase,
            },
            staggerIndex * staggerOffset
          );
        });

        // Reveal parent — bars are covering the text
        gsap.set(el, { autoAlpha: 1 });

        // ScrollTrigger
        const st = ScrollTrigger.create({
          trigger: el,
          start: scrollStart,
          once: true,
          onEnter: () => tl.play(),
        });

        instance.timeline = tl;
        instance.scrollTrigger = st;
      },
    });

    el._highlightMarkerReveal.split = split;
  });
}
