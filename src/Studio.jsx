"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, ContactShadows } from "@react-three/drei";
import { useStore, snap } from "./store";
import ProductPiece from "./ProductPiece";
import { CATALOG, GROUPS, BY_TYPE, formatDimensions } from "./catalog";

const SWATCHES = ["#e08a63", "#6d8cc9", "#4c9d63", "#b3506e", "#c9cede", "#8a5a3c"];
const download = (url, name) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const rotatedFootprint = (meta, ry = 0) => {
  const [width, depth] = meta?.footprint || [0.2, 0.2];
  const quarterTurns = Math.round(ry / (Math.PI / 2));
  return Math.abs(quarterTurns) % 2 === 1 ? [depth, width] : [width, depth];
};

const constrainToRoom = (x, z, room, item) => {
  const meta = item ? BY_TYPE[item.type] : null;
  const [width, depth] = rotatedFootprint(meta, item?.ry || 0);
  const halfW = room.width / 2;
  const halfD = room.length / 2;
  const marginX = Math.min(width / 2, Math.max(0.05, halfW - 0.05));
  const marginZ = Math.min(depth / 2, Math.max(0.05, halfD - 0.05));
  return {
    x: snap(clamp(x, -halfW + marginX, halfW - marginX)),
    z: snap(clamp(z, -halfD + marginZ, halfD - marginZ)),
  };
};

// Registers the WebGL renderer with the store so toolbar buttons can grab it.
function Capture() {
  const gl = useThree((s) => s.gl);
  const setGl = useStore((s) => s.setGl);
  useEffect(() => setGl(gl), [gl, setGl]);
  return null;
}

function RoomShell() {
  const room = useStore((s) => s.room);
  const t = room.wallThickness;
  const y = room.height / 2;

  return (
    <group>
      <mesh receiveShadow position={[0, -0.055, 0]}>
        <boxGeometry args={[room.width, 0.1, room.length]} />
        <meshStandardMaterial color="#b9aa92" roughness={0.92} />
      </mesh>

      <mesh receiveShadow castShadow position={[0, y, -room.length / 2 - t / 2]}>
        <boxGeometry args={[room.width + t * 2, room.height, t]} />
        <meshStandardMaterial color="#d7d7d1" roughness={0.95} />
      </mesh>
      <mesh receiveShadow castShadow position={[-room.width / 2 - t / 2, y, 0]}>
        <boxGeometry args={[t, room.height, room.length]} />
        <meshStandardMaterial color="#d2d4d5" roughness={0.95} transparent opacity={0.88} />
      </mesh>
      <mesh receiveShadow castShadow position={[room.width / 2 + t / 2, y, 0]}>
        <boxGeometry args={[t, room.height, room.length]} />
        <meshStandardMaterial color="#d2d4d5" roughness={0.95} transparent opacity={0.34} />
      </mesh>
    </group>
  );
}

// The interactive floor: raycast target for placing + dragging.
function Ground() {
  const addType = useStore((s) => s.addType);
  const draggingId = useStore((s) => s.draggingId);
  const items = useStore((s) => s.items);
  const room = useStore((s) => s.room);
  const moveItem = useStore((s) => s.moveItem);
  const setGhost = useStore((s) => s.setGhost);
  const place = useStore((s) => s.place);
  const select = useStore((s) => s.select);

  const onMove = (e) => {
    e.stopPropagation();
    if (draggingId) {
      const item = items.find((candidate) => candidate.id === draggingId);
      const point = constrainToRoom(e.point.x, e.point.z, room, item);
      moveItem(draggingId, point.x, point.z);
    } else if (addType) {
      const point = constrainToRoom(e.point.x, e.point.z, room, { type: addType, ry: 0 });
      setGhost(point);
    }
  };

  const onClick = (e) => {
    if (addType) {
      const point = constrainToRoom(e.point.x, e.point.z, room, { type: addType, ry: 0 });
      place(point.x, point.z, e.nativeEvent.shiftKey);
    } else {
      select(null);
    }
  };

  return (
    <group>
      <Grid
        args={[80, 80]}
        cellSize={0.5}
        cellThickness={0.45}
        cellColor="#26304d"
        sectionSize={1}
        sectionThickness={0.9}
        sectionColor="#3d4d80"
        fadeDistance={48}
        fadeStrength={1.2}
        infiniteGrid
        position={[0, 0.002, 0]}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        onPointerMove={onMove}
        onClick={onClick}
      >
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#0d1322" roughness={1} metalness={0} transparent opacity={0.02} />
      </mesh>
    </group>
  );
}

