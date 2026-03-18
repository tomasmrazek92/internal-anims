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

let mainWrapper = $('.main-wrapper');

// ---- Init States
const state = Flip.getState('.navbar1_logo-link');

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
      zIndex: 9999,
    },
  });
  tl.set(brand, { width: '100%' });
  tl.set(wrap, { width: '90vw' });
  tl.set(mask, { width: '21%' });
  tl.set(logo, { width: '90vw' });
  tl.to(mainWrapper, { opacity: 1 }, '+=1');
  tl.to(mask, { width: 'auto' }, '+=1');
  return tl;
};
const clearPros = (el) => {
  $(el).attr('style', '');
};

// ---- Main Load TL
let mainLoad = gsap.timeline();

function runAnimation() {
  if (mainLoad) {
    mainLoad.kill();
  }
  mainLoad = gsap.timeline();
  mainLoad.add(initSet());
  mainLoad.to(navSpacer, { height: 'auto', marginBottom: '2.4em', marginTop: '8em' });
  mainLoad.set(navLogo, { translateY: '8em' });
  mainLoad.set(navWrap, {
    css: { width: '90vw', height: 'auto', opacity: 1 },
  });
  mainLoad.set(navSpacer, { opacity: 0 });
  mainLoad.to(mainWrapper, { height: 'auto' });
  mainLoad.to('.navbar1_actions', { opacity: 1 }, '<');
  mainLoad.then(initScroll);
}
runAnimation();

function initScroll() {
  let tl1 = gsap.timeline({
    scrollTrigger: {
      target: $('body'),
      start: 'top top',
      endTrigger: navSpacer.next(),
      end: `top ${gsap.getProperty('.navbar1_component', 'height')}`,
      scrub: 1,
      ease: 'linear',
    },
  });

  tl1.to(navLogo, { translateY: '2.4em' });
  tl1.to(
    navWrap,
    {
      css: {
        width: getMaxWidthForBreakpoint(),
        opacity: 1,
      },
    },
    '<'
  );

  let tl2 = gsap.timeline({
    scrollTrigger: {
      target: navSpacer,
      start: `bottom ${gsap.getProperty('.navbar1_component', 'height')}`,
      end: `bottom top`,
      scrub: 0,
      ease: 'linear',
      markers: true,
    },
  });
  tl2.to($('.navbar1_component'), {
    translateY: '-100%',
  });

  function getMaxWidthForBreakpoint() {
    const width = window.innerWidth;
    if (width > 767) {
      return '15rem'; // Adjust to your needs
    }
    if (width > 479) {
      return '13rem'; // Adjust to your needs
    }

    if (width > 0) {
      return '10rem'; // Adjust to your needs
    }
    return '17rem'; // Default for desktop
  }
}

function initNavScroll() {
  let tl = gsap.timeline({
    scrollTrigger: {
      target: navSpacer,
      start: `bottom ${gsap.getProperty('.navbar1_component', 'height')}`,
      endTrigger: navSpacer.next(),
      end: `bottom top`,
      scrub: 0,
      ease: 'linear',
      markers: true,
    },
  });
  tl.to($('.navbar1_component'), {
    translateY: '-100%',
  });
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
