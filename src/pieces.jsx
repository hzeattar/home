"use client";

import { createContext, useContext, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "./store";

// --- palette ---------------------------------------------------------------
const C = {
  wall: "#b8bfce",
  wood: "#8a5a3c",
  woodDark: "#5f3f28",
  floor: "#7a5a3e",
  metal: "#2b3040",
  fabricBlue: "#6d8cc9",
  fabricBlueLt: "#8aa4da",
  fabricCoral: "#e08a63",
  green: "#4c9d63",
  terra: "#c96f4a",
  stone: "#c9cede",
  screen: "#05070d",
  accent: "#ff7a59",
};

const R = Math.PI / 2;

// --- material plumbing -----------------------------------------------------
// selected/ghost state flows down through context so no prop threading.
const MatCtx = createContext({ selected: false, ghost: false });

function Mat({ color = C.stone, emissive, emissiveIntensity, rough = 0.6, metal = 0.12 }) {
  const { selected, ghost } = useContext(MatCtx);
  const glow = emissive ?? (selected ? C.accent : "#000000");
  const gi = emissive != null ? emissiveIntensity ?? 0.6 : selected ? 0.35 : 0;
  return (
    <meshStandardMaterial
      color={color}
      roughness={rough}
      metalness={metal}
      emissive={glow}
      emissiveIntensity={gi}
      transparent={ghost}
      opacity={ghost ? 0.42 : 1}
      depthWrite={!ghost}
    />
  );
}

const B = ({ args, pos = [0, 0, 0], rot, ...m }) => (
  <mesh castShadow receiveShadow position={pos} rotation={rot}>
    <boxGeometry args={args} />
    <Mat {...m} />
  </mesh>
);

const Cyl = ({ args, pos = [0, 0, 0], rot, ...m }) => (
  <mesh castShadow receiveShadow position={pos} rotation={rot}>
    <cylinderGeometry args={args} />
    <Mat {...m} />
  </mesh>
);

// --- the model library -----------------------------------------------------
function Model({ type, color }) {
  switch (type) {
    case "floor":
      return <B args={[2, 0.08, 2]} pos={[0, 0.04, 0]} color={color || C.floor} rough={0.85} />;

    case "wall":
      return <B args={[2, 1.5, 0.2]} pos={[0, 0.75, 0]} color={color || C.wall} rough={0.9} />;

    case "door":
      return (
        <>
          <B args={[0.14, 2, 0.24]} pos={[-0.55, 1, 0]} color={C.wall} />
          <B args={[0.14, 2, 0.24]} pos={[0.55, 1, 0]} color={C.wall} />
          <B args={[1.24, 0.22, 0.24]} pos={[0, 1.9, 0]} color={C.wall} />
          <B args={[0.94, 1.78, 0.08]} pos={[0, 0.89, 0.03]} color={color || C.wood} />
        </>
      );

    case "window":
      return (
        <>
          <B args={[1.5, 1.1, 0.18]} pos={[0, 1.1, 0]} color={color || C.wall} />
          <mesh position={[0, 1.1, 0.02]}>
            <boxGeometry args={[1.28, 0.88, 0.06]} />
            <meshStandardMaterial
              color="#bfe0ff"
              transparent
              opacity={0.5}
              roughness={0.08}
              metalness={0}
              emissive="#9fd3ff"
              emissiveIntensity={0.25}
            />
          </mesh>
        </>
      );

    case "column":
      return <Cyl args={[0.28, 0.3, 2.4, 24]} pos={[0, 1.2, 0]} color={color || C.stone} />;

    case "stairs":
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <B
              key={i}
              args={[1.4, 0.24, 0.4]}
              pos={[0, 0.12 + i * 0.24, 0.8 - i * 0.4]}
              color={color || "#b0b7c9"}
            />
          ))}
        </>
      );

    case "table":
      return (
        <>
          <B args={[1.6, 0.1, 1]} pos={[0, 0.75, 0]} color={color || C.wood} />
          {[
            [-0.72, 0.42],
            [0.72, 0.42],
            [-0.72, -0.42],
            [0.72, -0.42],
          ].map(([x, z], i) => (
            <B key={i} args={[0.1, 0.75, 0.1]} pos={[x, 0.375, z]} color={C.woodDark} />
          ))}
        </>
      );

    case "chair":
      return (
        <>
          <B args={[0.5, 0.08, 0.5]} pos={[0, 0.46, 0]} color={color || C.fabricCoral} />
          <B args={[0.5, 0.5, 0.08]} pos={[0, 0.72, -0.21]} color={color || C.fabricCoral} />
          {[
            [-0.2, 0.2],
            [0.2, 0.2],
            [-0.2, -0.2],
            [0.2, -0.2],
          ].map(([x, z], i) => (
            <B key={i} args={[0.06, 0.46, 0.06]} pos={[x, 0.23, z]} color={C.woodDark} />
          ))}
        </>
      );

    case "sofa":
      return (
        <>
          <B args={[2.2, 0.45, 1]} pos={[0, 0.28, 0]} color={color || C.fabricBlue} />
          <B args={[2, 0.18, 0.9]} pos={[0, 0.55, 0.02]} color={C.fabricBlueLt} />
          <B args={[2.2, 0.55, 0.22]} pos={[0, 0.62, -0.39]} color={color || C.fabricBlue} />
          <B args={[0.22, 0.55, 1]} pos={[-1, 0.5, 0]} color={color || C.fabricBlue} />
          <B args={[0.22, 0.55, 1]} pos={[1, 0.5, 0]} color={color || C.fabricBlue} />
        </>
      );

    case "bed":
      return (
        <>
          <B args={[2, 0.3, 2.2]} pos={[0, 0.15, 0]} color={color || C.wood} />
          <B args={[1.9, 0.28, 2.1]} pos={[0, 0.44, 0]} color="#eef1f8" rough={0.9} />
          <B args={[1.9, 0.08, 1.3]} pos={[0, 0.6, 0.35]} color={C.fabricCoral} rough={0.9} />
          <B args={[0.7, 0.16, 0.42]} pos={[-0.45, 0.62, -0.78]} color="#ffffff" rough={0.9} />
          <B args={[0.7, 0.16, 0.42]} pos={[0.45, 0.62, -0.78]} color="#ffffff" rough={0.9} />
        </>
      );

    case "desk":
      return (
        <>
          <B args={[1.5, 0.08, 0.8]} pos={[0, 0.75, 0]} color="#3a4056" />
          <B args={[0.08, 0.75, 0.8]} pos={[-0.7, 0.375, 0]} color={C.metal} />
          <B args={[0.08, 0.75, 0.8]} pos={[0.7, 0.375, 0]} color={C.metal} />
          <B args={[0.7, 0.42, 0.05]} pos={[0, 1.15, -0.25]} color={C.screen} emissive="#2a6df0" emissiveIntensity={0.35} />
        </>
      );

    case "bookshelf":
      return (
        <>
          <B args={[1.2, 2, 0.4]} pos={[0, 1, 0]} color={color || C.wood} />
          {[0.5, 1.0, 1.5].map((y, i) => (
            <B key={i} args={[1.12, 0.05, 0.36]} pos={[0, y, 0]} color={C.woodDark} />
          ))}
          <B args={[0.12, 0.34, 0.28]} pos={[-0.35, 0.72, 0.02]} color={C.fabricCoral} />
          <B args={[0.12, 0.34, 0.28]} pos={[-0.18, 0.72, 0.02]} color={C.fabricBlue} />
          <B args={[0.12, 0.34, 0.28]} pos={[0.3, 1.22, 0.02]} color={C.green} />
          <B args={[0.12, 0.34, 0.28]} pos={[0.13, 1.22, 0.02]} color={C.accent} />
        </>
      );

    case "kitchen":
      return (
        <>
          <B args={[2, 0.9, 0.8]} pos={[0, 0.45, 0]} color={color || "#d7dbe6"} />
          <B args={[2.06, 0.09, 0.86]} pos={[0, 0.9, 0]} color={C.metal} rough={0.3} metal={0.4} />
          <Cyl args={[0.02, 0.02, 0.35, 12]} pos={[0, 1.1, -0.1]} color="#9aa3bd" rough={0.2} metal={0.7} />
        </>
      );

    case "tv":
      return (
        <>
          <B args={[1.6, 0.45, 0.4]} pos={[0, 0.22, 0]} color={C.metal} />
          <B args={[1.55, 0.9, 0.07]} pos={[0, 1.1, 0]} color={C.screen} emissive="#1a3b8f" emissiveIntensity={0.35} />
        </>
      );

    case "plant":
      return (
        <>
          <Cyl args={[0.26, 0.2, 0.42, 20]} pos={[0, 0.21, 0]} color={color || C.terra} />
          <mesh castShadow position={[0, 0.78, 0]}>
            <icosahedronGeometry args={[0.42, 0]} />
            <Mat color={C.green} rough={0.8} />
          </mesh>
          <mesh castShadow position={[0.12, 1.02, 0.05]}>
            <icosahedronGeometry args={[0.28, 0]} />
            <Mat color="#5fb478" rough={0.8} />
          </mesh>
        </>
      );

    case "rug":
      return <B args={[2.6, 0.03, 1.7]} pos={[0, 0.02, 0]} color={color || "#b3506e"} rough={0.95} metal={0} />;

    case "lamp":
      return (
        <>
          <Cyl args={[0.22, 0.24, 0.05, 20]} pos={[0, 0.03, 0]} color={C.metal} />
          <Cyl args={[0.03, 0.03, 1.45, 12]} pos={[0, 0.72, 0]} color={C.metal} />
          <Cyl args={[0.06, 0.32, 0.4, 20]} pos={[0, 1.5, 0]} color="#ffe7bf" emissive="#ffd08a" emissiveIntensity={0.9} />
        </>
      );

    case "painting":
      return (
        <>
          <B args={[0.9, 0.7, 0.06]} pos={[0, 1.45, 0]} color="#caa15a" metal={0.3} rough={0.4} />
          <B args={[0.8, 0.6, 0.02]} pos={[0, 1.45, 0.035]} color={color || C.accent} emissive={C.accent} emissiveIntensity={0.15} />
        </>
      );

    default:
      return <B args={[1, 1, 1]} pos={[0, 0.5, 0]} color={C.stone} />;
  }
}

