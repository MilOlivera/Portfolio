"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Vector3, type Mesh, type ShaderMaterial } from "three";
import { useBoatTelemetry } from "./BoatTelemetry";
import { FOG_FAR, FOG_NEAR, HORIZON_HEX, SUN_POSITION, WATER_SEGMENTS, WATER_SIZE } from "./environment";

// Río de la Plata: murky blue-green-grey, calm water. Three Gerstner waves are evaluated in
// WORLD space, so the plane can follow the boat (snapped to its own vertex
// grid) without the wave pattern sliding along with it — the water stays put
// while you sail over it, and the plane's edge never comes into view.

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveHeight;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vHeight;
  varying vec2 vUv;

  // dir, frequency (wave number), amplitude, speed
  const int WAVES = 3;
  const vec2  DIR[3]   = vec2[3](vec2(1.0, 0.0), vec2(0.7071, 0.7071), vec2(-0.4061, 0.9138) /* normalize(-0.4, 0.9) */);
  const float FREQ[3]  = float[3](0.3, 0.5, 0.9);
  const float AMP[3]   = float[3](0.12, 0.08, 0.05);
  const float SPEED[3] = float[3](0.8, 1.2, 1.5);
  const float STEEPNESS = 0.6; // Gerstner Q: sharper crests, flatter troughs

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec2 p = world.xz;
    float scale = uWaveHeight / 0.1; // 0.1 = default calm river

    vec3 offset = vec3(0.0);
    vec3 n = vec3(0.0, 1.0, 0.0);
    for (int i = 0; i < WAVES; i++) {
      float a = AMP[i] * scale;
      float k = FREQ[i];
      float f = k * dot(DIR[i], p) - SPEED[i] * uTime;
      float c = cos(f);
      float s = sin(f);
      offset.x += STEEPNESS * a * DIR[i].x * c;
      offset.z += STEEPNESS * a * DIR[i].y * c;
      offset.y += a * s;
      // analytic Gerstner normal
      n.x -= DIR[i].x * k * a * c;
      n.z -= DIR[i].y * k * a * c;
      n.y -= STEEPNESS * k * a * s;
    }

    world.xyz += offset;
    vWorldPosition = world.xyz;
    vNormal = normalize(n);
    vHeight = offset.y / max(scale * 0.25, 1e-4); // ≈ -1..1
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uHorizonColor;
  uniform vec3 uSunDirection;
  uniform float uFogNear;
  uniform float uFogFar;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vHeight;
  varying vec2 vUv;

  const vec3 BASE   = vec3(0.33, 0.42, 0.40); // #547069 murky blue-green-grey
  const vec3 TROUGH = vec3(0.20, 0.27, 0.26); // #344541 deep murky shade

  void main() {
    vec3 n = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // Crests vs troughs: wave height + how flat the surface is
    float crest = clamp(0.5 + 0.5 * vHeight, 0.0, 1.0) * smoothstep(0.90, 1.0, n.y);
    vec3 color = mix(TROUGH, BASE, crest);

    // Soft sun shading + a faint glint
    float diffuse = 0.75 + 0.25 * max(dot(n, uSunDirection), 0.0);
    color *= diffuse;
    vec3 h = normalize(uSunDirection + viewDir);
    color += vec3(1.0, 0.9, 0.75) * pow(max(dot(n, h), 0.0), 64.0) * 0.15;

    // Fresnel: at grazing angles the water reflects the hazy sky
    float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 4.0);
    color = mix(color, uHorizonColor, fresnel * 0.6);

    // Melt into the hazy horizon (same range as the scene fog)
    float d = length(vWorldPosition.xz - cameraPosition.xz);
    color = mix(color, uHorizonColor, smoothstep(uFogNear, uFogFar * 0.7, d));

    gl_FragColor = vec4(color, 1.0);
  }
`;

const CELL = WATER_SIZE / WATER_SEGMENTS;

export default function Water({ waveHeight = 0.1 }: { waveHeight?: number }) {
  const telemetry = useBoatTelemetry();
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(() => {
    // This shader writes raw (sRGB) values with no color management, so the
    // horizon is passed as plain sRGB components to match the fog visually.
    const horizon = new Color(HORIZON_HEX).convertLinearToSRGB();
    return {
      uTime: { value: 0 },
      uWaveHeight: { value: 0.1 },
      uHorizonColor: { value: new Vector3(horizon.r, horizon.g, horizon.b) },
      uSunDirection: { value: new Vector3(...SUN_POSITION).normalize() },
      uFogNear: { value: FOG_NEAR },
      uFogFar: { value: FOG_FAR },
    };
  }, []); // created once; uWaveHeight is synced every frame below

  useFrame(({ clock }) => {
    const m = material.current;
    if (m) {
      m.uniforms.uTime.value = clock.elapsedTime;
      m.uniforms.uWaveHeight.value = waveHeight;
    }
    // Follow the boat, snapped to the vertex grid so samples never swim
    const t = telemetry.current;
    if (mesh.current) {
      mesh.current.position.x = Math.round(t.x / CELL) * CELL;
      mesh.current.position.z = Math.round(t.z / CELL) * CELL;
    }
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
      <planeGeometry args={[WATER_SIZE, WATER_SIZE, WATER_SEGMENTS, WATER_SEGMENTS]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
