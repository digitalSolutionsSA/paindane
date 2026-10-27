import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * The 3D sea behind the hero dive. One scroll value (0 = just under the surface, 1 = on the sea floor)
 * drives the camera down through it; everything else lives on its own: flocking shoals that scatter away
 * from the pointer, a whale shark, glowing orbs, light running along current lines, sunbeams, kelp,
 * rocks, bubbles and caustic light on the sand.
 */
export type OceanDive = {
  setProgress: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  setActive: (active: boolean) => void;
  resize: () => void;
  dispose: () => void;
};

const SURFACE_Y = 0;
const FLOOR_Y = -46;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

const causticGLSL = /* glsl */ `
float caustic(vec2 uv, float t) {
  vec2 p = mod(uv * 6.2831, 6.2831) - 250.0;
  vec2 i = p;
  float c = 1.0;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / 0.005), p.y / (cos(i.y + tt) / 0.005)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}`;

/** A fish: tapered, flattened body with a forked tail and dorsal fin. Head points +Z; back is +Y. */
function fishGeometry(opts: { height?: number; width?: number; taper?: number } = {}) {
  const { height = 0.38, width = 0.16, taper = 0.6 } = opts;
  const body = new THREE.SphereGeometry(1, 28, 18);
  body.rotateZ(Math.PI / 2); // poles along X
  const p = body.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const k = x < 0 ? 1 + x * taper : 1 - x * x * 0.15; // narrow towards the tail, rounded head
    p.setXYZ(i, x, p.getY(i) * height * k + (x > 0.6 ? -0.04 * (x - 0.6) : 0), p.getZ(i) * width * k);
  }
  body.computeVertexNormals();

  const tailShape = new THREE.Shape();
  tailShape.moveTo(-0.85, 0);
  tailShape.lineTo(-1.6, 0.52);
  tailShape.quadraticCurveTo(-1.36, 0.05, -1.38, 0);
  tailShape.quadraticCurveTo(-1.36, -0.05, -1.6, -0.52);
  tailShape.lineTo(-0.85, 0);
  const tail = new THREE.ShapeGeometry(tailShape, 6);

  const dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(0.35, height * 0.8);
  dorsalShape.quadraticCurveTo(0.0, height * 1.7, -0.4, height * 0.7);
  dorsalShape.lineTo(0.35, height * 0.8);
  const dorsal = new THREE.ShapeGeometry(dorsalShape, 6);

  const pelvicShape = new THREE.Shape();
  pelvicShape.moveTo(0.2, -height * 0.75);
  pelvicShape.lineTo(-0.15, -height * 1.25);
  pelvicShape.lineTo(-0.2, -height * 0.7);
  const pelvic = new THREE.ShapeGeometry(pelvicShape, 2);

  const geo = mergeGeometries([body.toNonIndexed(), tail.toNonIndexed(), dorsal.toNonIndexed(), pelvic.toNonIndexed()])!;
  // Countershading: dark back, pale belly (multiplied by each fish's own colour)
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / height;
    const isBody = Math.abs(pos.getZ(i)) > 0.0001 || Math.abs(y) < 0.98;
    const shade = isBody ? THREE.MathUtils.clamp(0.95 - (y + 0.2) * 0.75, 0.32, 1) : 0.7;
    colors.set([shade, shade, Math.min(1, shade * 1.05)], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.rotateY(-Math.PI / 2); // head to +Z so lookAt() points it along its velocity
  return geo;
}

/** Adds the swimming wave (stronger towards the tail) to a standard material, per instance phase/speed. */
function swimMaterial(shared: { uTime: { value: number } }, params: THREE.MeshStandardMaterialParameters, spots = false) {
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, ...params });
  mat.onBeforeCompile = (s) => {
    s.uniforms.uTime = shared.uTime;
    s.vertexShader = s.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        attribute float aPhase;
        attribute float aSpeed;
        varying vec3 vLocal;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vLocal = position;
        float tailW = smoothstep(0.7, -1.6, position.z);
        transformed.x += sin(uTime * aSpeed * 7.0 + aPhase - position.z * 2.6) * 0.2 * tailW;`,
      );
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vLocal;`)
      .replace(
        '#include <color_fragment>',
        spots
          ? `#include <color_fragment>
          vec2 g = vLocal.zy * vec2(16.0, 10.0);
          vec2 f = fract(g) - 0.5;
          float spot = smoothstep(0.24, 0.14, length(f)) * step(-0.05, vLocal.y);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.9, 0.92), spot * 0.85);`
          : `#include <color_fragment>
          // Silvery lateral stripe and a little sparkle
          float stripe = smoothstep(0.035, 0.0, abs(vLocal.y - 0.02)) * step(-0.9, vLocal.z);
          diffuseColor.rgb += stripe * 0.25;`,
      );
  };
  return mat;
}

