$(document).ready(function () {
  gsap.registerPlugin(SplitText, ScrollTrigger, DrawSVGPlugin);

  const tlTemplate = (trigger, start = 'top center') =>
    gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: start,
        once: true,
      },
    });

  function typeText(element, duration = 0.3, delay = 0) {
    const split = new SplitText(element, {
      type: 'chars',
      linesClass: 'split-line',
    });

    if (split.chars.length) {
      gsap.set(split.chars, {
        opacity: 0,
      });

      return gsap.to(split.chars, {
        opacity: 1,
        duration: duration,
        delay: delay,
        stagger: {
          amount: duration,
          ease: 'power2.Inout',
        },
        ease: 'power2.out',
      });
    }
  }

  // Chat
  function revealChatBoxSet(el, labelClass = '.mo-feature_prompt-name') {
    let label = $(el).prev(labelClass);

    gsap.set(el, {
      opacity: 0,
      y: '5rem',
      filter: 'blur(8px)',
    });
    gsap.set(label, {
      x: '1rem',
      opacity: 0,
      filter: 'blur(8px)',
    });
  }

  function revealChatBoxAnim(el, labelClass = '.mo-feature_prompt-name') {
    let label = $(el).prev(labelClass);
    let tl = gsap.timeline();

    tl.to(
      el,
      {
        opacity: 1,
        y: '0rem',
        duration: 0.5,
        ease: 'back.out(1.2)',
        filter: 'blur(0px)',
      },
      0
    );

    tl.add(typeText(el), 0.25);

    tl.to(
      label,
      {
        x: '0rem',
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.5,
      },
      0
    );

    return tl;
  }

  // Thinking
  function revealThinkingSet(el) {
    gsap.set(el, {
      opacity: 0,
      x: '-1rem',
      filter: 'blur(8px)',
    });
  }

  function revealThinkingAnim(el) {
    let meta = $(el).find('[data-anim="thinking-label"]');
    let tl = gsap.timeline();

    tl.to(el, {
      opacity: 1,
      x: '0rem',
      duration: 0.2,
      ease: 'back.out(1.2)',
      filter: 'blur(0px)',
    });

    tl.to(
      meta,
      {
        delay: 0.2,
        yPercent: -100,
      },
      '+=0.4'
    );

    return tl;
  }

  // Item
  function revealItemSet(el) {
    let visual = $(el).find('[data-anim="image"]');

    if (visual.length) {
      gsap.set(visual, {
        opacity: 0,
        filter: 'blur(8px)',
      });
    }

    gsap.set(el, {
      opacity: 0,
      y: '3rem',
      filter: 'blur(8px)',
    });
  }

  function revealItemAnim(el) {
    let text = $(el).find('[data-anim="text"]');
    let visual = $(el).find('[data-anim="image"]');
    let tl = gsap.timeline();

    tl.add(typeText(el), 0.2, 1);
    tl.to(
      el,
      {
        opacity: 1,
        y: '0rem',
        duration: 0.3,
        ease: 'power3.out',
        filter: 'blur(0px)',
      },
      '<'
    );

    if (visual.length) {
      tl.to(visual, {
        opacity: 1,
        duration: 0.3,
        delay: 0.3,
        ease: 'back.out(1.2)',
        filter: 'blur(0px)',
      });
    }

    return tl;
  }

  // Graph
  function revealGraf(el) {
    const $el = $(el);
    const tl = gsap.timeline();

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

    if ($dots.length) {
      gsap.set($dots, { scale: 0, transformOrigin: 'center' });
    }
    if ($maskPaths.length) {
      $maskPaths.each(function () {
        const length = this.getTotalLength();
        const start = this.getPointAtLength(0);
        const end = this.getPointAtLength(length);
        const isRightToLeft = start.x > end.x;

        gsap.set(this, {
          strokeDasharray: length,
          strokeDashoffset: isRightToLeft ? -length : length,
        });
      });
    }
    if ($chart.length) {
      gsap.set($chart, { rotate: 25, autoAlpha: 0 });
    }
    if ($cursor.length) {
      gsap.set($cursor, { autoAlpha: 0 });
    }
    if ($lineH.length) {
      gsap.set($lineH, { y: '10em', autoAlpha: 0 });
    }
    if ($lineV.length) {
      gsap.set($lineV, { x: '10em', autoAlpha: 0 });
    }
    if ($dot.length) {
      gsap.set($dot, { x: '10em', y: '10em' });
    }
    if ($tooltip.length) {
      gsap.set($tooltip, { scale: 0.5, transformOrigin: 'left', autoAlpha: 0 });
    }
    if ($label.length) {
      gsap.set($label, { scale: 0.5, transformOrigin: 'center', autoAlpha: 0 });
    }

    if ($base.length) {
      tl.from($base, {
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power2.out',
      });
    }

    if ($dots.length) {
      const shuffled = gsap.utils.shuffle([...$dots]);
      const staggerDuration = $dots.length > 0 ? 1 / $dots.length : 0.03;

      tl.to(
        shuffled,
        {
          scale: 1,
          duration: 0.15,
          stagger: staggerDuration,
          ease: 'back.out(2)',
        },
        '-=0.2'
      );
    }

    if ($maskPaths.length) {
      tl.to(
        $maskPaths,
        {
          strokeDashoffset: 0,
          duration: 1.5,
          stagger: 0.2,
          ease: 'power2.out',
        },
        '-=0.2'
      );
    }

    if ($chart.length) {
      tl.to(
        $chart,
        {
          rotate: 0,
          autoAlpha: 1,
          duration: 1.5,
          ease: 'power2.out',
        },
        '<'
      );

      const $labels = $chart.find('[id^="label-"]');
      if ($labels.length) {
        gsap.set($labels, { autoAlpha: 0 });
        tl.to(
          $labels,
          {
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.05,
            ease: 'back.out(2)',
          },
          '-=0.1'
        );
      }
    }

    if ($dot.length) {
      tl.to(
        $dot,
        {
          x: '0em',
          y: '0em',
          duration: 0.8,
          ease: 'power2.inOut',
        },
        '-=0.1'
      );
    }

    if ($lineH.length) {
      tl.to(
        $lineH,
        {
          y: '0em',
          autoAlpha: 1,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        '-=0.8'
      );
    }

    if ($lineV.length) {
      tl.to(
        $lineV,
        {
          x: '0em',
          autoAlpha: 1,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        '-=0.8'
      );
    }

    if ($cursor.length) {
      tl.to(
        $cursor,
        {
          autoAlpha: 1,
          duration: 0.3,
          ease: 'power2.out',
        },
        '-=0.2'
      );
    }

    if ($tooltip.length) {
      tl.to(
        $tooltip,
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.03,
          ease: 'back.out(2)',
        },
        '-=0.2'
      );
    }

    if ($label.length) {
      tl.to(
        $label,
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.03,
          ease: 'back.out(2)',
        },
        '-=0.2'
      );
    }

    return tl;
  }

  // Table
  function revealTable(el) {
    let $table = $(el).find('[data-anim="table"]');
    const tl = gsap.timeline();
    let $row = $table.find('[data-anim="table-row"]');

    gsap.set($table, { autoAlpha: 0 });
    gsap.set($row, { xPercent: 30, autoAlpha: 0 });

    tl.to($table, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' });
    tl.to(
      $row,
      { xPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out', stagger: 0.05 },
      '<'
    );

    return tl;
  }

  $('.section_hp-hero').each(function () {
    let trigger = $(this);
    let chatBubble = trigger.find('[data-anim="hero-chat"]')[0];
    let heroThinking = trigger.find('[data-anim="hero-thinking"]');
    let thinking = trigger.find('[data-anim="thinking"]')[0];
    let textEl = trigger.find('[data-anim="text"]');
    let graph = trigger.find('.hp-hero_dashboard-graph');

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: '40 bottom',
        once: true,
      },
    });

    revealChatBoxSet(chatBubble, '.hp-hero_jane-head');
    gsap.set(heroThinking, { opacity: 0 });
    revealThinkingSet(thinking);
    gsap.set(graph, { y: '3rem', opacity: 0 });

    tl.add(revealChatBoxAnim(chatBubble, '.hp-hero_jane-head'))
      .add(revealThinkingAnim(thinking), '<')
      .from('.hp-hero_jane-bottom', {
        opacity: 0,
      })
      .to(heroThinking, { opacity: 1 }, '<')
      .add(typeText(textEl), '<')
      .to(graph, { y: '0rem', opacity: 1, duration: 0.3, ease: 'back.out(1.2)' })
      .add(revealGraf(trigger));
  });

  $('[data-anim-trigger="card-1"]').each(function () {
    let trigger = $(this);
    let chatBubble = trigger.find('[data-anim="chat-bubble"]')[0];
    let visual = trigger.find('[data-anim="visual"]')[0];

    revealChatBoxSet(chatBubble);
    revealItemSet(visual);

    let tl = tlTemplate(trigger);

    tl.add(revealChatBoxAnim(chatBubble))
      .add(revealItemAnim(visual), '+=0.1')
      .add(revealGraf(trigger), '-=0.2');
  });

  $('[data-anim-trigger="card-2"]').each(function () {
    let trigger = $(this);
    let chatBubble = trigger.find('[data-anim="chat-bubble"]')[0];
    let thinking = trigger.find('[data-anim="thinking"]')[0];
    let visual = trigger.find('[data-anim="visual"]')[0];

    revealChatBoxSet(chatBubble);
    revealThinkingSet(thinking);
    revealItemSet(visual);

    let tl = tlTemplate(trigger);

    tl.add(revealChatBoxAnim(chatBubble))
      .add(revealThinkingAnim(thinking), '+=0.1')
      .add(revealItemAnim(visual), '<')
      .add(revealGraf(trigger), '-=0.1');
  });

  $('[data-anim-trigger="card-3"]').each(function () {
    let trigger = $(this);
    let chatBubble = trigger.find('[data-anim="chat-bubble"]')[0];
    let thinking = trigger.find('[data-anim="thinking"]')[0];
    let visual = trigger.find('[data-anim="visual"]')[0];

    revealChatBoxSet(chatBubble);
    revealThinkingSet(thinking);
    revealItemSet(visual);

    let tl = tlTemplate(trigger);

    tl.add(revealChatBoxAnim(chatBubble))
      .add(revealThinkingAnim(thinking), '+=0.1')
      .add(revealItemAnim(visual), '-=0.1')
      .add(revealTable(trigger), '-=0.1');
  });

  $('[data-anim-trigger="card-4"]').each(function () {
    let trigger = $(this);
    let chatBubble = trigger.find('[data-anim="chat-bubble"]')[0];
    let thinking = trigger.find('[data-anim="thinking"]')[0];
    let visual = trigger.find('[data-anim="visual"]')[0];

    revealChatBoxSet(chatBubble);
    revealThinkingSet(thinking);
    revealItemSet(visual);

    let tl = tlTemplate(trigger);

    tl.add(revealChatBoxAnim(chatBubble))
      .add(revealThinkingAnim(thinking), '+=0.1')
      .add(revealItemAnim(visual), '<')
      .add(revealGraf(trigger), '-=0.1');
  });
});

