import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "data", "real-products.json");
const products = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const errors = [];
const warnings = [];
const seenTypes = new Set();
const seenSkus = new Set();

const fail = (product, message) => errors.push(`${product?.sku || product?.type || "unknown"}: ${message}`);
const warn = (product, message) => warnings.push(`${product?.sku || product?.type || "unknown"}: ${message}`);
const positive = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

for (const product of products) {
  if (!product || typeof product !== "object") {
    errors.push("Manifest contains a non-object product entry.");
    continue;
  }

  if (!product.type) fail(product, "missing type");
  if (!product.sku) fail(product, "missing sku");
  if (!product.label) fail(product, "missing label");
  if (!product.group) fail(product, "missing group");

  if (product.type) {
    if (seenTypes.has(product.type)) fail(product, `duplicate type ${product.type}`);
    seenTypes.add(product.type);
  }

  if (product.sku) {
    if (seenSkus.has(product.sku)) fail(product, `duplicate sku ${product.sku}`);
    seenSkus.add(product.sku);
  }

  for (const key of ["width", "height", "depth"]) {
    if (!positive(product?.dimensions?.[key])) fail(product, `dimensions.${key} must be a positive number in metres`);
  }

  if (!Array.isArray(product.sourceImageUrls) || product.sourceImageUrls.length === 0) {
    warn(product, "no sourceImageUrls recorded");
  }

  if (!product.sourcePageUrl) warn(product, "no sourcePageUrl recorded");

  if (product.publish === true) {
    if (product.measurementStatus !== "verified") {
      fail(product, "publish=true requires measurementStatus=verified");
    }

    if (typeof product.modelUrl !== "string" || !product.modelUrl.endsWith(".glb")) {
      fail(product, "publish=true requires a .glb modelUrl");
    } else {
      const relative = product.modelUrl.replace(/^\//, "");
      const fullPath = path.join(root, "public", relative.replace(/^models\//, "models/"));
      if (!fs.existsSync(fullPath)) fail(product, `GLB file is missing: public/${relative}`);
    }
  }
}

if (warnings.length) {
  console.warn("Furniture asset warnings:");
  for (const warning of warnings) console.warn(`  - ${warning}`);
}

if (errors.length) {
  console.error("Furniture asset validation failed:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`Furniture asset validation passed (${products.length} manifest entries).`);