// --- selection ring --------------------------------------------------------
function SelectRing({ footprint }) {
  const ref = useRef();
  const r = Math.max(footprint[0], footprint[1]) / 2 + 0.35;
  useFrame((st) => {
    const m = ref.current;
    if (!m) return;
    const p = 0.5 + 0.5 * Math.sin(st.clock.elapsedTime * 3);
    m.material.opacity = 0.35 + 0.4 * p;
    m.scale.setScalar(1 + 0.04 * p);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <ringGeometry args={[r - 0.06, r, 48]} />
      <meshBasicMaterial color={C.accent} transparent opacity={0.6} depthWrite={false} />
    </mesh>
  );
}

const easeOutBack = (x) => {
  const c1 = 1.70158,
    c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

// --- placed / preview piece ------------------------------------------------
export function Piece({ item, ghost = false }) {
  const ref = useRef();
  const t = useRef(0);
  const selectedId = useStore((s) => s.selectedId);
  const addType = useStore((s) => s.addType);
  const select = useStore((s) => s.select);
  const startDrag = useStore((s) => s.startDrag);
  const selected = !ghost && selectedId === item.id;
  const meta = BY_TYPE[item.type];

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (ghost) {
      g.scale.setScalar(1);
      return;
    }
    if (t.current < 1) {
      t.current = Math.min(1, t.current + dt * 2.4);
      g.scale.setScalar(easeOutBack(t.current));
    }
    const targetY = selected ? 0.06 : 0;
    g.position.y += (targetY - g.position.y) * Math.min(1, dt * 10);
  });

  const onDown = (e) => {
    if (ghost || addType) return;
    e.stopPropagation();
    startDrag(item.id);
  };
  const onClick = (e) => {
    if (ghost || addType) return;
    e.stopPropagation();
    select(item.id);
  };

  return (
    <group
      ref={ref}
      position={[item.x, 0, item.z]}
      rotation={[0, item.ry, 0]}
      scale={ghost ? 1 : 0.001}
      onPointerDown={onDown}
      onClick={onClick}
    >
      <MatCtx.Provider value={{ selected, ghost }}>
        <Model type={item.type} color={item.color} />
      </MatCtx.Provider>
      {selected && <SelectRing footprint={meta?.footprint || [1, 1]} />}
    </group>
  );
}

