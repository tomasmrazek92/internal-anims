gsap.registerPlugin(Flip, ScrollTrigger);
gsap.defaults({});

// ---- Elements
// Load
let navSpacer = $('.nav-spacer');
let spacerTop = $('.nav-spacer_top');
let brand = navSpacer.find('.nav-spacer_logo-box');
let wrap = navSpacer.find('.nav-spacer_logo-wrap');
let mask = navSpacer.find('.nav-spacer_logo-mask');
let logo = navSpacer.find('.nav-spacer_logo');
let navLogo = $('.navbar1_logo-link');
let navWrap = $('.navbar1_logo-wrap');
let navActions = $('.navbar1_actions');

let navbar = $('.navbar1_component');
let mainWrapper = $('.main-wrapper');

// --- Vars
let defaultEase = 'power1.inOut';

// ---- Initial initSet
const initSet = () => {
  let tl = gsap.timeline();
  tl.set(mainWrapper, {
    height: '100svh',
  });
  tl.set(navSpacer, {
    css: {
      width: '100vw',
      height: '100svh',
    },
  });
  tl.set(brand, { width: '100%' });
  tl.set(wrap, { width: '90vw' });
  tl.set(mask, { width: '21%' });
  tl.set(logo, { width: '90vw' });
  tl.to(mainWrapper, { opacity: 1, ease: defaultEase, duration: 1 }, '+=1');
  tl.to(mask, { width: 'auto', ease: 'power3.out', duration: 2 }, '+=0.5');
  return tl;
};
const clearPros = (el) => {
  gsap.set($(el), { clearProps: 'all' });
};

// ---- Main Load TL
let mainLoad = gsap.timeline();

function runAnimation() {
  const width = window.innerWidth;
  if (mainLoad) {
    mainLoad.kill();
  }
  mainLoad = gsap.timeline();
  mainLoad.add(initSet());
  // Desktop Version with Scroll
  if (width > 991) {
    mainLoad.to(
      navSpacer,
      {
        height: 'auto',
        marginBottom: '2.4em',
        marginTop: '10.4em', // 8em of navbar + 2.4em from bottom of the logo
        ease: defaultEase,
        duration: 1.5,
      },
      '=+0.25'
    );
    mainLoad.to(navActions, { opacity: 1, ease: 'power3.out', duration: 1 }, '<');
    mainLoad.set(navLogo, { translateY: '10.4em' });
    mainLoad.set(navWrap, {
      css: { width: gsap.getProperty(logo[0], 'width'), height: 'auto', opacity: 1 },
    });
    mainLoad.then(initScroll);
  }
  // Mobile Version without Scroll
  else {
    mainLoad.set([navWrap, navbar, navActions], { opacity: 1 });
    mainLoad.to(navSpacer, {
      css: {
        width: 'auto',
        height: gsap.getProperty(navbar[0], 'height'),
        opacity: 1,
      },
      ease: defaultEase,
    });
    mainLoad.to(
      wrap,
      {
        width: gsap.getProperty(navLogo[0], 'width'),
        ease: defaultEase,
      },
      '<'
    );
    mainLoad.to(
      logo,
      {
        width: gsap.getProperty(navLogo[0], 'width'),
        ease: defaultEase,
      },
      '<'
    );
  }
  mainLoad.to(navSpacer, { opacity: 0 });
  mainLoad.to(mainWrapper, { height: 'auto', ease: 'power3.out', duration: 0.1 });
}
runAnimation();

function initScroll() {
  let tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: $('body'),
      start: 'top top',
      endTrigger: navSpacer.next(),
      end: `top ${gsap.getProperty(navbar[0], 'height')}`,
      scrub: 0.5,
      ease: 'linear',
    },
  });

  tl1.to(navLogo, { translateY: '2.4em' });
  tl1.to(
    navWrap,
    {
      css: {
        width: gsap.getProperty(navLogo[0], 'width'),
        opacity: 1,
      },
    },
    '<'
  );

  /* Nav Fixed */
  let tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: navSpacer.next(),
      start: `top ${gsap.getProperty(navbar[0], 'height')}`,
      onEnter: () => {
        gsap.set(navbar, {
          position: 'absolute',
          top: () => {
            return $('.section_ticker').offset().top - gsap.getProperty(navbar[0], 'height');
          },
        });
      },
      onLeave: () => {
        navbar.addClass('animate');
      },
      onLeaveBack: () => {
        navbar.removeClass('animate');
        clearPros(navbar);
      },
    },
  });

  function getMaxWidthForBreakpoint() {
    const width = window.innerWidth;
    if (width > 767) {
      return '15rem';
    }
    if (width > 479) {
      return '13rem';
    }

    if (width > 0) {
      return '10rem';
    }
    return '17rem';
  }
}
// ---- Resize Logic
let resizeTimer;
var previousWidth = window.innerWidth;

window.addEventListener('resize', function () {
  var currentWidth = window.innerWidth;
  if (currentWidth !== previousWidth) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      window.location.reload();
    }, 300);
  }
  previousWidth = currentWidth; // Update the previous width for the next resize event
});

// ---- Nav Scroll Logic
let lastScroll = 0;

$(window).scroll(function () {
  const currentScroll = $(this).scrollTop();
  if (navbar.hasClass('animate')) {
    if (currentScroll > lastScroll) {
      navbar.css({ position: 'fixed', top: 0, transform: 'translateY(-100%)' });
      gsap.to(navbar, {
        duration: 0.5,
        y: '-100%',
      });
    } else {
      gsap.to(navbar, {
        duration: 0.5,
        y: '0%',
      });
    }
  }
  lastScroll = currentScroll;
});
