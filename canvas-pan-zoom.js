/**
 * Canvas pan & zoom (Figma/Illustrator-style)
 * - Two-finger scroll: pan
 * - Click and drag: pan
 * - Pinch (trackpad) or Ctrl+scroll: zoom (toward cursor)
 */

(function () {
  const viewport = document.getElementById('canvas-viewport');
  const transformEl = document.getElementById('canvas-transform');
  if (!viewport || !transformEl) return;

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 10;
  const ZOOM_SENSITIVITY = 0.002;

  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let lastClientX = 0;
  let lastClientY = 0;

  function getViewportRect() {
    return viewport.getBoundingClientRect();
  }

  /** Cursor position relative to viewport center (used for zoom-to-cursor) */
  function getCursorInViewportCenterSpace(clientX, clientY) {
    const r = getViewportRect();
    return {
      x: clientX - r.left - r.width / 2,
      y: clientY - r.top - r.height / 2,
    };
  }

  function applyTransform() {
    transformEl.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    transformEl.dataset.scale = String(scale);
    viewport.dispatchEvent(new CustomEvent('canvastransform'));
  }

  function zoomAtCursor(deltaY, clientX, clientY) {
    const cursor = getCursorInViewportCenterSpace(clientX, clientY);
    const oldScale = scale;
    scale *= 1 - deltaY * ZOOM_SENSITIVITY;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
    // Keep the point under the cursor fixed
    const ratio = scale / oldScale;
    panX = cursor.x * (1 - ratio) + panX * ratio;
    panY = cursor.y * (1 - ratio) + panY * ratio;
    applyTransform();
  }

  function pan(deltaX, deltaY) {
    panX -= deltaX;
    panY -= deltaY;
    applyTransform();
  }

  viewport.addEventListener(
    'wheel',
    function (e) {
      if (isDragging) return;
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        zoomAtCursor(e.deltaY, e.clientX, e.clientY);
      } else {
        pan(e.deltaX, e.deltaY);
      }
    },
    { passive: false }
  );

  viewport.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    e.preventDefault();
    isDragging = true;
    lastClientX = e.clientX;
    lastClientY = e.clientY;
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    e.preventDefault();
    // Inverted: drag down → content up, drag right → content left (match trackpad)
    panX += lastClientX - e.clientX;
    panY += lastClientY - e.clientY;
    lastClientX = e.clientX;
    lastClientY = e.clientY;
    applyTransform();
  });

  document.addEventListener('mouseup', function () {
    isDragging = false;
  });

  applyTransform();
})();
