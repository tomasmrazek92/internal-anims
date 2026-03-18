export function initGraphsAnimation() {
  // ─── Utilities ─────────────────────────────────────────────────────────────

  const tlTemplate = (trigger, start = 'top center') =>
    gsap.timeline({
      scrollTrigger: { trigger, start, once: true },
    });

  function typeText(element, duration = 1, delay = 0) {
    const split = new SplitText(element, { type: 'chars', linesClass: 'split-line' });
    if (!split.chars.length) return;
    gsap.set(split.chars, { visibility: 'hidden' });
    return gsap.to(split.chars, {
      visibility: 'visible',
      duration,
      delay,
      stagger: { amount: duration, ease: 'power2.Inout' },
      ease: 'power2.out',
    });
  }

  // ─── Components ────────────────────────────────────────────────────────────
  //
  // Each function: sets initial state immediately, returns a GSAP timeline.
  // Add to a parent timeline with: tl.add(revealXxx(el))
  //
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Background dot grid — staggered reveal, then per-dot CSS shimmer.
   *
   * Attrs:
   *   dots   circle[data-op]   each dot; data-op="0.4" sets its resting opacity
   *
   * CSS vars set on each dot after reveal (target with .revealed in CSS):
   *   --base-op       resting opacity (mirrors data-op)
   *   --shimmer-dur   random 5–6.6s cycle
   *   --shimmer-delay 0s (stagger is handled by JS reveal timing)
   *
   * Config:
   *   selector     — element query (default: 'circle[data-op]')
   *   staggerTotal — total seconds spread across all dots (default: 1)
   *   startDelay   — delay before first dot appears (default: 0.2)
   *   revealDur    — per-dot fade duration (default: 0.2)
   */
  function revealDotGrid({
    selector = 'circle[data-op]',
    staggerTotal = 1,
    startDelay = 0.2,
    revealDur = 0.2,
    container = null,
  } = {}) {
    const scope = container || document;

    // ── Chart chrome ─────────────────────────────────────────────────────────
    const grid = scope.querySelector('[data-chart="grid"]');
    const labelsY = scope.querySelectorAll('[data-chart="labels-y"] text');
    const labelsX = scope.querySelectorAll('[data-chart="labels-x"] text');
    const titles = scope.querySelectorAll('[data-chart="titles"] text');

    if (grid) gsap.set(grid, { autoAlpha: 0 });
    if (labelsY.length) gsap.set(labelsY, { autoAlpha: 0, x: -6 });
    if (labelsX.length) gsap.set(labelsX, { autoAlpha: 0, y: 6 });
    if (titles.length) gsap.set(titles, { autoAlpha: 0 });

    const tl = gsap.timeline({ delay: startDelay });

    if (grid) {
      tl.to(grid, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0);
    }
    if (labelsY.length) {
      tl.to(labelsY, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, 0.1);
    }
    if (labelsX.length) {
      tl.to(labelsX, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, 0.1);
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Dots ─────────────────────────────────────────────────────────────────
    const dots = gsap.utils.shuffle(Array.from(scope.querySelectorAll(selector)));
    const lastIdx = dots.length - 1;

    gsap.set(dots, { opacity: 0 });

    dots.forEach((dot, i) => {
      const baseOp = parseFloat(dot.getAttribute('data-op'));
      const delay = startDelay + 0.3 + (i / lastIdx) * staggerTotal;

      gsap.to(dot, {
        opacity: baseOp,
        duration: revealDur,
        delay,
        ease: 'power2.out',
        onComplete() {
          dot.style.setProperty('--base-op', baseOp);
          dot.style.setProperty('--shimmer-dur', (5 + Math.random() * 1.6).toFixed(2) + 's');
          dot.style.setProperty('--shimmer-delay', '0s');
          dot.classList.add('revealed');
        },
      });
    });

    if (titles.length) {
      tl.to(
        titles,
        { autoAlpha: 1, duration: 0.4, ease: 'power2.out' },
        startDelay + 0.3 + staggerTotal
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    if (container) {
      new IntersectionObserver(([entry]) => {
        const state = entry.isIntersecting ? 'running' : 'paused';
        scope.querySelectorAll(`${selector}.revealed`).forEach((dot) => {
          dot.style.animationPlayState = state;
        });
      }).observe(container);
    }
  }

  /**
   * Chat bubble(s) with optional label.
   * Pass a single el or an array — multiple els play in sequence with overlap.
   *
   * Attrs:
   *   el            data-anim="chat-bubble"   the bubble wrapper
   *   label         prev sibling matching labelSelector (default: data-anim="chat-label")
   *
   * Options:
   *   labelSelector  selector for the prev-sibling label (default: '[data-anim="chat-label"]')
   *   overlap        seconds each bubble overlaps the previous one (default: 0.15)
   */
  function revealChatBox(el, { labelSelector = '[data-anim="chat-label"]', overlap = 0.3 } = {}) {
    const els = $(el).toArray();
    const tl = gsap.timeline();

    els.forEach((item, i) => {
      const $label = $(item).prev(labelSelector);

      gsap.set(item, { opacity: 0, y: '5rem', filter: 'blur(8px)' });
      if ($label.length) gsap.set($label, { x: '1rem', opacity: 0, filter: 'blur(8px)' });

      // Full animation for this bubble as its own sub-timeline
      const sub = gsap.timeline();
      sub.to(
        item,
        { opacity: 1, y: '0rem', duration: 0.5, ease: 'back.out(1.2)', filter: 'blur(0px)' },
        0
      );
      sub.add(typeText(item), 0.25);
      if ($label.length) {
        sub.to($label, { x: '0rem', opacity: 1, filter: 'blur(0px)', duration: 0.5 }, 0);
      }

      tl.add(sub, i === 0 ? 0 : `-=${overlap}`);
    });

    return tl;
  }

  /**
   * Thinking indicator — slides in, then meta label scrolls out.
   *
   * Attrs:
   *   el     data-anim="thinking"        the thinking wrapper
   *   meta   data-anim="thinking-label"  child label that slides away (optional)
   */
  function revealThinking(el) {
    const $meta = $(el).find('[data-anim="thinking-label"]');

    gsap.set(el, { opacity: 0, x: '-1rem', filter: 'blur(8px)' });

    const tl = gsap.timeline();
    tl.to(el, { opacity: 1, x: '0rem', duration: 0.2, ease: 'back.out(1.2)', filter: 'blur(0px)' });
    if ($meta.length) {
      tl.to($meta, { delay: 0.2, yPercent: -100 }, '+=0.4');
    }

    return tl;
  }

  /**
   * Card item — fades/slides in, optionally reveals an inner image.
   *
   * Attrs:
   *   el      data-anim="visual"   the item wrapper
   *   image   data-anim="image"    inner visual/image (optional)
   *   text    data-anim="text"     inner text for typeText (optional)
   */
  function revealItem(el) {
    const $image = $(el).find('[data-anim="image"]');

    gsap.set(el, { opacity: 0, y: '3rem', filter: 'blur(8px)' });
    if ($image.length) gsap.set($image, { opacity: 0, filter: 'blur(8px)' });

    const tl = gsap.timeline();
    tl.add(typeText(el), 0.2);
    tl.to(
      el,
      { opacity: 1, y: '0rem', duration: 0.3, ease: 'power3.out', filter: 'blur(0px)' },
      '<'
    );
    if ($image.length) {
      tl.to($image, {
        opacity: 1,
        duration: 0.3,
        delay: 0.3,
        ease: 'back.out(1.2)',
        filter: 'blur(0px)',
      });
    }

    return tl;
  }

  /**
   * Graph / chart complex animation.
   *
   * Attrs (all children of el):
   *   el             the graph wrapper (passed directly)
   *   graph-base     data-anim="graph-base"    background/base layer
   *   dots           data-anim="dots"          → child path/circle elements
   *   graph-mask     data-anim="graph-mask"    → child path elements (DrawSVG stroke)
   *   graph-table    data-anim="graph-table"
   *   chart          data-anim="chart"         pie/donut chart; looks for child [id^="label-"]
   *   cursor         data-anim="cursor"
   *   dot            data-anim="dot"
   *   line-h         data-anim="line-h"        horizontal crosshair line
   *   line-v         data-anim="line-v"        vertical crosshair line
   *   tooltip        data-anim="tooltip"
   *   label          data-anim="label"
   */
  function revealGraf(el) {
    const $el = $(el);
    const tl = gsap.timeline();
    console.log(el);

    const $base = $el.find('[data-anim="graph-base"]');
    const $dots = $el.find('[data-anim="dots"]').find('path, circle');
    const $mask = $el.find('[data-anim="graph-mask"]');
    const $chart = $el.find('[data-anim="chart"]');
    const $maskPaths = $mask.find('path');
    const $cursor = $el.find('[data-anim="cursor"]');
    const $dot = $el.find('[data-anim="dot"]');
    const $lineH = $el.find('[data-anim="line-h"]');
    const $lineV = $el.find('[data-anim="line-v"]');
    const $tooltip = $el.find('[data-anim="tooltip"]');
    const $label = $el.find('[data-anim="label"]');
    const $graphTable = $el.find('[data-anim="graph-table"]');

    if ($dots.length) gsap.set($dots, { scale: 0, transformOrigin: 'center' });
    if ($chart.length) gsap.set($chart, { rotate: 25, autoAlpha: 0 });
    if ($cursor.length) gsap.set($cursor, { autoAlpha: 0 });
    if ($lineH.length) gsap.set($lineH, { y: '10em', autoAlpha: 0 });
    if ($lineV.length) gsap.set($lineV, { x: '10em', autoAlpha: 0 });
    if ($dot.length) gsap.set($dot, { x: '10em', y: '10em' });
    if ($tooltip.length) gsap.set($tooltip, { scale: 0.5, transformOrigin: 'left', autoAlpha: 0 });
    if ($label.length) gsap.set($label, { scale: 0.5, transformOrigin: 'center', autoAlpha: 0 });

    if ($maskPaths.length) {
      $maskPaths.each(function () {
        const length = this.getTotalLength();
        const isRightToLeft = this.getPointAtLength(0).x > this.getPointAtLength(length).x;
        gsap.set(this, {
          strokeDasharray: length,
          strokeDashoffset: isRightToLeft ? -length : length,
        });
      });
    }

    if ($base.length) {
      tl.from($base, { autoAlpha: 0, duration: 0.6, ease: 'power2.out' });
    }

    if ($dots.length) {
      const shuffled = gsap.utils.shuffle([...$dots]);
      tl.to(
        shuffled,
        {
          scale: 1,
          duration: 0.15,
          stagger: $dots.length > 0 ? 1 / $dots.length : 0.03,
          ease: 'back.out(2)',
        },
        '-=0.2'
      );
    }

    if ($maskPaths.length) {
      tl.to(
        $maskPaths,
        { strokeDashoffset: 0, duration: 1.5, stagger: 0.2, ease: 'power2.out' },
        '-=0.2'
      );
    }

    if ($chart.length) {
      tl.to($chart, { rotate: 0, autoAlpha: 1, duration: 1.5, ease: 'power2.out' }, '<');

      const $chartLabels = $chart.find('[id^="label-"]');
      if ($chartLabels.length) {
        gsap.set($chartLabels, { autoAlpha: 0 });
        tl.to(
          $chartLabels,
          { autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: 'back.out(2)' },
          '-=0.1'
        );
      }
    }

    if ($graphTable.length) {
      tl.from($graphTable.find('#labels path, #head path'), {
        y: '1em',
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.inOut',
      }).from(
        $graphTable.find('#table [id^="item"]'),
        {
          y: '1em',
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.01,
          ease: 'power2.inOut',
        },
        '<0.2'
      );
    }

    if ($dot.length)
      tl.to($dot, { x: '0em', y: '0em', duration: 0.8, ease: 'power2.inOut' }, '-=0.1');
    if ($lineH.length)
      tl.to($lineH, { y: '0em', autoAlpha: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.8');
    if ($lineV.length)
      tl.to($lineV, { x: '0em', autoAlpha: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.8');
    if ($cursor.length)
      tl.to($cursor, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, '-=0.2');
    if ($tooltip.length)
      tl.to(
        $tooltip,
        { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.03, ease: 'back.out(2)' },
        '-=0.2'
      );
    if ($label.length)
      tl.to(
        $label,
        { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.03, ease: 'back.out(2)' },
        '-=0.2'
      );

    return tl;
  }

  /**
   * Table reveal — table fades in, rows slide in from the right.
   *
   * Attrs (children of el):
   *   table      data-anim="table"       the table element
   *   table-row  data-anim="table-row"   individual rows
   */
  function revealTable(el) {
    const $table = $(el).find('[data-anim="table"]');
    const $rows = $table.find('[data-anim="table-row"]');
    const tl = gsap.timeline();

    gsap.set($table, { autoAlpha: 0 });
    gsap.set($rows, { xPercent: 30, autoAlpha: 0 });

    tl.to($table, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' });
    tl.to(
      $rows,
      { xPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out', stagger: 0.05 },
      '<'
    );

    return tl;
  }

  /**
   * Bar chart base SVG reveal — grid, axis labels (path-rendered), legend.
   * Targets the SVG inside [data-anim="graph-base"] using IDs present in the markup.
   *
   * Sequence:
   *   0.0s  grid lines fade in
   *   0.1s  Y-axis label paths stagger in from left
   *   0.1s  X-axis label paths stagger in from below
   *   0.4s  legend groups fade + slide in
   */
  function revealBarChartBase(el) {
    const base = $(el).find('[data-anim="graph-base"]')[0];
    if (!base) return gsap.timeline();

    const grid = base.querySelector('#grid');
    const labelsY = base.querySelectorAll('#stats-vertical path');
    const labelsX = base.querySelectorAll('#stats-horizontal path');
    const legend = base.querySelectorAll('#legend > g');

    if (grid) gsap.set(grid, { autoAlpha: 0 });
    if (labelsY.length) gsap.set(labelsY, { autoAlpha: 0, x: -8 });
    if (labelsX.length) gsap.set(labelsX, { autoAlpha: 0, y: 8 });
    if (legend.length) gsap.set(legend, { autoAlpha: 0, y: 6 });

    const tl = gsap.timeline();

    if (grid) tl.to(grid, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0);
    if (labelsY.length)
      tl.to(labelsY, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' }, 0.1);
    if (labelsX.length)
      tl.to(labelsX, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' }, 0.1);
    if (legend.length)
      tl.to(legend, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, 0.4);

    return tl;
  }

  /**
   * Platform illustration reveal — staggered reveal of all child SVG elements.
   *
   * Sequence:
   *   1. Base boxes (integration logos) stagger up from below
   *   2. Human connector fades in
   *   3. Service boxes stagger up
   *   4. Options panel slides in from left
   *   5. Agent boxes stagger up
   *   6. Logo pops in
   *   7. Query box slides up last
   *
   * Attrs:
   *   el   data-anim="platform"   the .platform-illustrations_base wrapper
   */
  function revealPlatformIllustration(el) {
    const $el = $(el);
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const logo = $el.find('.platform-illustration_logo')[0];
    const agentBoxes = $el.find('.platform-illustration_agent-box').toArray();
    const options = $el.find('.platform-illustrations_options')[0];
    const serviceBoxes = $el.find('.platform-illustration_service-box').toArray();
    const human = $el.find('.platform-illustrations_human')[0];
    const baseBoxes = $el.find('.platform-illustrations_base-box').toArray();
    const queryBox = $el.find('.platform-illustration_query-box')[0];

    // ── Initial hidden state ──────────────────────────────────────────────────
    gsap.set([logo, options, human, queryBox].filter(Boolean), { autoAlpha: 0, y: 20 });
    gsap.set(agentBoxes, { autoAlpha: 0, y: 24 });
    gsap.set(serviceBoxes, { autoAlpha: 0, y: 20 });
    gsap.set(baseBoxes, { autoAlpha: 0, y: 16 });
    // ─────────────────────────────────────────────────────────────────────────

    // 1. Base integration boxes — stagger up as the foundation layer
    if (baseBoxes.length) {
      tl.to(
        baseBoxes,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          stagger: { amount: 0.5, from: 'random' },
        },
        0
      );
    }

    // 2. Human connector
    if (human) {
      tl.to(human, { autoAlpha: 1, y: 0, duration: 0.35 }, '<');
    }

    // 3. Service boxes
    if (serviceBoxes.length) {
      tl.to(
        serviceBoxes,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.08,
        },
        '<'
      );
    }

    // 4. Options panel — slides in from slightly left
    if (options) {
      gsap.set(options, { x: -12 });
      tl.to(options, { autoAlpha: 1, x: 0, y: 0, duration: 0.35 }, '<');
    }

    // 5. Agent boxes — the styled/branded boxes
    if (agentBoxes.length) {
      tl.to(
        agentBoxes,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'back.out(1.4)',
        },
        '<'
      );
    }

    // 6. Logo — the focal point, pops in with a little scale bounce
    if (logo) {
      gsap.set(logo, { scale: 0.9 });
      tl.to(
        logo,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: 'back.out(1.7)',
        },
        '<'
      );
    }

    // 7. Query box — the interactive UI, last to appear
    if (queryBox) {
      tl.to(queryBox, { autoAlpha: 1, y: 0, duration: 0.4 }, '');
    }

    return tl;
  }

  // ─── Page Sequences ────────────────────────────────────────────────────────

  $('.hero-graph').each(function () {
    const trigger = $(this);
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');

    setTimeout(() => revealDotGrid({ container: this }), 500);

    gsap
      .timeline({
        scrollTrigger: { trigger, start: '40 bottom', once: true },
      })
      .add(revealChatBox(chatBubble));
  });

  $('.natural-language').each(function () {
    const trigger = $(this);
    const chart = trigger;
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');

    gsap
      .timeline({
        scrollTrigger: { trigger, start: 'top 80%', once: true },
      })
      .add(revealChatBox(chatBubble), 0)
      .add(revealBarChartBase(this), '<1')
      .add(revealGraf(chart), '<');
  });

  $('[data-anim="deep-research"]').each(function () {
    const trigger = $(this);
    const chart = trigger.find('.deep-research_box');
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');

    gsap
      .timeline({
        scrollTrigger: { trigger, start: 'top 80%', once: true },
      })
      .add(revealChatBox(chatBubble))
      .add(revealGraf(chart), '<1');
  });

  $('[data-anim="platform"]').each(function () {
    gsap
      .timeline({
        delay: 1,
        scrollTrigger: { trigger: this, start: 'top bottom', once: true },
        onComplete: () => window.dispatchEvent(new Event('platform-illustration-complete')),
      })
      .add(revealPlatformIllustration(this));

    // Agent box card fan hover
    const $allBoxes = $(this).find('.platform-illustration_agent-box');
    let activeBox = null;

    $allBoxes.each(function () {
      const $box = $(this);

      $box.on('mouseenter', function () {
        activeBox = this;
        const $prev = $box.prevAll('.platform-illustration_agent-box');
        const $next = $box.nextAll('.platform-illustration_agent-box');

        gsap.killTweensOf($allBoxes.toArray());
        $allBoxes.each(function () { gsap.set(this, { zIndex: 'auto' }); });
        gsap.set(this, { zIndex: 10 });

        gsap.to(this, { rotation: -4, y: -14, scale: 1.03, duration: 0.3, ease: 'power2.out' });
        gsap.to($prev.toArray(), { x: 18, y: 0, rotation: 0, scale: 1, duration: 0.3, ease: 'power2.out', stagger: 0.04 });
        gsap.to($next.toArray(), { x: -18, y: 0, rotation: 0, scale: 1, duration: 0.3, ease: 'power2.out', stagger: 0.04 });
      });

      $box.on('mouseleave', function () {
        if (activeBox !== this) return;
        activeBox = null;

        gsap.killTweensOf($allBoxes.toArray());
        gsap.to($allBoxes.toArray(), {
          x: 0, rotation: 0, y: 0, scale: 1,
          duration: 0.4, ease: 'power2.inOut',
          onComplete: () => $allBoxes.each(function () { gsap.set(this, { zIndex: 'auto' }); }),
        });
      });
    });
  });
}