// --- catalog ---------------------------------------------------------------
export const CATALOG = [
  { type: "floor", label: "Floor", emoji: "🟫", group: "Structure", footprint: [2, 2] },
  { type: "wall", label: "Wall", emoji: "🧱", group: "Structure", footprint: [2, 0.3] },
  { type: "door", label: "Door", emoji: "🚪", group: "Structure", footprint: [1.3, 0.3] },
  { type: "window", label: "Window", emoji: "🪟", group: "Structure", footprint: [1.5, 0.3] },
  { type: "column", label: "Column", emoji: "🏛️", group: "Structure", footprint: [0.6, 0.6] },
  { type: "stairs", label: "Stairs", emoji: "🪜", group: "Structure", footprint: [1.6, 2] },

  { type: "sofa", label: "Sofa", emoji: "🛋️", group: "Furniture", footprint: [2.2, 1] },
  { type: "chair", label: "Chair", emoji: "🪑", group: "Furniture", footprint: [0.6, 0.6] },
  { type: "table", label: "Table", emoji: "🍽️", group: "Furniture", footprint: [1.6, 1] },
  { type: "bed", label: "Bed", emoji: "🛏️", group: "Furniture", footprint: [2, 2.2] },
  { type: "desk", label: "Desk", emoji: "💻", group: "Furniture", footprint: [1.5, 0.8] },
  { type: "bookshelf", label: "Bookshelf", emoji: "📚", group: "Furniture", footprint: [1.2, 0.4] },
  { type: "kitchen", label: "Kitchen", emoji: "🍳", group: "Furniture", footprint: [2, 0.8] },
  { type: "tv", label: "TV", emoji: "📺", group: "Furniture", footprint: [1.6, 0.5] },

  { type: "plant", label: "Plant", emoji: "🪴", group: "Decor", footprint: [0.6, 0.6] },
  { type: "rug", label: "Rug", emoji: "🟪", group: "Decor", footprint: [2.6, 1.7] },
  { type: "lamp", label: "Lamp", emoji: "💡", group: "Decor", footprint: [0.5, 0.5] },
  { type: "painting", label: "Art", emoji: "🖼️", group: "Decor", footprint: [0.9, 0.3] },
];

