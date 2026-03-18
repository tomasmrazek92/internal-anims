// Reference Items Matcher Module
(function ($) {
  class ReferenceGallery {
    constructor(config = {}) {
      this.config = $.extend(
        {
          itemsSelector: '.reference_items-collection-item',
          photosSelector: '.reference_photo-collection-item',
          itemsListSelector: '.reference_items-collection-list',
          photosListSelector: '.reference_photo-collection-list',
          itemsWrapSelector: '.reference_items-collection-list-wrap',
          itemsContainerSelector: '.reference_hero-wrap_left',
          rightWrapSelector: '.reference_hero-wrap_right',
          activeClass: 'active',
          duplicateBeforeClass: 'duplicate-before',
          duplicateAfterClass: 'duplicate-after',
        },
        config
      );

      this.elements = {
        items: null,
        photos: null,
        itemsList: null,
        photosList: null,
        allItems: null,
        allPhotos: null,
        itemsWrap: null,
        itemsContainer: null,
        rightWrap: null,
      };

      this.state = {
        groupSize: 0,
        initialized: false,
        isScrolling: false,
        scrollTimeout: null,
      };

      // Wait for DOM to be fully loaded
      $(document).ready(() => {
        this.init();
      });
    }

    init() {
      if (this.state.initialized) return;
      console.log('Initializing ReferenceGallery');

      this.queryElements();
      if (!this.validateElements()) {
        console.error('Failed to validate elements');
        return;
      }

      this.state.groupSize = this.elements.items.length;
      console.log('Group size:', this.state.groupSize);

      this.createDuplicates();
      this.assignIds();

      // Add pointer-events-on class initially
      this.elements.allItems.addClass('pointer-events-on');

      // Set initial active photo before binding events
      this.showInitialPhoto();

      this.bindEvents();
      this.updatePointerEvents();

      // Delay scrolling to ensure DOM updates are complete
      setTimeout(() => {
        // Double check that we have an active photo
        if (!this.elements.allPhotos.filter(`.${this.config.activeClass}`).length) {
          console.warn('No active photo found before scrolling, re-running showInitialPhoto');
          this.showInitialPhoto();
        }
        this.scrollToMiddle();
      }, 100);

      this.state.initialized = true;
      console.log('Initialization complete');
    }

    queryElements() {
      this.elements = {
        items: $(this.config.itemsSelector),
        photos: $(this.config.photosSelector),
        itemsList: $(this.config.itemsListSelector),
        photosList: $(this.config.photosListSelector),
        itemsWrap: $(this.config.itemsWrapSelector),
        itemsContainer: $(this.config.itemsContainerSelector),
        rightWrap: $(this.config.rightWrapSelector),
      };

      // Log found elements
      console.log('Found elements:', {
        items: this.elements.items.length,
        photos: this.elements.photos.length,
        itemsList: this.elements.itemsList.length,
        photosList: this.elements.photosList.length,
        itemsWrap: this.elements.itemsWrap.length,
        itemsContainer: this.elements.itemsContainer.length,
        rightWrap: this.elements.rightWrap.length,
      });
    }

    validateElements() {
      const isValid =
        this.elements.items.length > 0 &&
        this.elements.photos.length > 0 &&
        this.elements.itemsList.length > 0 &&
        this.elements.photosList.length > 0 &&
        this.elements.itemsWrap.length > 0 &&
        this.elements.itemsContainer.length > 0 &&
        this.elements.rightWrap.length > 0;

      if (!isValid) {
        console.error('Missing elements:', {
          items: this.elements.items.length === 0,
          photos: this.elements.photos.length === 0,
          itemsList: this.elements.itemsList.length === 0,
          photosList: this.elements.photosList.length === 0,
          itemsWrap: this.elements.itemsWrap.length === 0,
          itemsContainer: this.elements.itemsContainer.length === 0,
          rightWrap: this.elements.rightWrap.length === 0,
        });
      }

      return isValid;
    }

    createDuplicates() {
      const duplicates = {
        itemsBefore: this.elements.itemsList.clone(),
        itemsAfter: this.elements.itemsList.clone(),
        photosBefore: this.elements.photosList.clone(),
        photosAfter: this.elements.photosList.clone(),
      };

      // Add classes to duplicates
      duplicates.itemsBefore.addClass(this.config.duplicateBeforeClass);
      duplicates.itemsAfter.addClass(this.config.duplicateAfterClass);
      duplicates.photosBefore.addClass(this.config.duplicateBeforeClass);
      duplicates.photosAfter.addClass(this.config.duplicateAfterClass);

      // Insert duplicates
      this.elements.itemsList.before(duplicates.itemsBefore);
      this.elements.itemsList.after(duplicates.itemsAfter);
      this.elements.photosList.before(duplicates.photosBefore);
      this.elements.photosList.after(duplicates.photosAfter);

      // Update elements after duplication
      this.elements.allItems = $(this.config.itemsSelector);
      this.elements.allPhotos = $(this.config.photosSelector);
    }

    assignIds() {
      this.elements.allItems.each((index, item) => {
        const groupIndex = Math.floor(index / this.state.groupSize);
        const originalIndex = index % this.state.groupSize;
        const uniqueId = `ref-${groupIndex}-${originalIndex + 1}`;

        $(item).attr('data-ref-id', uniqueId);

        if (this.elements.allPhotos.eq(index).length) {
          this.elements.allPhotos.eq(index).attr('data-ref-id', uniqueId);
        }
      });
    }

    bindEvents() {
      // Item click handler
      this.elements.allItems.on('click', (e) => {
        e.preventDefault();
        this.updateActiveElements($(e.currentTarget), 'item');
      });

      // Add scroll synchronization
      const $heroSection = $('.section_reference_hero');
      console.log('Hero section found:', $heroSection.length > 0);

      if ($heroSection.length === 0) {
        console.error('Hero section not found for scroll binding');
        return;
      }

      let scrollDebounce;
      let resizeDebounce;
      let isAdjustingScroll = false; // Flag to prevent recursive scroll events
      let lastBreakpoint = window.innerWidth >= 992 ? 'desktop' : 'mobile'; // Track current breakpoint
      let globalScrollDebounce;

      // Add resize handler
      $(window).on('resize', () => {
        console.log('Resize event fired');

        // Clear previous debounce
        clearTimeout(resizeDebounce);

        // Debounce resize to avoid too many recalculations
        resizeDebounce = setTimeout(() => {
          console.log('Recalculating after resize');

          // Check if we crossed a breakpoint
          const currentBreakpoint = window.innerWidth >= 992 ? 'desktop' : 'mobile';
          const breakpointChanged = currentBreakpoint !== lastBreakpoint;

          // Update the last breakpoint
          lastBreakpoint = currentBreakpoint;

          // Recalculate dimensions
          this.recalculate();

          // If breakpoint changed, reposition the active item according to new rules
          if (breakpointChanged) {
            console.log(`Breakpoint changed to ${currentBreakpoint}, repositioning active item`);

            // Find the active photo
            const activePhoto = this.elements.allPhotos.filter(`.${this.config.activeClass}`);

            if (activePhoto.length) {
              // Reposition with the new breakpoint logic
              this.scrollToPosition(activePhoto, true, 300);
            }
          }
        }, 250);
      });

      // Direct scroll synchronization from right panel to left panel
      this.elements.rightWrap.on('scroll', (e) => {
        // Skip if we're programmatically adjusting scroll
        if (isAdjustingScroll) {
          return;
        }

        // Set scrolling state if not already set
        if (!this.state.isScrolling) {
          this.state.isScrolling = true;
          this.updatePointerEvents();
        }

        // Clear previous debounce
        clearTimeout(scrollDebounce);

        // Get scroll info from right panel
        const rightWrap = this.elements.rightWrap[0];
        let scrollDistance = rightWrap.scrollTop;
        const maxScroll = rightWrap.scrollHeight - rightWrap.clientHeight;

        // Check for infinite scroll boundaries
        const photoHeight = this.elements.photosList.outerHeight() / 3; // Height of one group
        const threshold = photoHeight * 0.5; // Threshold for when to jump

        // Handle infinite scroll boundaries
        if (scrollDistance > maxScroll - threshold) {
          // If we're near the bottom, jump to middle
          const offset = scrollDistance % photoHeight;
          isAdjustingScroll = true; // Set flag before changing scroll
          rightWrap.scrollTop = photoHeight + offset;
          scrollDistance = rightWrap.scrollTop;
          console.log('Jumped from bottom to middle', {
            newScroll: scrollDistance,
            photoHeight,
            offset,
          });
          isAdjustingScroll = false; // Reset flag after changing scroll

          // Force immediate sync of left panel after jumping
          requestAnimationFrame(() => {
            this.syncLeftToRight(scrollDistance);
          });
        } else if (scrollDistance < threshold) {
          // If we're near the top, jump to middle
          const offset = scrollDistance % photoHeight;
          isAdjustingScroll = true; // Set flag before changing scroll
          rightWrap.scrollTop = photoHeight + offset;
          scrollDistance = rightWrap.scrollTop;
          console.log('Jumped from top to middle', {
            newScroll: scrollDistance,
            photoHeight,
            offset,
          });
          isAdjustingScroll = false; // Reset flag after changing scroll

          // Force immediate sync of left panel after jumping
          requestAnimationFrame(() => {
            this.syncLeftToRight(scrollDistance);
          });
        }

        // Sync the left panel with the right panel using the ratio
        this.syncLeftToRight(scrollDistance);

        // Find and update active items
        this.updateActiveItemsSimple();

        // Set a debounce to ensure we catch the end of scrolling
        scrollDebounce = setTimeout(() => {
          console.log('Scroll ended');
          this.state.isScrolling = false;
          this.updatePointerEvents();

          // Center the closest item when scroll ends
          this.centerClosestItem();
        }, 500);
      });

      // Global scroll detection to disable pointer events on any scroll attempt
      $(document).on('wheel touchmove', (event) => {
        // Check if the event target is within our gallery
        if ($heroSection.find(event.target).length || $heroSection.is(event.target)) {
          // Set scrolling state if not already set
          if (!this.state.isScrolling) {
            this.state.isScrolling = true;
            this.updatePointerEvents();
            console.log('Global scroll detected, disabling pointer events');
          }

          // Clear previous debounce
          clearTimeout(globalScrollDebounce);

          // Set a debounce to re-enable pointer events after scrolling stops
          globalScrollDebounce = setTimeout(() => {
            console.log('Global scroll ended');
            this.state.isScrolling = false;
            this.updatePointerEvents();
          }, 500);
        }
      });

      // Log initial scroll positions
      console.log('Initial scroll positions:', {
        heroSection: $heroSection.scrollTop(),
        rightWrap: this.elements.rightWrap.scrollTop(),
        itemsContainer: this.elements.itemsContainer.scrollTop(),
      });
    }

    // Central method for syncing left panel to right panel
    syncLeftToRight(rightScrollPosition) {
      const photoToListRatio =
        this.elements.photosList.outerHeight() / this.elements.itemsList.outerHeight();
      const leftWrap = this.elements.itemsContainer[0];
      const leftMaxScroll = leftWrap.scrollHeight - leftWrap.clientHeight;
      const listHeight = this.elements.itemsList.outerHeight() / 3; // Height of one group
      const threshold = listHeight * 0.5; // Threshold for when to jump

      // Calculate the target scroll position with a small offset to ensure alignment
      let leftScrollPosition = Math.floor(rightScrollPosition / photoToListRatio) + 12; // Add 12px offset

      // Handle infinite scroll boundaries for left panel
      if (leftScrollPosition > leftMaxScroll - threshold) {
        // If we're near the bottom, jump to middle
        const offset = leftScrollPosition % listHeight;
        leftScrollPosition = listHeight + offset;
        console.log('Left panel jumped from bottom to middle', {
          newScroll: leftScrollPosition,
          listHeight,
          offset,
        });
      } else if (leftScrollPosition < threshold) {
        // If we're near the top, jump to middle
        const offset = leftScrollPosition % listHeight;
        leftScrollPosition = listHeight + offset;
        console.log('Left panel jumped from top to middle', {
          newScroll: leftScrollPosition,
          listHeight,
          offset,
        });
      }

      // Apply the scroll to the left panel
      leftWrap.scrollTop = leftScrollPosition;

      return leftScrollPosition;
    }

    // Central method for calculating and applying scroll positions
    scrollToPosition(target, animate = true, duration = 300, options = {}) {
      try {
        // Handle different types of targets
        let targetPhoto;

        if (typeof target === 'string') {
          if (target === 'middle') {
            // Special case: scroll to middle group
            console.log('Scrolling to middle');
            const middleGroupIndex = 1; // We have 3 groups (0, 1, 2), so 1 is middle
            targetPhoto = this.elements.allPhotos.eq(this.state.groupSize * middleGroupIndex);

            // Remove pointer-events during initial scroll to middle
            this.elements.allItems.removeClass('pointer-events-on');
          } else if (target === 'active') {
            // Special case: scroll to active photo
            targetPhoto = this.elements.allPhotos.filter(`.${this.config.activeClass}`);
          }
        } else {
          // Default: use the provided target
          targetPhoto = target;
        }

        if (!targetPhoto || !targetPhoto.length) {
          console.error('No target photo found for scrolling');
          return null;
        }

        // Set scrolling state
        this.state.isScrolling = true;
        this.updatePointerEvents();

        // Get the right wrap element
        const rightWrap = this.elements.rightWrap[0];
        const viewportHeight = rightWrap.clientHeight;
        const isDesktop = window.innerWidth >= 992;

        // Calculate the target scroll position based on viewport size
        const photoRect = targetPhoto[0].getBoundingClientRect();
        let photoTargetScroll;

        if (isDesktop) {
          // On desktop: Center the item in the viewport
          const viewportMiddle = viewportHeight / 2;
          photoTargetScroll =
            rightWrap.scrollTop + (photoRect.top - viewportMiddle + photoRect.height / 2);
        } else {
          // On mobile/tablet: Snap to the top with a percentage-based offset
          const topOffset = viewportHeight * 0.1; // 10% of viewport height
          photoTargetScroll = rightWrap.scrollTop + (photoRect.top - topOffset);
        }

        // Apply the scroll with or without animation
        const applyScroll = () => {
          // Sync the left panel
          this.syncLeftToRight(rightWrap.scrollTop);

          // Reset scrolling state after a short delay
          setTimeout(() => {
            this.state.isScrolling = false;
            this.updatePointerEvents();

            // Call the onComplete callback if provided
            if (options.onComplete) {
              options.onComplete();
            }
          }, 100);
        };

        if (animate) {
          $(rightWrap).animate({ scrollTop: photoTargetScroll }, duration, applyScroll);
        } else {
          rightWrap.scrollTop = photoTargetScroll;
          applyScroll();
        }

        return photoTargetScroll;
      } catch (error) {
        console.error('Error in scrollToPosition:', error);
        this.state.isScrolling = false;
        this.updatePointerEvents();
        return null;
      }
    }

    // Use the central scrollToPosition method with 'middle' target
    scrollToMiddle() {
      return this.scrollToPosition('middle', true, 300);
    }

    // Use the central scrollToPosition method with 'active' target
    centerClosestItem() {
      return this.scrollToPosition('active', true, 300);
    }

    // Unified method for handling clicks on either items or photos
    updateActiveElements($clickedElement, elementType) {
      // Remove active class from all elements
      this.elements.allPhotos.removeClass(this.config.activeClass);
      this.elements.allItems.removeClass(this.config.activeClass);

      // Add active class to clicked element
      $clickedElement.addClass(this.config.activeClass);

      // Get the reference ID
      const refId = $clickedElement.attr('data-ref-id');

      // Find the matching element (photo if item was clicked, or item if photo was clicked)
      const isItemClick = elementType === 'item';
      const $matchingElement = isItemClick
        ? this.elements.allPhotos.filter(`[data-ref-id="${refId}"]`)
        : this.elements.allItems.filter(`[data-ref-id="${refId}"]`);

      if ($matchingElement.length) {
        // Add active class to the matching element
        $matchingElement.addClass(this.config.activeClass);

        // Set scrolling state
        this.state.isScrolling = true;
        this.updatePointerEvents();

        if (isItemClick) {
          // If item was clicked, scroll the right panel (photos)
          this.scrollToPosition($matchingElement, true, 300, {
            onComplete: () => {
              console.log('Item click scroll complete:', {
                clickedItem: refId,
                matchingPhoto: $matchingElement.attr('data-ref-id'),
              });
            },
          });
        } else {
          // If photo was clicked, scroll the left panel (items)
          const leftWrap = this.elements.itemsContainer[0];
          const viewportHeight = leftWrap.clientHeight;
          const isDesktop = window.innerWidth >= 992;

          // Calculate target scroll position
          const itemRect = $matchingElement[0].getBoundingClientRect();
          let itemTargetScroll;

          if (isDesktop) {
            // Center in viewport on desktop
            const viewportMiddle = viewportHeight / 2;
            itemTargetScroll =
              leftWrap.scrollTop + (itemRect.top - viewportMiddle + itemRect.height / 2);
          } else {
            // Snap to top on mobile
            itemTargetScroll = leftWrap.scrollTop + (itemRect.top - 20);
          }

          // Animate scroll
          $(leftWrap).animate({ scrollTop: itemTargetScroll }, 300, () => {
            setTimeout(() => {
              this.state.isScrolling = false;
              this.updatePointerEvents();
              console.log(`Photo click scroll complete: ${refId}`);
            }, 100);
          });
        }
      }
    }

    updatePointerEvents() {
      if (this.state.isScrolling) {
        this.elements.allItems.removeClass('pointer-events-on');
      } else {
        this.elements.allItems.addClass('pointer-events-on');
      }
    }

    updateActiveItemsSimple() {
      try {
        const rightWrap = this.elements.rightWrap[0];
        const viewportHeight = rightWrap.clientHeight;
        const viewportWidth = window.innerWidth; // Get current viewport width
        const isDesktop = viewportWidth >= 992; // Check if we're on desktop

        // Find visible photos
        const $visiblePhotos = this.elements.allPhotos.filter((_, photo) => {
          const rect = photo.getBoundingClientRect();
          return rect.top < viewportHeight && rect.bottom > 0;
        });

        let closestPhoto = null;
        let minDistance = Infinity;

        $visiblePhotos.each((_, photo) => {
          const $photo = $(photo);
          const rect = photo.getBoundingClientRect();

          let referencePoint;
          if (isDesktop) {
            // On desktop: Find the photo closest to the middle
            const photoCenter = rect.top + rect.height / 2;
            const viewportMiddle = viewportHeight / 2;
            referencePoint = viewportMiddle;
            const distance = Math.abs(photoCenter - referencePoint);

            if (distance < minDistance) {
              minDistance = distance;
              closestPhoto = $photo;
            }
          } else {
            // On mobile/tablet: Find the photo closest to the top (with small offset)
            const topOffset = 20;
            referencePoint = topOffset;
            const distance = Math.abs(rect.top - referencePoint);

            if (distance < minDistance) {
              minDistance = distance;
              closestPhoto = $photo;
            }
          }
        });

        if (closestPhoto) {
          const refId = closestPhoto.attr('data-ref-id');

          // Update active states
          this.elements.allPhotos.removeClass(this.config.activeClass);
          this.elements.allItems.removeClass(this.config.activeClass);
          closestPhoto.addClass(this.config.activeClass);

          const $correspondingItem = this.elements.allItems.filter(`[data-ref-id="${refId}"]`);
          if ($correspondingItem.length) {
            $correspondingItem.addClass(this.config.activeClass);
          }
        }
      } catch (error) {
        console.error('Error in updateActiveItemsSimple:', error);
      }
    }

    showInitialPhoto() {
      // Just use the existing scrollToMiddle functionality
      this.scrollToPosition('middle', false, 0);
    }

    recalculate() {
      try {
        // Store current scroll positions and ratios
        const rightWrap = this.elements.rightWrap[0];
        const currentRightScroll = rightWrap.scrollTop;
        const currentPhotoHeight = this.elements.photosList.outerHeight() / 3;

        // Remove existing duplicates
        $(`.${this.config.duplicateBeforeClass}, .${this.config.duplicateAfterClass}`).remove();

        // Re-query elements to get new dimensions
        this.queryElements();

        // Recreate duplicates and reassign IDs
        this.createDuplicates();
        this.assignIds();

        // Calculate new positions
        const newPhotoHeight = this.elements.photosList.outerHeight() / 3;
        const scrollRatio = currentRightScroll / currentPhotoHeight;
        const newRightScroll = scrollRatio * newPhotoHeight;

        // Apply new scroll position to right panel first
        rightWrap.scrollTop = newRightScroll;

        // Then sync the left panel using the central method
        const leftScrollPosition = this.syncLeftToRight(rightWrap.scrollTop);

        console.log('Recalculation complete:', {
          oldPhotoHeight: currentPhotoHeight,
          newPhotoHeight: newPhotoHeight,
          scrollRatio,
          newRightScroll: rightWrap.scrollTop,
          newLeftScroll: leftScrollPosition,
        });
      } catch (error) {
        console.error('Error in recalculate:', error);
      }
    }

    // Public methods for external control
    destroy() {
      // Remove event listeners
      this.elements.allItems.off('click');
      this.elements.allPhotos.off('click');

      // Remove duplicates
      $(`.${this.config.duplicateBeforeClass}, .${this.config.duplicateAfterClass}`).remove();

      // Reset scroll positions
      this.elements.itemsContainer.scrollTop(0);
      this.elements.rightWrap.scrollTop(0);

      // Reset state
      this.state.initialized = false;
    }

    refresh() {
      this.destroy();
      this.init();
    }
  }

  // Add to jQuery as a plugin
  $.fn.referenceGallery = function (options) {
    return this.each(function () {
      if (!$.data(this, 'referenceGallery')) {
        $.data(this, 'referenceGallery', new ReferenceGallery(options));
      }
    });
  };

  // Initialize when DOM is ready
  $(document).ready(function () {
    console.log('Document ready, creating ReferenceGallery');
    // Create instance with default config
    const gallery = new ReferenceGallery();

    // Export to window for external access if needed
    window.referenceGallery = gallery;
  });
})(jQuery);