function animateCircles(svg, pulseId) {
  const circle = svg.find(`${pulseId} [id^="circle-path"]`);

  if (circle.length === 0) return null;

  const pathEl = circle[0];
  const pathLength = pathEl.getTotalLength();

  gsap.set(circle, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
    opacity: 1,
  });

  const tl = gsap.timeline();

  tl.to(circle, {
    strokeDashoffset: 0,
    duration: 1,
    ease: 'power2.inOut',
  });

  return tl;
}

function animateFunnelLines(index) {
  const animations = {
    0: {
      pulses: ['#workday', '#lattice', '#culture-amp'],
      lines: [1, 2],
    },
    1: {
      pulses: ['#greenhouse', '#workday', '#lever', '#ashby'],
      lines: [1, 2, 4, 5],
    },
    2: {
      pulses: ['#workday', '#lattice', '#culture-amp'],
      lines: [1, 2],
    },
    3: {
      pulses: ['#workday', '#linkedin'],
      lines: [2, 4],
    },
    4: {
      pulses: ['#workday', '#lattice', '#culture-amp'],
      lines: [1, 2],
    },
    5: {
      pulses: ['#workday', '#lattice', '#culture-amp'],
      lines: [1, 2],
    },
  };

  const config = animations[index];
  if (!config) return;

  $('.hp-funnel_top:visible').each(function () {
    const svg = $(this);

    if (config.pulses && config.pulses.length) {
      config.pulses.forEach((id, i) => {
        const element = svg.find(id);
        if (element.length) {
          setTimeout(() => {
            const circleTl = animateCircles(svg, id);
            if (circleTl) {
              window.activeCircleTimelines.push(circleTl);
            }
          }, i * 300);

          gsap.fromTo(
            element,
            { scale: 1 },
            {
              scale: 1.075,
              transformOrigin: 'center top',
              duration: 0.5,
              yoyo: true,
              repeat: 1,
              ease: 'power2.inOut',
              delay: i * 0.3,
            }
          );
        }
      });
    }

    if (config.lines) {
      const allLines = [
        { line: svg.find('#line-path_1'), dot: svg.find('#line-dot_1') },
        { line: svg.find('#line-path_2'), dot: svg.find('#line-dot_2') },
        { line: svg.find('#line-path_3'), dot: svg.find('#line-dot_3') },
        { line: svg.find('#line-path_4'), dot: svg.find('#line-dot_4') },
        { line: svg.find('#line-path_5'), dot: svg.find('#line-dot_5') },
        { line: svg.find('#line-path_6'), dot: svg.find('#line-dot_6') },
      ];

      const linesToAnimate = config.lines.map((num) => allLines[num - 1]).filter(Boolean);

      linesToAnimate.forEach(({ line, dot }, i) => {
        const randomDelay = i * 0.3;

        gsap.set(dot, { opacity: 0 });

        const tl = gsap.timeline({ delay: randomDelay });

        tl.to(dot, {
          opacity: 1,
          duration: 0.3,
        })
          .to(
            dot,
            {
              motionPath: {
                path: line[0],
                align: line[0],
                alignOrigin: [0.5, 0.5],
              },
              duration: 1.8,
              ease: 'power2.inOut',
            },
            '<'
          )
          .to(dot, {
            opacity: 0,
            duration: 0.3,
          });
      });
    }
  });
}

const swiper = new Swiper('.hp-funnel_prompts', {
  slidesPerView: 'auto',
  direction: 'vertical',
  speed: 1500,
  autoplay: {
    duration: 3000,
    disableOnInteraction: false,
  },
  loop: true,
  on: {
    slideChange: function () {
      $(this.slides).removeClass('is-before-active');

      $(this.slides).each((index, slide) => {
        if (index < this.activeIndex) {
          $(slide).addClass('is-before-active');
        }
      });
    },
    slideChangeTransitionStart: function () {
      if (window.activeCircleTimelines) {
        window.activeCircleTimelines.forEach((tl) => {
          if (tl) {
            const circle = tl.getChildren()[0].targets()[0];
            gsap.to(circle, {
              opacity: 0,
              duration: 0.3,
              onComplete: () => {
                tl.kill();
              },
            });
          }
        });
      }

      window.activeCircleTimelines = [];
    },
    slideChangeTransitionEnd: function () {
      animateFunnelLines(this.realIndex);
    },
  },
});
