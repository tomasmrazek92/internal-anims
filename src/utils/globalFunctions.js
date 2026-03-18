// --- Swipers Start ---
let windowWidth = window.innerWidth;
// Create an object to hold unique counters for each classSelector.
let uniqueIdCounters = {};
let shouldInitializeImmediately = false; // Add this flag at the top of your function

export const createResponsiveSwiper = (
  componentSelector,
  swiperSelector,
  classSelector,
  options,
  mode
) => {
  // Step 2: Fetch elements by their componentSelector; if none, exit the function
  let elements = $(componentSelector).add(swiperSelector);
  console.log(elements.length);
  if (elements.length !== 2) return;

  // Reset the uniqueIdCounters for this classSelector to 0
  uniqueIdCounters[classSelector] = 0;

  // Step 3: Loop through each matched element
  uniqueIdCounters[classSelector] = uniqueIdCounters[classSelector] || 0;
  elements.each(function () {
    // Generate a unique key for this instance based on the classSelector and a counter
    let uniqueKey = `${classSelector}_${uniqueIdCounters[classSelector]}`;

    // Step 4: Add unique classes to swiper container, arrows and pagination for this instance
    addUniqueClassesToElements(this, swiperSelector, uniqueKey, [
      '.swiper-arrow',
      '.swiper-navigation',
      '.swiper-drag-wrapper',
    ]);

    // Step 5: Merge default and passed swiper options
    let swiperOptions = getMergedSwiperOptions(options, uniqueKey);

    // Step 6: Initialize or destroy swipers based on media query and passed mode
    manageSwiperInstance(this, swiperSelector, uniqueKey, classSelector, swiperOptions, mode);

    // Increment unique ID counter for the specific classSelector
    uniqueIdCounters[classSelector]++;
  });
};

// Adds unique classes to swiper and control elements
const addUniqueClassesToElements = (context, swiperSelector, uniqueKey, controlSelectors) => {
  controlSelectors.forEach((selector) => {
    $(context).find(selector).addClass(uniqueKey);
  });
  $(context).find(swiperSelector).addClass(uniqueKey);
};

// Merge default and custom swiper options
const getMergedSwiperOptions = (options, uniqueKey) => {
  // Default pagination config
  const defaultPagination = {
    el: `.swiper-navigation.${uniqueKey}`,
    type: 'bullets',
    bulletActiveClass: 'swiper-bullet-active',
    bulletClass: 'swiper-bullet',
    clickable: true,
  };

  // Merge pagination options if provided, otherwise use default
  const paginationConfig = options.pagination
    ? { ...defaultPagination, ...options.pagination }
    : defaultPagination;

  return {
    speed: 1000,
    navigation: {
      prevEl: `.swiper-arrow.prev.${uniqueKey}`,
      nextEl: `.swiper-arrow.next.${uniqueKey}`,
    },
    pagination: paginationConfig,
    ...options,
  };
};

// This function manages Swiper instances: initializing or destroying them based on certain conditions
const manageSwiperInstance = (
  context,
  swiperSelector,
  uniqueKey,
  classSelector,
  swiperOptions,
  mode
) => {
  // Initialize the nested object for storing Swiper instances if it doesn't exist
  swipers[classSelector] = swipers[classSelector] || {};
  swipers[classSelector][uniqueKey] = swipers[classSelector][uniqueKey] || {};

  // Fetch the existing Swiper instance information, if it exists
  let existingInstance = swipers[classSelector][uniqueKey];
  let existingSwiper = existingInstance.swiperInstance;

  // Determine under what conditions the Swiper should be initialized for desktop and mobile
  let shouldInitDesktop = mode === 'desktop' && window.matchMedia('(min-width: 992px)').matches;
  let shouldInitMobile =
    mode === 'mobile' && window.matchMedia('(min-width: 0px) and (max-width: 991px)').matches;
  let shouldInitAll = mode === 'all';

  // Destroy function
  const destroySwiper = () => {
    if (existingInstance.observer) {
      existingInstance.observer.disconnect();
      delete existingInstance.observer;
    }
    if (existingSwiper) {
      existingSwiper.destroy(true, true);
      delete swipers[classSelector][uniqueKey];
      console.log('Swiper destroyed for', swiperSelector, 'with uniqueKey', uniqueKey);
    }
  };

  // Reinitialize function
  const reInitObserver = () => {
    // Disconnect any existing observers
    if (existingInstance.observer) {
      existingInstance.observer.disconnect();
    }

    const swiperElement = $(`${swiperSelector}.${uniqueKey}`)[0];
    if (!swiperElement) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && (shouldInitDesktop || shouldInitMobile || shouldInitAll)) {
          if (!existingSwiper) {
            let swiper = new Swiper(`${swiperSelector}.${uniqueKey}`, swiperOptions);
            swipers[classSelector][uniqueKey] = {
              swiperInstance: swiper,
              mode: shouldInitDesktop ? 'desktop' : shouldInitMobile ? 'mobile' : 'all',
              initialized: true,
            };
            observer.disconnect();
            console.log('Swiper initialized for', swiperSelector, 'with uniqueKey', uniqueKey);
          }
        }
      });
    }, {});

    // Store the observer instance
    swipers[classSelector][uniqueKey].observer = observer;

    // Observe the element
    observer.observe(swiperElement);
  };

  // Check the conditions and either destroy or reinitialize
  if (!shouldInitDesktop && mode === 'desktop') destroySwiper();
  else if (!shouldInitMobile && mode === 'mobile') destroySwiper();
  else if (!shouldInitAll && mode === 'all') destroySwiper();
  else if ((shouldInitDesktop || shouldInitMobile || shouldInitAll) && !existingSwiper) {
    reInitObserver();
  }
};

// Function to initialize swipers from an array of instances
export const runSwipers = (swiperInstances) => {
  swiperInstances.forEach((instance) => {
    createResponsiveSwiper(...instance);
  });
};

export const initSwipers = (swiperInstances, swipersState) => {
  // Load
  runSwipers(swiperInstances);

  // Resize
  window.addEventListener('resize', function () {
    if (window.innerWidth !== windowWidth) {
      windowWidth = window.innerWidth;
      runSwipers(swiperInstances);
    }
  });
};
