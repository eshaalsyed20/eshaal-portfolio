/* Eshaal Syed portfolio — UI first, then the Three.js hero scene (with CSS fallback). */
const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;
const small = () => innerWidth < 760;

root.classList.add("ready");

/* ---------- nav ---------- */
const nav = $("#nav"), burger = $(".burger");
const setMenu = open => { nav.classList.toggle("open", open); burger.setAttribute("aria-expanded", open); burger.setAttribute("aria-label", open ? "Close menu" : "Open menu"); };
burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
$$("#menu a").forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => e.key === "Escape" && setMenu(false));

/* ---------- scroll reveal (IntersectionObserver) ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
$$(".rv").forEach(el => io.observe(el));

/* ---------- decorative CSS 3D objects ---------- */
if (!reduced) {
  [["#services", "cube", "70px", "6%", "8%"], ["#skills", "", "130px", "auto", "4%"], ["#work", "", "90px", "3%", "34%"]].forEach(([sel, cls, size, left, top], i) => {
    const d = document.createElement("div");
    d.className = "deco " + cls; d.setAttribute("aria-hidden", "true");
    d.style.cssText = `width:${size};height:${size};top:${top};${left === "auto" ? "right:6%" : "left:" + left};animation-delay:${-i * 3}s`;
    d.innerHTML = "<i></i>"; $(sel).appendChild(d);
  });
}

/* ---------- tilt: angle comes from the real cursor position ---------- */
if (finePointer && !reduced) {
  $$(".tilt").forEach(el => {
    const max = el.classList.contains("card") ? 4 : el.classList.contains("portrait") ? 9 : 8;
    let raf = 0;
    el.addEventListener("pointermove", e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.classList.add("moving");
        el.style.setProperty("--ry", ((x - .5) * 2 * max).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((.5 - y) * 2 * max).toFixed(2) + "deg");
        el.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      });
    });
    el.addEventListener("pointerleave", () => {
      cancelAnimationFrame(raf);
      el.classList.remove("moving");
      el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
    });
  });

  /* magnetic buttons */
  $$(".magnetic").forEach(b => {
    b.addEventListener("pointermove", e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });

  /* custom cursor */
  const cur = $(".cursor"); let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  root.classList.add("has-cursor");
  addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function follow() { cx += (tx - cx) * .22; cy += (ty - cy) * .22; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(follow); })();
  $$("[data-cursor]").forEach(el => { el.addEventListener("pointerenter", () => cur.classList.add("view")); el.addEventListener("pointerleave", () => cur.classList.remove("view")); });
  $$("a,button").forEach(el => { el.addEventListener("pointerenter", () => cur.classList.add("link")); el.addEventListener("pointerleave", () => cur.classList.remove("link")); });
}

/* ---------- project image parallax (visible cards only) ---------- */
if (!reduced) {
  const vis = new Set(); let ticking = false;
  const pio = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? vis.add(e.target) : vis.delete(e.target)), { rootMargin: "100px" });
  const imgs = $$(".media");
  imgs.forEach(m => pio.observe(m));
  const update = () => {
    ticking = false;
    const k = small() ? 0 : 1, vh = innerHeight;
    vis.forEach(m => {
      const r = m.getBoundingClientRect(), p = (r.top + r.height / 2 - vh / 2) / vh;
      m.firstElementChild.style.setProperty("--py", (p * -16 * k).toFixed(1) + "px");
    });
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener("resize", update);
}

