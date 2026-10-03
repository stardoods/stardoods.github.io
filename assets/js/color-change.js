document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;

    // Theme
    let isDarkMode = localStorage.getItem('theme') === 'dark';
    root.dataset.theme = isDarkMode ? 'dark' : 'light';

    const themeIcons = document.querySelectorAll('.ico-dark, .ico-light');
    if (isDarkMode) {
        themeIcons.forEach(ico => ico.classList.add('active'));
    }


    // Configuration
    const easingFactor = 0.1;

    const lightStartHue = 0;
    const lightSaturation = 20;
    const lightLightness = 96;
    const pixelsPerLightHueCycle = 20000;
    
    const darkStartHue = 0;
    const darkSaturation = 100;
    const darkLightness = 26;
    const pixelsPerDarkHueCycle = 17000;

    const accentSaturation = 95;
    const accentLightness = 51;


    // Restore virtual scroll
    const savedScroll = sessionStorage.getItem('virtualScrollTop');

    let virtualScrollTop = savedScroll !== null
        ? Number(savedScroll)
        : (window.scrollY || document.documentElement.scrollTop || 0);

    if (!Number.isFinite(virtualScrollTop)) virtualScrollTop = 0;


    // Initial hues
    let currentLightHue = (lightStartHue + virtualScrollTop / pixelsPerLightHueCycle * 360) % 360;
    let currentDarkHue = (darkStartHue + virtualScrollTop / pixelsPerDarkHueCycle * 360) % 360;

    currentLightHue = (currentLightHue + 360) % 360;
    currentDarkHue = (currentDarkHue + 360) % 360;


    let animationFrame = null;
    let saveTimeout = null;

    function lerpHue(current, target, factor) {
        let diff = target - current;

        if (diff > 180) diff -= 360;
        else if (diff < -180) diff += 360;

        return ((current + diff * factor) % 360 + 360) % 360;
    }


    function scheduleSave() {
        clearTimeout(saveTimeout);

        saveTimeout = setTimeout(() => {
            sessionStorage.setItem(
                'virtualScrollTop',
                String(virtualScrollTop)
            );
        }, 100);
    }


    // Apply colours immediately using current hues/theme
    function applyColors() {
        const lightSat = isDarkMode ? 45 : lightSaturation;
        const darkSat = isDarkMode ? 18 : darkSaturation;
        const darkLight = isDarkMode ? 7 : darkLightness;

        let light = `hsl(${currentLightHue}, ${lightSat}%, ${lightLightness}%)`;
        let dark = `hsl(${currentDarkHue}, ${darkSat}%, ${darkLight}%)`;
        const accent = `hsl(${currentLightHue}, ${accentSaturation}%, ${accentLightness}%)`;

        if (isDarkMode) [light, dark] = [dark, light];

        root.style.setProperty('--light', light);
        root.style.setProperty('--dark', dark);
        root.style.setProperty('--accent', accent);
    }


    // Move hues toward their scroll-derived targets
    function hueDistance(a, b) {
      const diff = Math.abs(a - b) % 360;
      return Math.min(diff, 360 - diff);
    }


    function updateColors() {
        const targetLightHue =
            ((lightStartHue + virtualScrollTop / pixelsPerLightHueCycle * 360) % 360 + 360) % 360;

        const targetDarkHue =
            ((darkStartHue + virtualScrollTop / pixelsPerDarkHueCycle * 360) % 360 + 360) % 360;

        currentLightHue = lerpHue(
            currentLightHue,
            targetLightHue,
            easingFactor
        );

        currentDarkHue = lerpHue(
            currentDarkHue,
            targetDarkHue,
            easingFactor
        );

        applyColors();

        return (
            hueDistance(currentLightHue - targetLightHue) > 0.01 ||
            hueDistance(currentDarkHue - targetDarkHue) > 0.01
        );
    }


    function animationLoop() {
        if (updateColors()) {
            animationFrame = requestAnimationFrame(animationLoop);
        } else {
            animationFrame = null;
        }
    }


    function startAnimation() {
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
        }

        animationFrame = requestAnimationFrame(animationLoop);
    }


    function handleWheel(event) {
        virtualScrollTop += event.deltaY;
        scheduleSave();
        startAnimation();
    }


    let isTouching = false;
    let touchStartY = 0;

    function handleTouchStart(event) {
        if (event.touches.length === 1) {
            isTouching = true;
            touchStartY = event.touches[0].clientY;
        }
    }

    function handleTouchMove(event) {
        if (!isTouching || event.touches.length !== 1) return;

        const currentY = event.touches[0].clientY;

        virtualScrollTop += touchStartY - currentY;
        touchStartY = currentY;

        scheduleSave();
        startAnimation();
    }

    function handleTouchEnd() {
        isTouching = false;
    }


    // Theme controls
    const themeButtons = document.querySelectorAll('#btn-brightness');
    const innerContent = document.querySelector('main');

    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
          const moonIcons = document.querySelectorAll('.ico-dark');
          const sunIcons = document.querySelectorAll('.ico-light');
          const codeblocks = innerContent?.querySelectorAll('pre');

          isDarkMode = !isDarkMode;

          localStorage.setItem(
              'theme',
              isDarkMode ? 'dark' : 'light'
          );

          root.dataset.theme = isDarkMode ? 'dark' : 'light';

          moonIcons.forEach(ico => ico.classList.toggle('active'));
          sunIcons.forEach(ico => ico.classList.toggle('active'));

          codeblocks?.forEach(codeblock => {
              codeblock.classList.toggle('pre-dark', isDarkMode);
          });


          applyColors();
          startAnimation();

          if (typeof changeGiscusTheme === 'function') { // giscus is called after application as it may throw errors and prevent intended behaviour
              changeGiscusTheme(
                  isDarkMode ? 'noborder_gray' : 'light'
              );
          }
        });
    });


    // Events
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Persist state before navigation
    window.addEventListener('beforeunload', () => {
        clearTimeout(saveTimeout);

        sessionStorage.setItem(
            'virtualScrollTop',
            String(virtualScrollTop)
        );

        localStorage.setItem(
            'theme',
            isDarkMode ? 'dark' : 'light'
        );
    });

    applyColors(); // Initial render
});