type SchoolOpts = {
  count: number;
  color: THREE.ColorRepresentation | THREE.ColorRepresentation[];
  scale: number;
  speed: [number, number];
  neighbour: number;
  separation: number;
  cohesion: number;
  align: number;
  seek: number;
  /** Where the shoal wanders: centre and range */
  home: THREE.Vector3;
  range: THREE.Vector3;
  wander: number;
};

class School {
  mesh: THREE.InstancedMesh;
  pos: Float32Array;
  vel: Float32Array;
  sizes: Float32Array;
  o: SchoolOpts;
  seed = Math.random() * 100;
  private dummy = new THREE.Object3D();
  private tmp = new THREE.Vector3();
  private target = new THREE.Vector3();

  constructor(geo: THREE.BufferGeometry, mat: THREE.Material, o: SchoolOpts) {
    this.o = o;
    const g = geo.clone();
    const phase = new Float32Array(o.count);
    const speed = new Float32Array(o.count);
    for (let i = 0; i < o.count; i++) {
      phase[i] = Math.random() * Math.PI * 2;
      speed[i] = rand(0.8, 1.3) / Math.sqrt(o.scale);
    }
    g.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1));
    g.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(speed, 1));
    this.mesh = new THREE.InstancedMesh(g, mat, o.count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.pos = new Float32Array(o.count * 3);
    this.vel = new Float32Array(o.count * 3);
    this.sizes = new Float32Array(o.count);
    const palette = Array.isArray(o.color) ? o.color : [o.color];
    const c = new THREE.Color();
    for (let i = 0; i < o.count; i++) {
      this.pos.set([o.home.x + rand(-4, 4), o.home.y + rand(-2, 2), o.home.z + rand(-4, 4)], i * 3);
      this.vel.set([rand(-1, 1), rand(-0.2, 0.2), rand(-1, 1)], i * 3);
      this.sizes[i] = o.scale * rand(0.8, 1.2);
      c.set(palette[i % palette.length]).offsetHSL(0, 0, rand(-0.05, 0.05));
      this.mesh.setColorAt(i, c);
    }
  }

  update(dt: number, t: number, ray: THREE.Ray | null) {
    const { o, pos, vel } = this;
    const n = o.count;
    const s = t * o.wander + this.seed;
    this.target.set(
      o.home.x + Math.sin(s * 0.9) * o.range.x,
      o.home.y + Math.sin(s * 1.3 + 1) * o.range.y,
      o.home.z + Math.cos(s * 0.7) * o.range.z,
    );
    const nb2 = o.neighbour * o.neighbour;
    const sep2 = o.separation * o.separation;
    for (let i = 0; i < n; i++) {
      const ix = i * 3;
      const px = pos[ix], py = pos[ix + 1], pz = pos[ix + 2];
      let cx = 0, cy = 0, cz = 0, ax = 0, ay = 0, az = 0, sx = 0, sy = 0, sz = 0, cnt = 0;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const jx = j * 3;
        const dx = pos[jx] - px, dy = pos[jx + 1] - py, dz = pos[jx + 2] - pz;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > nb2) continue;
        cnt++;
        cx += pos[jx]; cy += pos[jx + 1]; cz += pos[jx + 2];
        ax += vel[jx]; ay += vel[jx + 1]; az += vel[jx + 2];
        if (d2 < sep2) {
          const k = 1 / (d2 + 0.01);
          sx -= dx * k; sy -= dy * k; sz -= dz * k;
        }
      }
      let fx = (this.target.x - px) * o.seek, fy = (this.target.y - py) * o.seek, fz = (this.target.z - pz) * o.seek;
      if (cnt) {
        fx += (cx / cnt - px) * o.cohesion + (ax / cnt - vel[ix]) * o.align;
        fy += (cy / cnt - py) * o.cohesion + (ay / cnt - vel[ix + 1]) * o.align;
        fz += (cz / cnt - pz) * o.cohesion + (az / cnt - vel[ix + 2]) * o.align;
      }
      fx += sx * 0.6; fy += sy * 0.6; fz += sz * 0.6;
      // Stay between the surface and the floor
      if (py > SURFACE_Y - 2.5) fy -= (py - (SURFACE_Y - 2.5)) * 2;
      if (py < FLOOR_Y + 3) fy += (FLOOR_Y + 3 - py) * 2;
      // Dart away from the pointer
      if (ray) {
        this.tmp.set(px, py, pz);
        const d2 = ray.distanceSqToPoint(this.tmp);
        if (d2 < 18) {
          const closest = ray.closestPointToPoint(this.tmp, new THREE.Vector3());
          this.tmp.sub(closest).normalize().multiplyScalar((18 - d2) * 1.6);
          fx += this.tmp.x; fy += this.tmp.y; fz += this.tmp.z;
        }
      }
      let vx = vel[ix] + fx * dt, vy = (vel[ix + 1] + fy * dt) * 0.98, vz = vel[ix + 2] + fz * dt;
      const sp = Math.hypot(vx, vy, vz) || 1;
      const clamp = THREE.MathUtils.clamp(sp, o.speed[0], o.speed[1]) / sp;
      vx *= clamp; vy *= clamp; vz *= clamp;
      vel[ix] = vx; vel[ix + 1] = vy; vel[ix + 2] = vz;
      pos[ix] = px + vx * dt; pos[ix + 1] = py + vy * dt; pos[ix + 2] = pz + vz * dt;

      this.dummy.position.set(pos[ix], pos[ix + 1], pos[ix + 2]);
      this.tmp.set(pos[ix] + vx, pos[ix + 1] + vy, pos[ix + 2] + vz);
      this.dummy.lookAt(this.tmp);
      this.dummy.scale.setScalar(this.sizes[i]);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

