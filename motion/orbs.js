/* Vanilla mount for the vendored thinking-orbs engine.
   MIT © Jakub Antalik. No React, no build.
   The canvas is presentational. The word beside it is the accessible name.
*/

import { resolvePreset, MODE_DRAWS } from "./thinking-orbs/engine.es.js";

function reducedMotion() {
  return (
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function mount(canvas) {
  const state = canvas.getAttribute("data-orb") || "working";
  const requested = Number(canvas.getAttribute("data-orb-size")) || 20;
  const size = requested === 64 ? 64 : 20;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.setAttribute("aria-hidden", "true");

  const dpr = Math.min(
    2,
    (typeof devicePixelRatio !== "undefined" && devicePixelRatio) || 1,
  );
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  const preset = resolvePreset(state, size);
  const draw = MODE_DRAWS[preset.mode];
  const speed = preset.speed || 1;
  if (typeof draw !== "function") return;

  function frame(tSec) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    draw(ctx, size, tSec, true, preset.opts);
  }

  if (reducedMotion()) {
    frame(0.6);
    canvas.setAttribute("data-mounted", "1");
    return;
  }

  let raf = 0;
  let running = false;
  let offscreen = false;
  let paused = false;

  function loop() {
    frame((performance.now() / 1000) * speed);
    if (running) raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || paused || offscreen) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  if (typeof IntersectionObserver !== "undefined") {
    new IntersectionObserver((entries) => {
      offscreen = !(entries[0] && entries[0].isIntersecting);
      if (offscreen) stop();
      else start();
    }).observe(canvas);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stop();
    else start();
  });

  canvas.addEventListener("sparq-orb-pause", () => {
    paused = true;
    stop();
    frame(0.6);
  });
  canvas.addEventListener("sparq-orb-play", () => {
    paused = false;
    start();
  });

  frame(0.6);
  start();
  canvas.setAttribute("data-mounted", "1");
}

document.querySelectorAll("canvas[data-orb]").forEach(mount);
