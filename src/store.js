import { create } from "zustand";
import { PRESET } from "./pieces";

// One grid cell = 1 metre. Objects snap to half-cells so nudging feels precise.
const SNAP = 0.5;
export const snap = (v) => Math.round(v / SNAP) * SNAP;

const uid = () => Math.random().toString(36).slice(2, 9);
const KEY = "casita:v1";

export const useStore = create((set, get) => ({
  items: [],
  selectedId: null,
  addType: null, // piece type queued for placement, or null
  ghost: null, // { x, z } preview while placing
  draggingId: null,
  autoRotate: false,
  gl: null, // three renderer, registered from inside the Canvas

  // --- placement ------------------------------------------------------------
  setAdd: (type) =>
    set((s) => ({ addType: s.addType === type ? null : type, ghost: null, selectedId: null })),

  setGhost: (ghost) => set({ ghost }),

  place: (x, z, keepPlacing) =>
    set((s) => {
      if (!s.addType) return {};
      const item = { id: uid(), type: s.addType, x, z, ry: 0 };
      return {
        items: [...s.items, item],
        selectedId: item.id,
        addType: keepPlacing ? s.addType : null,
        ghost: keepPlacing ? s.ghost : null,
      };
    }),

  // --- manipulation ---------------------------------------------------------
  select: (id) => set({ selectedId: id }),

  startDrag: (id) => set({ draggingId: id, selectedId: id }),
  stopDrag: () => set({ draggingId: null }),

  moveItem: (id, x, z) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, x, z } : it)) })),

  rotateSelected: (dir = 1) =>
    set((s) => ({
      items: s.items.map((it) =>
        it.id === s.selectedId ? { ...it, ry: it.ry + (dir * Math.PI) / 2 } : it
      ),
    })),

  recolorSelected: (color) =>
    set((s) => ({
      items: s.items.map((it) => (it.id === s.selectedId ? { ...it, color } : it)),
    })),

  duplicateSelected: () =>
    set((s) => {
      const src = s.items.find((it) => it.id === s.selectedId);
      if (!src) return {};
      const copy = { ...src, id: uid(), x: src.x + 1, z: src.z + 1 };
      return { items: [...s.items, copy], selectedId: copy.id };
    }),

  removeSelected: () =>
    set((s) => ({
      items: s.items.filter((it) => it.id !== s.selectedId),
      selectedId: null,
    })),

  // --- scene ----------------------------------------------------------------
  clear: () => set({ items: [], selectedId: null, addType: null, ghost: null, autoRotate: false }),

  loadPreset: () => set({ items: PRESET.map((p) => ({ ...p, id: uid() })), selectedId: null, addType: null }),

  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),

  setGl: (gl) => set({ gl }),

  // --- persistence ----------------------------------------------------------
  save: () => {
    localStorage.setItem(KEY, JSON.stringify(get().items));
    return true;
  },

  load: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const items = JSON.parse(raw);
      set({ items: Array.isArray(items) ? items : [], selectedId: null });
      return true;
    } catch {
      return false;
    }
  },
}));
