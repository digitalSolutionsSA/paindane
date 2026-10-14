import * as THREE from 'three';

/**
 * Animated low-poly ocean surface with floating light particles.
 * Rendered on a transparent canvas so it can sit over the hero photos.
 */
export function createOceanScene(container: HTMLElement, opts: { particles?: number; waveOpacity?: number } = {}) {
  const { particles = 900, waveOpacity = 0.55 } = opts;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x304b66, 18, 60);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 4.2, 14);
  camera.lookAt(0, 0, -6);

  // Ocean surface
  const geo = new THREE.PlaneGeometry(90, 70, 160, 120);
  geo.rotateX(-Math.PI / 2);
  const uniforms = {
    uTime: { value: 0 },
    uDeep: { value: new THREE.Color('#0f2a40') },
    uShallow: { value: new THREE.Color('#2fb4c6') },
    uFoam: { value: new THREE.Color('#f4ead8') },
    uOpacity: { value: waveOpacity },
    uMouse: { value: new THREE.Vector2(0, 0) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    wireframe: false,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uMouse;
      varying float vH;
      varying vec3 vPos;
      float wave(vec2 p, vec2 dir, float freq, float speed, float amp){
        return sin(dot(p, dir) * freq + uTime * speed) * amp;
      }
      void main(){
        vec3 p = position;
        float h = 0.0;
        h += wave(p.xz, normalize(vec2(1.0, 0.6)), 0.35, 1.1, 0.55);
        h += wave(p.xz, normalize(vec2(-0.7, 1.0)), 0.55, 1.6, 0.28);
        h += wave(p.xz, normalize(vec2(0.2, -1.0)), 1.1, 2.2, 0.12);
        h += wave(p.xz, normalize(vec2(0.9, 0.1)), 2.3, 3.0, 0.05);
        // gentle swell that follows the pointer
        h += exp(-length(p.xz - uMouse * vec2(14.0, 8.0)) * 0.25) * 0.6 * sin(uTime * 2.0);
        p.y += h;
        vH = h;
        vPos = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      uniform vec3 uFoam;
      uniform float uOpacity;
      varying float vH;
      varying vec3 vPos;
      void main(){
        float t = smoothstep(-0.7, 0.9, vH);
        vec3 col = mix(uDeep, uShallow, t);
        col = mix(col, uFoam, smoothstep(0.75, 1.15, vH));
        // fade out towards the horizon and the edges
        float fade = smoothstep(-34.0, -6.0, vPos.z) * (1.0 - smoothstep(30.0, 44.0, abs(vPos.x)));
        float alpha = uOpacity * (0.35 + t * 0.65);
        gl_FragColor = vec4(col, alpha * fade);
      }
    `,
  });
  const ocean = new THREE.Mesh(geo, mat);
  ocean.position.y = -2.2;
  scene.add(ocean);

  // Glinting particles (sun sparkles / sea spray)
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(particles * 3);
  const seeds = new Float32Array(particles);
  for (let i = 0; i < particles; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 60;
    pos[i * 3 + 1] = Math.random() * 14 - 2;
    pos[i * 3 + 2] = (Math.random() - 0.8) * 40;
    seeds[i] = Math.random() * 100;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  const pMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: uniforms.uTime, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPx;
      attribute float aSeed;
      varying float vA;
      void main(){
        vec3 p = position;
        p.y += sin(uTime * 0.4 + aSeed) * 0.6;
        p.x += cos(uTime * 0.2 + aSeed) * 0.8;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (2.0 + mod(aSeed, 3.0)) * uPx * (12.0 / -mv.z);
        vA = 0.35 + 0.65 * abs(sin(uTime * 1.3 + aSeed));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * vA;
        gl_FragColor = vec4(1.0, 0.95, 0.85, a);
      }
    `,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // Sizing
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // Pointer parallax
  const target = new THREE.Vector2();
  const onMove = (e: PointerEvent) => {
    target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('pointermove', onMove);

  // Only render while visible
  let visible = true;
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  io.observe(container);

  const clock = new THREE.Clock();
  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const dt = clock.getDelta();
    uniforms.uTime.value += reduceMotion ? dt * 0.15 : dt;
    uniforms.uMouse.value.lerp(target, 0.04);
    camera.position.x += (target.x * 1.5 - camera.position.x) * 0.03;
    camera.position.y += (4.2 - target.y * 0.8 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, -6);
    points.rotation.y += dt * 0.01;
    renderer.render(scene, camera);
  };
  tick();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    geo.dispose();
    mat.dispose();
    pGeo.dispose();
    pMat.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
