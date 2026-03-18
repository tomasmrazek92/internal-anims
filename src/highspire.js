// Register GSAP
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({
  ease: 'power4.inOut',
});
$(document).ready(function () {
  let sidebarBox = $('.cta_bar');
  let sidebar = $('.cta_bar-box');
  let sideSpacer = $('.nav_spacer');
  let navButton = $('.nav_button');

  let menuOpen = false;
  let scrollPosition;

  $(navButton).on('click', function () {
    disableScroll();
  });

  const disableScroll = () => {
    if (!menuOpen) {
      // Disable Scroll
      scrollPosition = $(window).scrollTop();
      $('html, body').scrollTop(0).addClass('overflow-hidden');

      // Hide Sidebar
      if (window.innerWidth >= 992) {
        gsap.to(sidebar, {
          xPercent: 100,
        });
      } else {
        gsap.to(sidebar, {
          ease: 'back.in(1.7)',
          yPercent: 200,
        });
      }

      // Check if screen width is between 992px and 1600px
      if (window.innerWidth >= 992 && window.innerWidth <= 1600) {
        gsap.to(sideSpacer, {
          width: 0,
        });
      }
    } else {
      // Disable Scroll
      $('html, body').scrollTop(scrollPosition).removeClass('overflow-hidden');

      // Reveal Sidebar
      if (window.innerWidth >= 992) {
        gsap.to(sidebar, {
          xPercent: 0,
        });
      } else {
        ease: 'back.in(1.7)',
          gsap.to(sidebar, {
            yPercent: 0,
          });
      }

      // Check if screen width is between 992px and 1600px
      if (window.innerWidth >= 992 && window.innerWidth <= 1600) {
        gsap.to(sideSpacer, {
          width: '2.4rem',
        });
      }
    }
    menuOpen = !menuOpen;
  };

  ScrollTrigger.matchMedia({
    // Respo
    '(max-width: 991px)': function () {
      // Reveal
      gsap.to(sidebarBox, { bottom: 0 });

      // Anims
      let tl = gsap.timeline({
        ease: 'back.in(1.7)',
        scrollTrigger: {
          trigger: $('[hide-sidebar]'),
          start: `top bottom`,
          onEnter: () => {
            if (!menuOpen) {
              gsap.to(sidebar, {
                yPercent: 200,
              });
            }
          },
          onLeave: () => {},
          onLeaveBack: () => {
            if (!menuOpen) {
              gsap.to(sidebar, {
                yPercent: 0,
              });
            }
          },
        },
      });
    },

    // Desktop
    '(min-width: 992px)': function () {
      // Reveal
      gsap.to(sidebarBox, { left: 0 });

      // Anims
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: $('[hide-sidebar]'),
          start: `top bottom`,
          onEnter: () => {
            if (!menuOpen) {
              gsap.to(sidebar, {
                xPercent: 100,
              });
            }
          },
          onLeave: () => {},
          onLeaveBack: () => {
            if (!menuOpen) {
              gsap.to(sidebar, {
                xPercent: 0,
              });
            }
          },
        },
      });
    },
  });

  ScrollTrigger.matchMedia({
    // Big Desktop
    '(min-width: 992px) and (max-width: 1600px)': function () {
      let tl = gsap.timeline({
        ease: 'power3.out',
        scrollTrigger: {
          trigger: $('[hide-sidebar]'),
          start: `top bottom`,
          onEnter: () => {
            if (!menuOpen) {
              gsap.to(sideSpacer, {
                width: 0,
              });
            }
          },
          onLeave: () => {},
          onLeaveBack: () => {
            if (!menuOpen) {
              gsap.to(sideSpacer, {
                width: '2.4rem',
              });
            }
          },
        },
      });
    },
  });
});