export function createOceanDive(canvas: HTMLCanvasElement): OceanDive {
  const small = window.innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const shallow = new THREE.Color('#1c93c4');
  const deep = new THREE.Color('#02192b');
  scene.background = shallow.clone();
  const fog = new THREE.FogExp2(shallow.clone(), 0.02);
  scene.fog = fog;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 220);
  const shared = { uTime: { value: 0 } };

  // ---------- Light ----------
  const hemi = new THREE.HemisphereLight('#c8f1ff', '#06283d', 1.4);
  const sun = new THREE.DirectionalLight('#fff4d6', 2.4);
  sun.position.set(12, 40, 8);
  scene.add(hemi, sun);

  // ---------- The surface, seen from below ----------
  const surfaceMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uTime: shared.uTime, uFade: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uFade;
      ${causticGLSL}
      void main() {
        vec2 p = vUv * 18.0;
        float c = caustic(p * 0.35 + vec2(uTime * 0.02, 0.0), uTime * 0.5);
        float win = smoothstep(0.45, 0.0, length(vUv - 0.5));
        vec3 col = mix(vec3(0.18, 0.62, 0.8), vec3(0.88, 0.99, 1.0), clamp(c * 1.4 + win * 0.6, 0.0, 1.0));
        gl_FragColor = vec4(col, uFade * (0.55 + win * 0.45));
      }`,
  });
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), surfaceMat);
  surface.rotation.x = Math.PI / 2;
  surface.position.y = SURFACE_Y;
  scene.add(surface);

  // ---------- Sunbeams ----------
  const beamMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uTime: shared.uTime, uIntensity: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;
      void main() {
        float edge = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
        float fall = pow(vUv.y, 1.6);
        float flick = 0.75 + 0.25 * sin(uTime * 0.6 + vUv.x * 6.0);
        gl_FragColor = vec4(vec3(0.65, 0.9, 1.0), edge * fall * flick * 0.16 * uIntensity);
      }`,
  });
  const beams: THREE.Mesh[] = [];
  for (let i = 0; i < 14; i++) {
    const w = rand(2, 6);
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(w, 70), beamMat);
    beam.position.set(rand(-30, 30), SURFACE_Y - 35, rand(-30, 20));
    beam.userData = { tilt: rand(-0.25, -0.1), sway: rand(0, 6) };
    beams.push(beam);
    scene.add(beam);
  }

  // ---------- Sea floor with caustics ----------
  const floorGeo = new THREE.PlaneGeometry(260, 260, small ? 90 : 160, small ? 90 : 160);
  floorGeo.rotateX(-Math.PI / 2);
  const fp = floorGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < fp.count; i++) {
    const x = fp.getX(i), z = fp.getZ(i);
    fp.setY(i, Math.sin(x * 0.08) * 1.4 + Math.cos(z * 0.06 + x * 0.03) * 1.8 + Math.sin(x * 0.6 + z * 0.4) * 0.12);
  }
  floorGeo.computeVertexNormals();
  const floorMat = new THREE.MeshStandardMaterial({ color: '#9a8963', roughness: 1, envMapIntensity: 0.2 });
  floorMat.onBeforeCompile = (s) => {
    s.uniforms.uTime = shared.uTime;
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWorld;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWorld;\nuniform float uTime;\n${causticGLSL}`)
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float ripple = sin(vWorld.x * 2.2 + sin(vWorld.z * 0.7) * 2.0) * 0.5 + 0.5;
        diffuseColor.rgb *= 0.85 + ripple * 0.2;
        totalEmissiveRadiance += vec3(0.55, 0.85, 0.95) * caustic(vWorld.xz * 0.07, uTime * 0.45) * 0.55;`,
      );
  };
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = FLOOR_Y;
  scene.add(floor);

  // Rocks and coral heads
  const rockMat = new THREE.MeshStandardMaterial({ color: '#2d4a52', roughness: 0.95, flatShading: true, envMapIntensity: 0.3 });
  const coralMat = new THREE.MeshStandardMaterial({ color: '#8a7a56', roughness: 0.8, envMapIntensity: 0.3 });
  for (let i = 0; i < 26; i++) {
    const coral = i % 3 === 0;
    const g = new THREE.IcosahedronGeometry(rand(1.2, coral ? 2.6 : 4.5), 2);
    const gp = g.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < gp.count; k++) {
      const v = new THREE.Vector3().fromBufferAttribute(gp, k);
      v.multiplyScalar(1 + Math.sin(v.x * 2.1) * 0.12 + Math.cos(v.y * 1.7 + v.z) * 0.12);
      gp.setXYZ(k, v.x, v.y * (coral ? 0.6 : 0.7), v.z);
    }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, coral ? coralMat : rockMat);
    m.position.set(rand(-60, 60), FLOOR_Y + rand(0, 1.2), rand(-60, 30));
    m.rotation.y = rand(0, Math.PI);
    scene.add(m);
  }

  // Swaying kelp
  const kelpCount = small ? 70 : 140;
  const kelpGeo = new THREE.PlaneGeometry(0.22, 7, 1, 14);
  kelpGeo.translate(0, 3.5, 0);
  const kelpMat = new THREE.MeshStandardMaterial({ color: '#1f5e43', roughness: 0.7, side: THREE.DoubleSide, envMapIntensity: 0.3 });
  kelpMat.onBeforeCompile = (s) => {
    s.uniforms.uTime = shared.uTime;
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float ph = instanceMatrix[3].x * 0.3 + instanceMatrix[3].z * 0.2;
      float bend = pow(uv.y, 1.6);
      transformed.x += sin(uTime * 0.9 + ph + position.y * 0.35) * 1.4 * bend;
      transformed.z += cos(uTime * 0.7 + ph) * 0.6 * bend;`,
    );
  };
  const kelp = new THREE.InstancedMesh(kelpGeo, kelpMat, kelpCount);
  const kd = new THREE.Object3D();
  for (let i = 0; i < kelpCount; i++) {
    const cluster = i % 8;
    kd.position.set(rand(-5, 5) + (cluster - 4) * 15, FLOOR_Y + 0.5, rand(-5, 5) - 18 - ((cluster * 29) % 40));
    kd.rotation.y = rand(0, Math.PI);
    kd.scale.set(1, rand(0.5, 1.3), 1);
    kd.updateMatrix();
    kelp.setMatrixAt(i, kd.matrix);
  }
  kelp.frustumCulled = false;
  scene.add(kelp);

  // ---------- Fish ----------
  const fishGeo = fishGeometry();
  const fishMat = swimMaterial(shared, { metalness: 0.35, roughness: 0.32, envMapIntensity: 0.7 });
  const schools = [
    new School(fishGeo, fishMat, {
      count: small ? 140 : 260,
      color: ['#d6e6ef', '#c4d9e4'],
      scale: 0.42,
      speed: [3.2, 6],
      neighbour: 3.2,
      separation: 0.9,
      cohesion: 0.55,
      align: 1.6,
      seek: 0.12,
      home: new THREE.Vector3(0, -14, -4),
      range: new THREE.Vector3(18, 6, 12),
      wander: 0.05,
    }),
    new School(fishGeo, fishMat, {
      count: small ? 18 : 30,
      color: '#f2c21b',
      scale: 0.75,
      speed: [1.4, 2.6],
      neighbour: 5,
      separation: 1.8,
      cohesion: 0.25,
      align: 0.8,
      seek: 0.08,
      home: new THREE.Vector3(-8, -30, -2),
      range: new THREE.Vector3(14, 5, 10),
      wander: 0.04,
    }),
    new School(fishGeo, fishMat, {
      count: small ? 18 : 30,
      color: ['#2f6fe0', '#2459c4'],
      scale: 0.8,
      speed: [1.6, 2.8],
      neighbour: 5,
      separation: 1.8,
      cohesion: 0.25,
      align: 0.8,
      seek: 0.08,
      home: new THREE.Vector3(10, -36, -8),
      range: new THREE.Vector3(14, 4, 10),
      wander: 0.035,
    }),
    new School(fishGeo, fishMat, {
      count: 8,
      color: '#9fb7c6',
      scale: 2,
      speed: [2.2, 3.4],
      neighbour: 8,
      separation: 4,
      cohesion: 0.08,
      align: 0.3,
      seek: 0.05,
      home: new THREE.Vector3(0, -22, -14),
      range: new THREE.Vector3(26, 8, 14),
      wander: 0.03,
    }),
  ];
  schools.forEach((s) => scene.add(s.mesh));

  // Whale shark: a long, broad version of the fish with pale spots, cruising slowly across
  const sharkGeo = fishGeometry({ height: 0.24, width: 0.2, taper: 0.7 });
  sharkGeo.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(sharkGeo.attributes.position.count), 1));
  sharkGeo.setAttribute('aSpeed', new THREE.BufferAttribute(new Float32Array(sharkGeo.attributes.position.count).fill(0.22), 1));
  const sharkMat = swimMaterial(shared, { color: '#5b7685', metalness: 0.1, roughness: 0.6, envMapIntensity: 0.3 }, true);
  const shark = new THREE.Mesh(sharkGeo, sharkMat);
  shark.scale.setScalar(9);
  scene.add(shark);

  // ---------- Glowing orbs ----------
  const orbVert = /* glsl */ `
    uniform float uTime;
    uniform float uPixel;
    attribute float aSize;
    attribute float aPhase;
    attribute vec3 aColor;
    varying vec3 vColor;
    varying float vTw;
    void main() {
      vec3 p = position;
      p.x += sin(uTime * 0.25 + aPhase) * 1.2;
      p.y += sin(uTime * 0.35 + aPhase * 1.7) * 0.8;
      p.z += cos(uTime * 0.2 + aPhase) * 1.2;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = aSize * uPixel * (60.0 / -mv.z);
      vColor = aColor;
      vTw = 0.55 + 0.45 * sin(uTime * 1.6 + aPhase * 3.0);
    }`;
  const orbFrag = /* glsl */ `
    uniform float uGlow;
    varying vec3 vColor;
    varying float vTw;
    void main() {
      float d = length(gl_PointCoord - 0.5) * 2.0;
      float core = smoothstep(1.0, 0.0, d);
      float a = pow(core, 2.2) * vTw * uGlow;
      gl_FragColor = vec4(vColor * (1.0 + core), a);
    }`;
  const makeOrbs = (count: number, sizeRange: [number, number], spread: number, glow: number) => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const palette = [new THREE.Color('#7fe7ff'), new THREE.Color('#4fd1c5'), new THREE.Color('#ffd27a'), new THREE.Color('#a7f3ff')];
    for (let i = 0; i < count; i++) {
      pos.set([rand(-spread, spread), rand(FLOOR_Y + 2, SURFACE_Y - 3), rand(-50, 26)], i * 3);
      size[i] = rand(sizeRange[0], sizeRange[1]);
      phase[i] = rand(0, 100);
      palette[i % palette.length].toArray(col, i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: shared.uTime, uPixel: { value: renderer.getPixelRatio() }, uGlow: { value: glow } },
      vertexShader: orbVert,
      fragmentShader: orbFrag,
    });
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    return pts;
  };
  const orbs = makeOrbs(small ? 450 : 900, [0.9, 3.2], 45, 0.6);
  const bokeh = makeOrbs(small ? 20 : 40, [10, 26], 25, 0.18);
  scene.add(orbs, bokeh);

  // Marine snow
  const snowGeo = new THREE.BufferGeometry();
  const snowCount = small ? 900 : 1800;
  const snowPos = new Float32Array(snowCount * 3);
  for (let i = 0; i < snowCount; i++) snowPos.set([rand(-40, 40), rand(FLOOR_Y, SURFACE_Y), rand(-50, 30)], i * 3);
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const snow = new THREE.Points(
    snowGeo,
    new THREE.PointsMaterial({ color: '#cdeefa', size: 0.08, transparent: true, opacity: 0.55, depthWrite: false }),
  );
  scene.add(snow);

  // Bubbles rising from the floor
  const bubbleCount = small ? 90 : 180;
  const bubbleGeo = new THREE.BufferGeometry();
  const bPos = new Float32Array(bubbleCount * 3);
  const bPhase = new Float32Array(bubbleCount);
  const vents = [new THREE.Vector3(-14, 0, -6), new THREE.Vector3(9, 0, -16), new THREE.Vector3(22, 0, 4)];
  for (let i = 0; i < bubbleCount; i++) {
    const v = vents[i % vents.length];
    bPos.set([v.x + rand(-0.6, 0.6), 0, v.z + rand(-0.6, 0.6)], i * 3);
    bPhase[i] = rand(0, 46);
  }
  bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
  bubbleGeo.setAttribute('aPhase', new THREE.BufferAttribute(bPhase, 1));
  const bubbles = new THREE.Points(
    bubbleGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: shared.uTime, uPixel: { value: renderer.getPixelRatio() } },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uPixel;
        attribute float aPhase;
        void main() {
          vec3 p = position;
          float h = mod(aPhase + uTime * 2.4, 46.0);
          p.y = ${FLOOR_Y.toFixed(1)} + h;
          p.x += sin(h * 1.3 + aPhase) * 0.3;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (2.0 + fract(aPhase) * 4.0) * uPixel * (40.0 / -mv.z);
        }`,
      fragmentShader: /* glsl */ `
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float ring = smoothstep(1.0, 0.8, d) * smoothstep(0.45, 0.8, d);
          float glint = smoothstep(0.35, 0.0, length(gl_PointCoord - vec2(0.35, 0.3)));
          gl_FragColor = vec4(vec3(0.9, 0.98, 1.0), ring * 0.7 + glint * 0.8);
        }`,
    }),
  );
  bubbles.frustumCulled = false;
  scene.add(bubbles);

  // ---------- Current lines: glowing threads with pulses of light running along them ----------
  const lineMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: shared.uTime, uGlow: { value: 0.6 } },
    vertexShader: /* glsl */ `
      attribute float aOffset;
      varying float vT;
      varying float vOff;
      void main() {
        vT = uv.x;
        vOff = aOffset;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uGlow;
      varying float vT;
      varying float vOff;
      void main() {
        float head = fract(vT - uTime * 0.07 - vOff);
        float pulse = smoothstep(0.0, 0.02, head) * pow(1.0 - smoothstep(0.02, 0.35, head), 2.0);
        float ends = smoothstep(0.0, 0.1, vT) * smoothstep(1.0, 0.9, vT);
        vec3 col = mix(vec3(0.3, 0.85, 1.0), vec3(1.0, 0.85, 0.5), smoothstep(0.6, 1.0, vOff));
        gl_FragColor = vec4(col, (0.05 + pulse * 0.9) * ends * uGlow);
      }`,
  });
  const lineCount = small ? 14 : 26;
  for (let i = 0; i < lineCount; i++) {
    const y = rand(FLOOR_Y + 6, SURFACE_Y - 6);
    const z = rand(-40, 14);
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 6; k++) {
      pts.push(new THREE.Vector3(-55 + k * 18 + rand(-4, 4), y + Math.sin(k * 1.3 + i) * rand(1, 4), z + rand(-6, 6)));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.TubeGeometry(curve, 180, rand(0.025, 0.06), 5, false);
    tube.setAttribute('aOffset', new THREE.BufferAttribute(new Float32Array(tube.attributes.position.count).fill(Math.random()), 1));
    scene.add(new THREE.Mesh(tube, lineMat));
  }

  // ---------- Camera, scroll and pointer ----------
  let progress = 0;
  let shown = 0;
  const pointer = new THREE.Vector2(0, 0);
  const pointerSmooth = new THREE.Vector2(0, 0);
  let pointerActive = false;
  const raycaster = new THREE.Raycaster();
  const lookTarget = new THREE.Vector3();
  const tmpColor = new THREE.Color();

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 700 ? 68 : 55;
    camera.updateProjectionMatrix();
  };
  resize();

  const clock = new THREE.Clock();
  let raf = 0;
  let active = true;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const frame = () => {
    raf = still ? 0 : requestAnimationFrame(frame);
    if (!active && !still) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    shared.uTime.value = t;

    shown += (progress - shown) * Math.min(1, dt * 4);
    const p = ease(THREE.MathUtils.clamp(shown, 0, 1));
    pointerSmooth.lerp(pointer, Math.min(1, dt * 2.5));

    // Descend from just under the surface (looking up at it) down to the reef
    camera.position.set(Math.sin(t * 0.12) * 1.5 + pointerSmooth.x * 2.5, lerp(-2.5, -33, p) + pointerSmooth.y * 1.2, lerp(26, -4, p));
    const pitch = lerp(0.42, -0.2, p);
    lookTarget.set(camera.position.x * 0.6 + Math.sin(t * 0.08) * 2, camera.position.y + Math.tan(pitch) * 30, camera.position.z - 30);
    camera.lookAt(lookTarget);

    tmpColor.copy(shallow).lerp(deep, p);
    (scene.background as THREE.Color).copy(tmpColor);
    fog.color.copy(tmpColor);
    fog.density = lerp(0.018, 0.04, p);
    hemi.intensity = lerp(1.5, 0.45, p);
    sun.intensity = lerp(2.6, 0.6, p);
    surfaceMat.uniforms.uFade.value = 1 - THREE.MathUtils.smoothstep(p, 0.05, 0.45);
    beamMat.uniforms.uIntensity.value = lerp(1.2, 0.35, p);
    // Bioluminescence: orbs and threads glow brighter the deeper you go
    (orbs.material as THREE.ShaderMaterial).uniforms.uGlow.value = lerp(0.6, 1.6, p);
    (bokeh.material as THREE.ShaderMaterial).uniforms.uGlow.value = lerp(0.12, 0.3, p);
    lineMat.uniforms.uGlow.value = lerp(0.45, 1.2, p);

    for (const b of beams) {
      b.rotation.set(0, Math.atan2(camera.position.x - b.position.x, camera.position.z - b.position.z), b.userData.tilt + Math.sin(t * 0.2 + b.userData.sway) * 0.03);
    }

    snow.position.y = -((t * 0.4) % 6);

    let ray: THREE.Ray | null = null;
    if (pointerActive) {
      raycaster.setFromCamera(pointer, camera);
      ray = raycaster.ray;
    }
    for (const s of schools) s.update(dt, t, ray);

    // Whale shark glides across the deep in a long, slow loop
    const sx = 70 - ((t * 2.2) % 140);
    shark.position.set(sx, -26 + Math.sin(t * 0.15) * 2, -22);
    shark.lookAt(sx - 10, shark.position.y + Math.cos(t * 0.15) * 0.3, -22);

    renderer.render(scene, camera);
  };
  frame();

  return {
    setProgress: (p) => {
      progress = p;
      if (still) frame();
    },
    setPointer: (x, y) => {
      pointer.set(x, y);
      pointerActive = true;
    },
    setActive: (a) => {
      active = a;
      if (a) clock.getDelta();
    },
    resize,
    dispose: () => {
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mat) => mat.dispose());
      });
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
