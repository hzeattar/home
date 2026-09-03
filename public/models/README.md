# Qubaisa 3D furniture assets

Production furniture models live here as optimized `.glb` files.

## Scale contract

The application uses a strict real-world scale:

- `1 Three.js unit = 1 metre`
- Product dimensions are stored in metres.
- The GLB may arrive from an AI/photogrammetry tool at any arbitrary export scale.
- `ProductPiece.jsx` measures the imported bounding box and automatically normalizes X/Y/Z to the verified width/height/depth.

## Production manifest

Real products are registered in `data/real-products.json`. Do not edit the procedural demo catalog to add sellable products.

Example:

```json
{
  "type": "qubaisa-sofa-001",
  "sku": "QB-SF-001",
  "label": "Classic Sofa 001",
  "emoji": "🛋️",
  "group": "Qubaisa Furniture",
  "modelUrl": "/models/qubaisa-sofa-001.glb",
  "dimensions": {
    "width": 2.4,
    "height": 0.85,
    "depth": 0.95
  },
  "measurementStatus": "verified",
  "sourcePageUrl": "https://www.facebook.com/profile.php?id=61558987945090",
  "sourceImageUrls": [
    "https://example.com/source-photo-1.jpg"
  ],
  "generationMethod": "photogrammetry-or-image-to-3d",
  "publish": true
}
```

`npm run validate:assets` blocks publication when a `publish: true` item is missing its GLB or verified physical measurements. `npm run build` runs that validation automatically.

## Photo -> 3D workflow

1. Collect only photos that are verified as belonging to the Qubaisa/Kubaisa product or supplied by the owner.
2. Prefer multiple angles: front, left/right, back and 30-45 degree views. A single image can be used for an AI approximation, but unseen geometry is inferred.
3. Generate a textured mesh with a photo-to-3D/photogrammetry system.
4. Export GLB/glTF.
5. Clean obvious geometry errors and remove unwanted background/floor geometry.
6. Optimize polygon count and textures for web/mobile.
7. Put the final file in `public/models/`.
8. Add the product to `data/real-products.json` with its source images and verified showroom/manufacturer dimensions.
9. Set `measurementStatus` to `verified` only after checking the real product measurements.
10. Set `publish` to `true` only after visual QA in a known-size room.
11. Run `npm run validate:assets` and then `npm run build`.

## Source queue

`data/furniture-source-queue.json` records source pages and candidate assets before they become products. Candidate images must not be silently replaced with visually similar furniture from another business.

## Web optimization target

For smooth mobile performance, prefer:

- GLB/GLTF
- Draco or Meshopt geometry compression when available
- KTX2/WebP/AVIF textures where practical
- 1K-2K textures for most furniture
- low-to-medium polygon counts while preserving silhouette/detail
- one optimized model per sellable furniture configuration

Never infer final physical measurements from a photograph. The verified product measurements are the source of truth.
