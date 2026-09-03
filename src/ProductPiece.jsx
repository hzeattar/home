"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Piece as PrimitivePiece } from "./pieces";
import { useStore } from "./store";
import { BY_TYPE } from "./catalog";

const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

function SelectionRing({ footprint }) {
  const ref = useRef();
  const r = Math.max(footprint?.[0] || 1, footprint?.[1] || 1) / 2 + 0.16;

  useFrame((state) => {
    if (!ref.current) return;
    const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 3);
    ref.current.material.opacity = 0.35 + pulse * 0.35;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
      <ringGeometry args={[Math.max(0.05, r - 0.045), r, 48]} />
      <meshBasicMaterial color="#ff7a59" transparent opacity={0.6} depthWrite={false} />
    </mesh>
  );
}

function ExactSizeGLB({ url, dimensions, ghost }) {
  const { scene } = useGLTF(url);

  const prepared = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = !ghost;
      node.receiveShadow = true;

      if (ghost && node.material) {
        const wasArray = Array.isArray(node.material);
        const materials = wasArray ? node.material : [node.material];
        const clonedMaterials = materials.map((material) => {
          const copy = material.clone();
          copy.transparent = true;
          copy.opacity = 0.42;
          copy.depthWrite = false;
          return copy;
        });
        node.material = wasArray ? clonedMaterials : clonedMaterials[0];
      }
    });

    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    const safe = (value) => (Math.abs(value) < 1e-6 ? 1 : value);
    const scale = [
      dimensions.width / safe(size.x),
      dimensions.height / safe(size.y),
      dimensions.depth / safe(size.z),
    ];

    // Rebase the generated model to floor level and to its horizontal centre.
    const offset = [-center.x, -bounds.min.y, -center.z];
    return { clone, scale, offset };
  }, [scene, dimensions.width, dimensions.height, dimensions.depth, ghost]);

  return (
    <group scale={prepared.scale}>
      <primitive object={prepared.clone} position={prepared.offset} dispose={null} />
    </group>
  );
}

function RealProductPiece({ item, ghost = false, meta }) {
  const ref = useRef();
  const progress = useRef(0);
  const selectedId = useStore((s) => s.selectedId);
  const addType = useStore((s) => s.addType);
  const select = useStore((s) => s.select);
  const startDrag = useStore((s) => s.startDrag);
  const selected = !ghost && selectedId === item.id;

  useFrame((_, dt) => {
    const group = ref.current;
    if (!group) return;

    if (ghost) {
      group.scale.setScalar(1);
      return;
    }

    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + dt * 2.4);
      group.scale.setScalar(easeOutBack(progress.current));
    }

    const targetY = selected ? 0.035 : 0;
    group.position.y += (targetY - group.position.y) * Math.min(1, dt * 10);
  });

  const onPointerDown = (event) => {
    if (ghost || addType) return;
    event.stopPropagation();
    startDrag(item.id);
  };

  const onClick = (event) => {
    if (ghost || addType) return;
    event.stopPropagation();
    select(item.id);
  };

  return (
    <group
      ref={ref}
      position={[item.x, 0, item.z]}
      rotation={[0, item.ry || 0, 0]}
      scale={ghost ? 1 : 0.001}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      <ExactSizeGLB url={meta.modelUrl} dimensions={meta.dimensions} ghost={ghost} />
      {selected && <SelectionRing footprint={meta.footprint} />}
    </group>
  );
}

export default function ProductPiece({ item, ghost = false }) {
  const meta = BY_TYPE[item.type];

  // Existing procedural furniture remains a lightweight fallback. Once a catalog
  // item gets a GLB URL, the exact-size production loader takes over automatically.
  if (!meta?.modelUrl) return <PrimitivePiece item={item} ghost={ghost} />;
  return <RealProductPiece item={item} ghost={ghost} meta={meta} />;
}
