document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  // Init theme
  let currentTheme = localStorage.getItem('theme');
  let isDarkMode = false;

    if (currentTheme === 'dark'){
        isDarkMode = true;
        const themeIcons = document.querySelectorAll(".ico-dark, .ico-light");

        themeIcons.forEach((ico) => {
            ico.classList.add('active');
        });
    }
    else {
        isDarkMode = false;
    }

  // Generate random starting hues (0-359)
  const randomLightStartHue = Math.floor(Math.random() * 360);
  const randomDarkStartHue = Math.floor(Math.random() * 360);

  // --- Configuration --- 
  const slowness = 4;

  const lightStartHue = randomLightStartHue; // Use random start hue
  const lightEndHue = 360;  // Not directly used for rate, but keeps range clear
  const lightSaturation = 20; // Saturation % for light color (Reduced from 60)
  const lightLightness = 95;  // Lightness % for light color

  const darkStartHue = randomDarkStartHue; // Use random start hue
  const darkEndHue = 360;   // Not directly used for rate, but keeps range clear
  const darkSaturation = 85;  // Saturation % for dark color
  const darkLightness = 12;   // Lightness % for dark color

  const accentSaturation = 70;
  const accentLightness = 50;

  const pixelsPerLightHueCycle = 10000 * slowness; 
  const pixelsPerDarkHueCycle = 8500 * slowness; 

  const easingFactor = 0.1; // Smaller = smoother/more lag (0 to 1)
  // --- End Configuration ---

  let virtualScrollTop = window.scrollY || document.documentElement.scrollTop;
  let isTouching = false;
  let touchStartY = 0;
  
  // Initialize current hues based on initial virtual scroll
  let currentLightHue = (lightStartHue + (virtualScrollTop / pixelsPerLightHueCycle) * 360);
  let currentDarkHue = (darkStartHue + (virtualScrollTop / pixelsPerDarkHueCycle) * 360);
  currentLightHue = ((currentLightHue % 360) + 360) % 360;
  currentDarkHue = ((currentDarkHue % 360) + 360) % 360;
  
  // Helper function for hue interpolation with wrap-around
  function lerpHue(current, target, factor) {
    let diff = target - current;
    // Adjust difference for shortest path around the 0-360 circle
    if (diff > 180) {
      diff -= 360;
    } else if (diff < -180) {
      diff += 360;
    }
    // Apply easing
    let next = current + diff * factor;
    // Ensure the result wraps around correctly
    return ((next % 360) + 360) % 360;
  }

  function updateColors() {
    // Calculate TARGET hues based on virtual scroll position and INDIVIDUAL cycle lengths
    const targetLightHueOffset = (virtualScrollTop / pixelsPerLightHueCycle) * 360;
    const targetDarkHueOffset = (virtualScrollTop / pixelsPerDarkHueCycle) * 360;

    let targetLightHue = ((lightStartHue + targetLightHueOffset) % 360 + 360) % 360;
    let targetDarkHue = ((darkStartHue + targetDarkHueOffset) % 360 + 360) % 360;

    // Interpolate CURRENT hue towards the target hue
    currentLightHue = lerpHue(currentLightHue, targetLightHue, easingFactor);
    currentDarkHue = lerpHue(currentDarkHue, targetDarkHue, easingFactor);

    // Determine saturation and dark lightness based on theme mode
    let currentLightSaturation = isDarkMode ? 40 : lightSaturation;
    let currentDarkSaturation = isDarkMode ? 14 : darkSaturation;
    let currentDarkLightness = isDarkMode ? 17 : darkLightness; // Adjust dark lightness in dark mode

    // Construct HSL color strings using CURRENT interpolated hues and determined values
    const newLightColor = `hsl(${currentLightHue}, ${currentLightSaturation}%, ${lightLightness}%)`;
    const newDarkColor = `hsl(${currentDarkHue}, ${currentDarkSaturation}%, ${currentDarkLightness}%)`; // Use adjusted lightness
    const newAccentColor = `hsl(${currentLightHue}, ${accentSaturation}%, ${accentLightness}%)`;

    // Construct the full shadow strings using the calculated colors
    let finalLightColor = newLightColor;
    let finalDarkColor = newDarkColor;
    let finalAccentColor = newAccentColor;

    // --- Swap colors and shadows if in dark mode ---
    if (isDarkMode) {
      [finalLightColor, finalDarkColor] = [finalDarkColor, finalLightColor]; // Swap colors
    }
    // --- End Swap ---

    // Update CSS variables for colors AND shadows
    root.style.setProperty('--light', finalLightColor);
    root.style.setProperty('--dark', finalDarkColor);
    root.style.setProperty('--accent', finalAccentColor);

    // // Keep the animation loop running
    // requestAnimationFrame(updateColors);
  }

  function handleWheel(event) {
    virtualScrollTop += event.deltaY;
    // No need to call requestTick here, loop is continuous
  }

  // --- Touch Event Handlers ---
  function handleTouchStart(event) {
    if (event.touches.length === 1) { // Handle single touch scrolling
      isTouching = true;
      touchStartY = event.touches[0].clientY;
    }
  }

  function handleTouchMove(event) {
    if (!isTouching || event.touches.length !== 1) return;

    const currentY = event.touches[0].clientY;
    const deltaY = touchStartY - currentY; // Calculate difference
    virtualScrollTop += deltaY; // Update virtual scroll
    touchStartY = currentY; // Update start position for next move event
    // No need to call requestTick, continuous loop handles updates.
  }

  function handleTouchEnd(event) {
    isTouching = false;
  }

      // Change Datk/Light Theme
    const themeButton = document.querySelectorAll("#btn-brightness");
    const innerContent = document.querySelector('main');

    themeButton.forEach((btn) => {
        btn.addEventListener('click', function() {
            const moonIcons = document.querySelectorAll(".ico-dark");
            const sunIcons = document.querySelectorAll(".ico-light");
            const codeblocks = innerContent != null ? innerContent.querySelectorAll('pre') : null;

            moonIcons.forEach((ico) => {
                ico.classList.toggle('active');
            });

            sunIcons.forEach((ico) => {
                ico.classList.toggle('active');
            });

      if (isDarkMode) {
          isDarkMode = false;
          localStorage.setItem('theme', 'light');

          if (codeblocks) {
              Array.from(codeblocks).forEach(function (codeblock) {
                  codeblock.classList.remove('pre-dark');
              });
          }

          changeGiscusTheme('light');
      } else {
          isDarkMode = true;
          localStorage.setItem('theme', 'dark');

          if (codeblocks) {
              Array.from(codeblocks).forEach(function (codeblock) {
                  codeblock.classList.add('pre-dark');
              });
          }

          changeGiscusTheme('noborder_gray');
      }

            updateColors();
        });
    });

  // --- Start the continuous animation loop ---
  function animationLoop() {
      updateColors();
      requestAnimationFrame(animationLoop);
  }

  animationLoop();

  // Listen for wheel events to update the virtual scroll position
  window.addEventListener('wheel', handleWheel, { passive: true });
  
  // --- Add Touch Event Listeners ---
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('touchcancel', handleTouchEnd, { passive: true }); // Handle cancellation too

  // Optional: Update colors on resize - loop handles the visual update
  window.addEventListener('resize', () => {
      // Maybe re-read initial scroll position or adjust virtualScrollTop?
      // For now, just lets the continuous loop adjust based on current virtualScrollTop.
  }, { passive: true });
}); 