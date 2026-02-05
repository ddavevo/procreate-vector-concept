/**
 * Procreate-style vertical sliders: Brush Size and Brush Opacity.
 * Drag the light gray oval thumb up/down, or click the track to jump.
 */

(function () {
  const TRACK_SELECTOR = '.sidebar-slider__track';
  const THUMB_SELECTOR = '.sidebar-slider__thumb';

  function getValue(thumb) {
    const min = parseInt(thumb.getAttribute('aria-valuemin'), 10) || 0;
    const max = parseInt(thumb.getAttribute('aria-valuemax'), 10) || 100;
    let value = parseInt(thumb.getAttribute('aria-valuenow'), 10);
    if (Number.isNaN(value)) value = 50;
    return Math.max(min, Math.min(max, value));
  }

  function setValue(thumb, value) {
    const min = parseInt(thumb.getAttribute('aria-valuemin'), 10) || 0;
    const max = parseInt(thumb.getAttribute('aria-valuemax'), 10) || 100;
    value = Math.max(min, Math.min(max, Math.round(value)));
    thumb.setAttribute('aria-valuenow', value);
    updateThumbPosition(thumb);
    return value;
  }

  function updateThumbPosition(thumb) {
    const track = thumb.closest(TRACK_SELECTOR);
    if (!track) return;
    const value = getValue(thumb);
    const trackRect = track.getBoundingClientRect();
    const trackHeight = trackRect.height;
    const thumbHeight = 12; // px, match CSS .sidebar-slider__thumb height
    const minTop = 0;
    const maxTop = trackHeight - thumbHeight;
    // value 100 = top (minTop), value 0 = bottom (maxTop)
    const top = maxTop - (value / 100) * maxTop;
    thumb.style.top = top + 'px';
  }

  function valueFromY(track, clientY) {
    const trackRect = track.getBoundingClientRect();
    const trackHeight = trackRect.height;
    const thumbHeight = 12;
    const maxTop = trackHeight - thumbHeight;
    const y = clientY - trackRect.top;
    // y 0 = top = value 100, y trackHeight = bottom = value 0
    const top = Math.max(0, Math.min(maxTop, y - thumbHeight / 2));
    const value = 100 * (1 - top / maxTop);
    return Math.max(0, Math.min(100, value));
  }

  function initSlider(sliderEl) {
    const track = sliderEl.querySelector(TRACK_SELECTOR);
    const thumb = sliderEl.querySelector(THUMB_SELECTOR);
    if (!track || !thumb) return;

    updateThumbPosition(thumb);

    let isDragging = false;

    function onPointerDown(e) {
      if (e.button !== 0 && e.type === 'mousedown') return;
      e.preventDefault();
      isDragging = true;
      setValue(thumb, valueFromY(track, e.clientY));
      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('touchend', onPointerUp);
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setValue(thumb, valueFromY(track, clientY));
    }

    function onPointerUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('mouseup', onPointerUp);
      document.removeEventListener('touchmove', onPointerMove);
      document.removeEventListener('touchend', onPointerUp);
    }

    function onTrackClick(e) {
      if (e.target === thumb) return;
      setValue(thumb, valueFromY(track, e.clientY));
    }

    thumb.addEventListener('mousedown', onPointerDown);
    thumb.addEventListener('touchstart', onPointerDown, { passive: false });
    track.addEventListener('click', onTrackClick);

    // Keyboard: arrow up/down for track (when focused)
    track.addEventListener('keydown', function (e) {
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setValue(thumb, getValue(thumb) + step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setValue(thumb, getValue(thumb) - step);
      }
    });
  }

  function init() {
    document.querySelectorAll('.sidebar-slider').forEach(initSlider);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