export const BY_TYPE = Object.fromEntries(CATALOG.map((c) => [c.type, c]));
export const GROUPS = ["Structure", "Furniture", "Decor"];

// --- demo apartment (the "Auto-tour" preset) -------------------------------
export const PRESET = [
  ...[-2, 0, 2].flatMap((x) => [-2, 0, 2].map((z) => ({ type: "floor", x, z, ry: 0 }))),
  ...[-2, 0, 2].map((x) => ({ type: "wall", x, z: -3, ry: 0 })),
  ...[-2, 0, 2].map((z) => ({ type: "wall", x: -3, z, ry: R })),

  { type: "sofa", x: -1.5, z: -1.5, ry: 0 },
  { type: "rug", x: 0.5, z: 0.5, ry: 0 },
  { type: "table", x: 0.5, z: 0.5, ry: 0 },
  { type: "chair", x: 0.5, z: -0.5, ry: Math.PI },
  { type: "chair", x: 0.5, z: 1.5, ry: 0 },
  { type: "tv", x: -2.5, z: 0.5, ry: R },
  { type: "bookshelf", x: -2.5, z: -2, ry: R },
  { type: "lamp", x: -2, z: -2.2, ry: 0 },

  { type: "bed", x: 2, z: 1.8, ry: 0 },
  { type: "desk", x: 2.5, z: -0.5, ry: -R },
  { type: "chair", x: 1.6, z: -0.5, ry: R },

  { type: "plant", x: 2.8, z: 2.8, ry: 0 },
  { type: "plant", x: -2.8, z: 2.6, ry: 0 },
  { type: "kitchen", x: 1.5, z: -2.7, ry: 0 },
  { type: "painting", x: 0, z: -2.9, ry: 0 },
];