/* ---------- Three.js hero scene ---------- */
async function initScene() {
  const hero = $(".hero"), canvas = $("#scene");
  let THREE;
  try { THREE = await import(THREE_URL); } catch (e) { return false; }

  // WebGL capability check
  const test = document.createElement("canvas");
  if (!(test.getContext("webgl2") || test.getContext("webgl"))) return false;

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !small(), powerPreference: "low-power" }); }
  catch (e) { return false; }

  const lowEnd = (navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  if (lowEnd) { renderer.dispose(); return false; }

  const mobile = small();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 50);
  camera.position.set(0, 0, 7);

  scene.add(new THREE.AmbientLight(0xffffff, .55));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.2); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb4ff, .9); rim.position.set(-4, -2, -3); scene.add(rim);
  const glow = new THREE.PointLight(0xd9bb8c, 18, 14); glow.position.set(0, 0, 3); scene.add(glow);

  const glass = new THREE.MeshPhysicalMaterial({ color: 0xf4ead8, metalness: .1, roughness: .06, transparent: true, opacity: .32, clearcoat: 1, clearcoatRoughness: .05, side: THREE.DoubleSide });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9bb8c, metalness: .95, roughness: .22 });
  const lineMat = new THREE.LineBasicMaterial({ color: 0xd9bb8c, transparent: true, opacity: .55 });

  const group = new THREE.Group(); scene.add(group);
  const items = [];
  const add = (geo, mat, pos, speed, edges = false, scale = 1) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.scale.setScalar(scale);
    if (edges) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineMat));
    group.add(m);
    items.push({ m, base: pos[1], speed, phase: Math.random() * 6.28 });
    return m;
  };
  const seg = mobile ? 24 : 48;
  add(new THREE.IcosahedronGeometry(1.25, 1), glass, [2.2, .3, 0], .22, true);
  add(new THREE.TorusGeometry(1.05, .07, 16, seg * 2), gold, [3.1, -.2, -1], .3);
  add(new THREE.TorusGeometry(.62, .05, 12, seg), glass, [1.1, 1.7, 1], .5);
  add(new THREE.OctahedronGeometry(.34), gold, [.4, -1.5, 1.5], .6);
  add(new THREE.BoxGeometry(.5, .5, .5), glass, [4.2, 1.6, .5], .45, true);
  add(new THREE.SphereGeometry(.38, seg, seg / 2), glass, [1.6, -1.6, 0], .35);
  add(new THREE.SphereGeometry(.12, 16, 12), gold, [3.8, -1.7, 1], .7);
  add(new THREE.IcosahedronGeometry(.22, 0), gold, [-.6, 1.4, .3], .55);

  // particle field
  const N = mobile ? 90 : 260, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .3) * 14; pos[i * 3 + 1] = (Math.random() - .5) * 8; pos[i * 3 + 2] = (Math.random() - .5) * 9 - 1; }
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xd9bb8c, size: mobile ? .035 : .028, transparent: true, opacity: .7, depthWrite: false });
  const points = new THREE.Points(pGeo, pMat); scene.add(points);

  // sizing
  const resize = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 760 ? 10 : w < 1100 ? 8.5 : 7;
    group.position.x = w < 760 ? -1.2 : w < 1100 ? -.6 : 0;
    camera.updateProjectionMatrix();
    if (!running) draw();
  };

  // pointer
  let mx = 0, my = 0, sx = 0, sy = 0;
  const onMove = e => { mx = (e.clientX / innerWidth - .5) * 2; my = (e.clientY / innerHeight - .5) * 2; };
  addEventListener("pointermove", onMove, { passive: true });

  const clock = new THREE.Clock(); let running = false, raf = 0, heroVisible = true;
  const draw = () => renderer.render(scene, camera);
  const frame = () => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, k = mobile ? .5 : 1;
    items.forEach(o => {
      o.m.rotation.x += dt * o.speed * .6 * k; o.m.rotation.y += dt * o.speed * k;
      o.m.position.y = o.base + Math.sin(t * o.speed * 1.6 + o.phase) * .16 * k;
    });
    points.rotation.y = t * .015; points.position.y = Math.sin(t * .2) * .08;
    sx += (mx - sx) * .045; sy += (my - sy) * .045;                // smoothed pointer
    camera.position.x = sx * .7; camera.position.y = -sy * .45; camera.lookAt(group.position.x + 1.2, 0, 0);
    group.rotation.y = sx * .12; group.rotation.x = sy * .06;
    glow.position.set(sx * 3, -sy * 2, 3);
    draw();
  };
  const start = () => { if (running || reduced || !heroVisible || document.hidden) return; running = true; clock.start(); raf = requestAnimationFrame(frame); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; heroVisible ? start() : stop(); }).observe(hero);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  new ResizeObserver(resize).observe(hero);
  resize(); draw();                                                // first frame (also the static frame for reduced motion)
  if (!reduced) start();

  // context loss -> drop to CSS fallback
  canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); stop(); root.classList.remove("has3d"); });

  // cleanup
  addEventListener("pagehide", () => {
    stop(); removeEventListener("pointermove", onMove);
    items.forEach(o => { o.m.geometry.dispose(); o.m.children.forEach(c => c.geometry?.dispose()); });
    pGeo.dispose(); pMat.dispose(); glass.dispose(); gold.dispose(); lineMat.dispose(); renderer.dispose();
  });
  return true;
}

initScene().then(ok => { if (ok) root.classList.add("has3d"); }).catch(() => root.classList.remove("has3d"));
