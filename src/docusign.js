let lenis;
$(document).ready(() => {
  // #region Lenis scroll
  if (Webflow.env('editor') === undefined) {
    lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.7,
      gestureOrientation: 'vertical',
      normalizeWheel: false,
      smoothTouch: false,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
  // #endregion

  // #region GSAP Animations
  gsap.defaults({ ease: Power1.easeInOut });

  let els = {
    title: $('.hp-tile_title'),
    textLines: $('.hp-marquee_line'),
    tile: $('.hp-docs_tile'),
    tileBG: $('.hp-docs_tile-bg'),
    tileBGFinish: $('.hp-docs_tile-bg-finish'),
    endTitles: [$('.hp-docs_end-par-1'), $('.hp-docs_end-par-2')],
  };

  // Intro Text
  const introText = () => {
    let tl = gsap.timeline({
      scrollTrigger: {
        endTrigger: $('.hp-tile_floater'),
        end: 'top top',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.fromTo(els.title, { minHeight: '40%' }, { minHeight: '100%' });

    return tl;
  };
  // Marquee Fonts
  const marqueeText = () => {
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: $('.hp-marquee_container'),
        start: 'top bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    // Row Text
    $('.hp-marquee_row').each(function (index) {
      let direction;
      if (index % 2 === 0) {
        // Code for even index (do A)
        direction = '100%';
      } else {
        // Code for odd index (do B)
        direction = '-100%';
      }

      tl.fromTo($(this).find(els.textLines), { x: 0 }, { x: direction }, '<');
    });
  };

  // Tile Size
  const tileSize = () => {
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: $('.hp-marquee_container'),
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    // Intro text
    tl.to(els.title, { opacity: 0 });
    // Tile
    tl.to(els.tile, { width: '74%' }, {});
    tl.to(els.tileBG, { backgroundColor: '#B799FF' });
  };

  // Tile full
  const tileFull = () => {
    let arrow = $('.hp-docs_arrow');
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: $('.hp-tile_invisible'),
        start: 'top bottom',
        end: 'top top',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          $('.stage-1').trigger('click');
          if (!arrow.hasClass('animated')) {
            arrow.fadeIn();
          }
        },
        onLeave: () => {
          $('.hp-docs_arrow').fadeOut(() => {
            $('.hp-docs_arrow').hide(() => {
              arrow.addClass('animated');
            });
          });
        },
        onLeaveBack: () => {
          $('.stage-0').trigger('click');
          $('.hp-docs_arrow').fadeOut();
        },
        invalidateOnRefresh: true,
      },
    });
    tl.fromTo(
      els.tileBG,
      { css: { width: '100%', height: '100%', borderRadius: '1rem' } },
      { css: { width: '100vw', height: '100vh', borderRadius: '0rem' } },
      '<'
    );
    tl.to(els.tileBGFinish, { opacity: 1 }, '<');
    $(els.endTitles).each(function () {
      tl.fromTo(
        $(this).find('span'),
        { yPercent: 30, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: { each: 0.1 } },
        '<+=0.6'
      );
    });
  };

  // Initialize the main timeline
  introText();
  marqueeText();
  tileSize();
  tileFull();

  // Heading Reveal
  let split = new SplitType('.split-lines-1', {
    types: 'words',
  });

  const tl = gsap
    .timeline({
      scrollTrigger: {
        trigger: '.split-lines-1',
        start: 'bottom bottom',
        end: 'top center',
        scrub: 1,
      },
    })
    .to(
      split.words,
      {
        opacity: 1,
        stagger: 0.1,
      },
      0.1
    );

  // #endregion

  // #region Swiper
  var swiper = Swiper;
  var init = false;

  /* Which media query */
  function swiperMode() {
    let mobile = window.matchMedia('(min-width: 0px) and (max-width: 767px)');
    let desktop = window.matchMedia('(min-width: 768px)');

    if (mobile.matches) {
      if (init) {
        swiper.destroy(true, true);
        init = false;
      }
    } else if (desktop.matches) {
      if (!init) {
        init = true;
        swiper = new Swiper('.results-swiper', {
          navigation: {
            nextEl: '[swiper-arrow="next"]',
            prevEl: '[swiper-arrow="prev"]',
          },
          pagination: {
            el: '.hp-improve_line',
            type: 'progressbar',
          },
          breakpoints: {
            0: {
              slidesPerView: 'auto',
              spaceBetween: 24,
            },
            992: {
              slidesPerView: 2,
              spaceBetween: 32,
            },
          },
        });
      }
    }
  }

  // Resize
  window.addEventListener('resize', function () {
    swiperMode();
  });

  // #endregion

  // #region GatedContent
  window.addEventListener('gcdcGateReady', function (event) {
    var gateInstance = event.detail;

    // Take some action herea
    setTimeout(() => {
      lenis.resize();
    }, 500);
  });

  (function (g, a, t, e, d, c, o) {
    if (!g[d]) {
      g.GatedContentObject = d;
      g[d] =
        g[d] ||
        function () {
          (g[d].q = g[d].q || []).push(arguments);
        };
      // eslint-disable-next-line prefer-destructuring
      (c = a.createElement(t)), (o = a.getElementsByTagName(t)[0]);
      c.async = 1;
      c.src = e;
      o.parentNode.insertBefore(c, o);
    }
  })(window, document, 'script', 'https://app.gatedcontent.com/scripts/63536885/app.js', 'gcdc');
  gcdc('loadGates');
  // #endregion

  // #region Form Code
  // Init Swiper
  swiperMode();

  // Init Calc
  DocusignCalculator.initialize({
    scrollInto: (t, o) => lenis.scrollTo(t, o),
    renderTarget: document.getElementById('madlib-form'),
    targetResultCardsContainerSelector: '.swiper-wrapper',
    // when user clicks update, or starts updating
    onFormIsUpdating: () => {
      setTimeout(() => {
        lenis.resize();
      }, 1500);
    },
    onToggleResultVisibility: () => {
      lenis.resize();
    },
    onResultCardsUpdate: () => {
      setTimeout(() => {
        swiper.update();
      }, 350);
    },
    onCalculateAnimationStart: () => {
      $('.ui-calc-loader').fadeIn('500', () => {
        let lottie = $('.ui-calc-loader-start');

        setTimeout(() => {
          lottie.trigger('click');
          lenis.resize();
        }, 100);
      });
      setTimeout(() => {
        $('.ui-calc-loader').fadeOut('500');
      }, 2250);
    },
  });
  // #endregion
});

// #region Button Clicks
// anchor to form
$('[data-button="form"]').on('click', function () {
  let overlay = $('.ui-calc-loader');
  // Fade In
  overlay.fadeIn(200, () => {
    // Scroll to form
    lenis.scrollTo(document.querySelector('.section_hp-madlib'), { immediate: true });
    // Reveal after 1s
    setTimeout(() => {
      overlay.fadeOut(300);
    }, 400);
  });
});

// cookie butto
$('.footer_privacy').on('click', function () {
  OneTrust.ToggleInfoDisplay();
});
// #endregion