function Scene() {
  const items = useStore((s) => s.items);
  const addType = useStore((s) => s.addType);
  const ghost = useStore((s) => s.ghost);
  const draggingId = useStore((s) => s.draggingId);
  const autoRotate = useStore((s) => s.autoRotate);
  const room = useStore((s) => s.room);

  const orbitTarget = useMemo(() => [0, Math.min(1.1, room.height * 0.32), 0], [room.height]);

  return (
    <>
      <color attach="background" args={["#0b1020"]} />
      <fog attach="fog" args={["#0b1020", 26, 60]} />
      <hemisphereLight args={["#cfe0ff", "#20160f", 0.65]} />
      <ambientLight intensity={0.38} />
      <directionalLight
        castShadow
        position={[9, 15, 7]}
        intensity={1.35}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-7, 5, -4]} intensity={22} color="#ff7a59" distance={34} />

      <RoomShell />
      <Ground />
      {items.map((it) => (
        <ProductPiece key={it.id} item={it} />
      ))}
      {addType && ghost && (
        <ProductPiece item={{ id: "ghost", type: addType, x: ghost.x, z: ghost.z, ry: 0 }} ghost />
      )}

      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.38}
        scale={Math.max(12, room.width, room.length) * 1.25}
        blur={2.6}
        far={14}
        resolution={1024}
        color="#000814"
      />
      <OrbitControls
        makeDefault
        enabled={!draggingId}
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={0.9}
        minDistance={3}
        maxDistance={40}
        minPolarAngle={0.15}
        maxPolarAngle={1.45}
        target={orbitTarget}
      />
      <Capture />
    </>
  );
}

