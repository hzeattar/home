import { create } from "zustand";
import { PRESET } from "./pieces";

// World scale contract: 1 Three.js unit = 1 metre.
// Furniture snaps every 10 cm while the visual grid can stay coarser.
const SNAP = 0.1;
export const snap = (v) => Math.round(v / SNAP) * SNAP;

export const DEFAULT_ROOM = {
  width: 5.2,
  length: 4.1,
  height: 2.8,
  wallThickness: 0.12,
};

const uid = () => Math.random().toString(36).slice(2, 9);
const KEY = "qubaisa-home:v2";
const LEGACY_KEY = "casita:v1";

const clampRoomValue = (field, raw) => {
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  if (field === "height") return Math.min(6, Math.max(2, value));
  if (field === "wallThickness") return Math.min(0.4, Math.max(0.06, value));
  return Math.min(30, Math.max(1.5, value));
};

export const useStore = create((set, get) => ({
  items: [],
  room: { ...DEFAULT_ROOM },
  selectedId: null,
  addType: null, // piece type queued for placement, or null
  ghost: null, // { x, z } preview while placing
  draggingId: null,
  autoRotate: false,
  gl: null, // three renderer, registered from inside the Canvas

  // --- room -----------------------------------------------------------------
  updateRoom: (field, raw) => {
    const value = clampRoomValue(field, raw);
    if (value == null) return;
    set((s) => ({ room: { ...s.room, [field]: value } }));
  },

  resetRoom: () => set({ room: { ...DEFAULT_ROOM } }),

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
      const copy = { ...src, id: uid(), x: snap(src.x + 0.6), z: snap(src.z + 0.6) };
      return { items: [...s.items, copy], selectedId: copy.id };
    }),

  removeSelected: () =>
    set((s) => ({
      items: s.items.filter((it) => it.id !== s.selectedId),
      selectedId: null,
    })),

  // --- scene ----------------------------------------------------------------
  clear: () =>
    set({
      items: [],
      room: { ...DEFAULT_ROOM },
      selectedId: null,
      addType: null,
      ghost: null,
      autoRotate: false,
    }),

  loadPreset: () =>
    set({
      room: { width: 7, length: 7, height: 2.8, wallThickness: 0.12 },
      items: PRESET.map((p) => ({ ...p, id: uid() })),
      selectedId: null,
      addType: null,
    }),

  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),

  setGl: (gl) => set({ gl }),

  // --- persistence ----------------------------------------------------------
  save: () => {
    const { items, room } = get();
    localStorage.setItem(KEY, JSON.stringify({ version: 2, room, items }));
    return true;
  },

  load: () => {
    try {
      const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);

      // Backward compatibility with the original Casita array-only save format.
      if (Array.isArray(parsed)) {
        set({ items: parsed, selectedId: null });
        return true;
      }

      const items = Array.isArray(parsed?.items) ? parsed.items : [];
      const room = parsed?.room && typeof parsed.room === "object"
        ? { ...DEFAULT_ROOM, ...parsed.room }
        : { ...DEFAULT_ROOM };
      set({ items, room, selectedId: null, addType: null, ghost: null });
      return true;
    } catch {
      return false;
    }
  },
}));
