# Qubaisa 3D furniture assets

Place production furniture models in this folder as `.glb` files.

## Scale contract

The application uses a strict real-world scale:

- `1 Three.js unit = 1 metre`
- Catalog dimensions are stored in metres.
- The GLB file itself may have any export scale.
- `ProductPiece.jsx` measures the model bounding box and automatically normalizes X/Y/Z to the exact catalog width/height/depth.

Example product entry in `src/catalog.js`:

```js
{
  type: "qubaisa-sofa-001",
  sku: "QB-SF-001",
  label: "Classic Sofa 001",
  emoji: "🛋️",
  group: "Qubaisa Furniture",
  modelUrl: "/models/qubaisa-sofa-001.glb",
  dimensions: {
    width: 2.40,
    height: 0.85,
    depth: 0.95,
  },
  footprint: [2.40, 0.95],
}
```

## Recommended photo-to-3D workflow

1. Photograph the real furniture from many angles when possible.
2. Convert the photos to a textured 3D model with KIRI Engine, Tripo, Meshy, Blender, or another photogrammetry/image-to-3D workflow.
3. Export as GLB/glTF.
4. Optimize polygon count and texture sizes before web delivery.
5. Put the final `.glb` in `public/models/`.
6. Add the product to `REAL_PRODUCTS` in `src/catalog.js`.
7. Enter the manufacturer/showroom measurements, not AI-estimated dimensions.
8. Verify the piece inside a known-size room before production release.

## Web optimization target

For a smooth mobile experience, prefer:

- GLB/GLTF
- Draco or Meshopt geometry compression when available
- KTX2/WebP/AVIF textures where practical
- 1K-2K textures for most furniture
- Low-to-medium polygon counts while preserving silhouette/detail
- One optimized model per sellable furniture configuration

Never infer final physical measurements from a single photograph. The catalog measurements are the source of truth.