function DimensionInput({ label, field, value, suffix = "m" }) {
  const updateRoom = useStore((s) => s.updateRoom);
  return (
    <label style={{ display: "grid", gap: 4, minWidth: 0 }}>
      <span style={{ color: "#97a1bd", fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <input
          type="number"
          value={value}
          min={field === "height" ? 2 : 1.5}
          max={field === "height" ? 6 : 30}
          step="0.1"
          onChange={(e) => updateRoom(field, e.target.value)}
          style={{
            width: "100%",
            minWidth: 0,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.05)",
            color: "#f3f6ff",
            borderRadius: 8,
            padding: "7px 6px",
            outline: "none",
            fontSize: 11,
          }}
        />
        <span style={{ color: "#97a1bd", fontSize: 10 }}>{suffix}</span>
      </span>
    </label>
  );
}

export default function Studio() {
  const addType = useStore((s) => s.addType);
  const selectedId = useStore((s) => s.selectedId);
  const items = useStore((s) => s.items);
  const room = useStore((s) => s.room);
  const autoRotate = useStore((s) => s.autoRotate);
  const setAdd = useStore((s) => s.setAdd);
  const [toast, setToast] = useState(null);
  const [recording, setRecording] = useState(false);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  // keyboard shortcuts — read live state via getState to avoid stale closures.
  useEffect(() => {
    const onKey = (e) => {
      const s = useStore.getState();
      if (e.key === "r" || e.key === "R") s.rotateSelected(e.shiftKey ? -1 : 1);
      else if (e.key === "d" || e.key === "D") s.duplicateSelected();
      else if (e.key === "Delete" || e.key === "Backspace") {
        if (s.selectedId) {
          e.preventDefault();
          s.removeSelected();
        }
      } else if (e.key === "Escape") {
        useStore.setState({ addType: null, ghost: null, selectedId: null });
      }
    };
    const onUp = () => {
      if (useStore.getState().draggingId) useStore.getState().stopDrag();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const autoTour = () => {
    useStore.getState().loadPreset();
    useStore.setState({ autoRotate: true });
    flash("Auto-tour ✨");
  };

  const shot = () => {
    const gl = useStore.getState().gl;
    if (!gl) return;
    download(gl.domElement.toDataURL("image/png"), "qubaisa-home-design.png");
    flash("Snapshot saved 📸");
  };

  const recordTour = () => {
    const gl = useStore.getState().gl;
    if (!gl || recording) return;
    if (!items.length) useStore.getState().loadPreset();
    useStore.setState({ autoRotate: true, selectedId: null });
    const canvas = gl.domElement;
    const type = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(
      (t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t)
    );
    if (!type) {
      flash("Recording not supported here");
      return;
    }
    const rec = new MediaRecorder(canvas.captureStream(30), { mimeType: type, videoBitsPerSecond: 8_000_000 });
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => download(URL.createObjectURL(new Blob(chunks, { type: "video/webm" })), "qubaisa-home-tour.webm");
    setRecording(true);
    rec.start();
    setTimeout(() => {
      rec.stop();
      setRecording(false);
      flash("Tour saved 🎬");
    }, 15000);
  };

  const hint = addType
    ? "Click inside the room to place · 10 cm precision · Esc to cancel"
    : selectedId
    ? "Drag to move · R rotate · D duplicate · Del remove"
    : "Set your room dimensions, then choose furniture";

  const sel = selectedId && items.find((i) => i.id === selectedId);
  const selectedMeta = sel ? BY_TYPE[sel.type] : null;

  return (
    <div className="app">
      <div className="stage">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          camera={{ position: [9, 7.5, 9], fov: 42 }}
        >
          <Scene />
        </Canvas>
      </div>

      <div className="ui">
        <header className="topbar glass">
          <div className="brand">
            <span className="dot" />
            <div>
              <div className="brand-name">Qubaisa 3D</div>
              <div className="brand-tag">design your home with real dimensions</div>
            </div>
          </div>
          <div className="tools">
            <button className="btn primary" onClick={autoTour}>✨ Demo room</button>
            <button className={"btn" + (autoRotate ? " on" : "")} onClick={() => useStore.getState().toggleAutoRotate()}>⟳ Spin</button>
            <span className="sep" />
            <button className={"btn" + (recording ? " rec" : "")} onClick={recordTour}>
              {recording ? "● Rec 15s…" : "🎬 Record"}
            </button>
            <button className="btn" onClick={shot}>📸 Shot</button>
            <span className="sep" />
            <button className="btn" onClick={() => { useStore.getState().save(); flash("Saved 💾"); }}>💾 Save</button>
            <button className="btn" onClick={() => flash(useStore.getState().load() ? "Loaded 📂" : "Nothing saved")}>📂 Load</button>
            <button className="btn" onClick={() => { useStore.getState().clear(); flash("New design"); }}>🗑️ New</button>
          </div>
        </header>

        <aside className="panel glass">
          <div className="panel-head">Room dimensions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 7, marginBottom: 10 }}>
            <DimensionInput label="Width" field="width" value={room.width} />
            <DimensionInput label="Length" field="length" value={room.length} />
            <DimensionInput label="Height" field="height" value={room.height} />
          </div>
          <div style={{ fontSize: 10.5, lineHeight: 1.5, color: "#97a1bd", marginBottom: 14 }}>
            1 scene unit = 1 metre · placement precision = 10 cm
          </div>

          <div className="panel-head">Add furniture</div>
          {GROUPS.map((g) => (
            <div className="cat" key={g}>
              <div className="cat-title">{g}</div>
              <div className="cards">
                {CATALOG.filter((c) => c.group === g).map((c) => (
                  <button
                    key={c.type}
                    className={"card" + (addType === c.type ? " active" : "")}
                    onClick={() => setAdd(c.type)}
                    title={`${c.label} · ${formatDimensions(c.dimensions)}`}
                  >
                    <span className="emoji">{c.emoji}</span>
                    <span className="lbl">{c.label}</span>
                    <span style={{ fontSize: 8.5, color: c.modelUrl ? "#ffb703" : "#69738d" }}>
                      {c.modelUrl ? "REAL GLB" : `${c.dimensions.width}×${c.dimensions.depth}m`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 4, padding: "9px 10px", border: "1px solid rgba(255,255,255,.09)", borderRadius: 11, fontSize: 11, color: "#97a1bd" }}>
            Placed pieces: <strong style={{ color: "#f3f6ff" }}>{items.length}</strong>
          </div>
          <a className="ghlink" href="https://github.com/hzeattar/home" target="_blank" rel="noreferrer">
            GitHub · hzeattar/home
          </a>
        </aside>

        {sel && (
          <div className="inspector glass">
            <div className="insp-title">Selected piece</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{selectedMeta?.label || sel.type}</div>
              <div style={{ color: "#97a1bd", fontSize: 10.5, marginTop: 3 }}>
                {formatDimensions(selectedMeta?.dimensions)} · real scale
              </div>
            </div>
            <div className="insp-row">
              <button className="ibtn" onClick={() => useStore.getState().rotateSelected(1)}>↻ Rotate</button>
              <button className="ibtn" onClick={() => useStore.getState().duplicateSelected()}>⧉ Copy</button>
              <button className="ibtn danger" onClick={() => useStore.getState().removeSelected()}>🗑 Delete</button>
            </div>
            {!selectedMeta?.modelUrl && (
              <div className="swatches">
                {SWATCHES.map((c) => (
                  <button key={c} className="swatch" style={{ background: c }} onClick={() => useStore.getState().recolorSelected(c)} />
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="hint glass">{hint}</footer>
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}
