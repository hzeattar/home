import { CATALOG as BASE_CATALOG, GROUPS as BASE_GROUPS } from "./pieces";

// Physical dimensions are metres and follow the scene contract:
// X = width, Y = height, Z = depth.
const BASE_DIMENSIONS = {
  floor: { width: 2, height: 0.08, depth: 2 },
  wall: { width: 2, height: 1.5, depth: 0.2 },
  door: { width: 1.24, height: 2, depth: 0.24 },
  window: { width: 1.5, height: 1.65, depth: 0.18 },
  column: { width: 0.6, height: 2.4, depth: 0.6 },
  stairs: { width: 1.4, height: 1.2, depth: 2 },
  sofa: { width: 2.2, height: 0.9, depth: 1 },
  chair: { width: 0.5, height: 0.97, depth: 0.5 },
  table: { width: 1.6, height: 0.8, depth: 1 },
  bed: { width: 2, height: 0.7, depth: 2.2 },
  desk: { width: 1.5, height: 1.36, depth: 0.8 },
  bookshelf: { width: 1.2, height: 2, depth: 0.4 },
  kitchen: { width: 2.06, height: 1.3, depth: 0.86 },
  tv: { width: 1.6, height: 1.55, depth: 0.4 },
  plant: { width: 0.8, height: 1.3, depth: 0.8 },
  rug: { width: 2.6, height: 0.03, depth: 1.7 },
  lamp: { width: 0.64, height: 1.7, depth: 0.64 },
  painting: { width: 0.9, height: 1.8, depth: 0.06 },
};

/*
 * Add production furniture here after converting photographs to GLB.
 * The loader will automatically resize every model to these REAL dimensions.
 *
 * Example:
 * {
 *   type: "qubaisa-sofa-001",
 *   sku: "QB-SF-001",
 *   label: "Classic Sofa 001",
 *   emoji: "🛋️",
 *   group: "Qubaisa Furniture",
 *   modelUrl: "/models/qubaisa-sofa-001.glb",
 *   dimensions: { width: 2.4, height: 0.85, depth: 0.95 },
 *   footprint: [2.4, 0.95],
 * }
 */
export const REAL_PRODUCTS = [];

export const CATALOG = [
  ...BASE_CATALOG.map((item) => {
    const dimensions = BASE_DIMENSIONS[item.type] || {
      width: item.footprint?.[0] || 1,
      height: 1,
      depth: item.footprint?.[1] || 1,
    };
    return {
      ...item,
      dimensions,
      footprint: [dimensions.width, dimensions.depth],
      modelUrl: null,
    };
  }),
  ...REAL_PRODUCTS,
];

export const BY_TYPE = Object.fromEntries(CATALOG.map((item) => [item.type, item]));
export const GROUPS = Array.from(new Set([...BASE_GROUPS, ...REAL_PRODUCTS.map((item) => item.group)]));

export const formatDimensions = (dimensions) => {
  if (!dimensions) return "—";
  const fmt = (value) => Number(value).toFixed(2).replace(/\.00$/, "");
  return `${fmt(dimensions.width)} × ${fmt(dimensions.depth)} × ${fmt(dimensions.height)} m`;
};
