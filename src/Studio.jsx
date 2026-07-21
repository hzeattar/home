"use client";

import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, ContactShadows } from "@react-three/drei";
import { useStore, snap } from "./store";
import { Piece, CATALOG, GROUPS } from "./pieces";

const SWATCHES = ["#e08a63", "#6d8cc9", "#4c9d63", "#b3506e", "#c9cede", "#8a5a3c"];
const download = (url, name) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
};

// Registers the WebGL renderer with the store so toolbar buttons can grab it.
function Capture() {
  const gl = useThree((s) => s.gl);
  const setGl = useStore((s) => s.setGl);
  useEffect(() => setGl(gl), [gl, setGl]);
  return null;
}

// The interactive floor: raycast target for placing + dragging.
function Ground() {
  const addType = useStore((s) => s.addType);
  const draggingId = useStore((s) => s.draggingId);
  const moveItem = useStore((s) => s.moveItem);
  const setGhost = useStore((s) => s.setGhost);
  const place = useStore((s) => s.place);
  const select = useStore((s) => s.select);

  const onMove = (e) => {
    e.stopPropagation();
    const x = snap(e.point.x);
    const z = snap(e.point.z);
    if (draggingId) moveItem(draggingId, x, z);
    else if (addType) setGhost({ x, z });
  };
  const onClick = (e) => {
    if (addType) place(snap(e.point.x), snap(e.point.z), e.nativeEvent.shiftKey);
    else select(null);
  };

  return (
    <group>
      <Grid
        args={[80, 80]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#26304d"
        sectionSize={5}
        sectionThickness={1.1}
        sectionColor="#3d4d80"
        fadeDistance={48}
        fadeStrength={1.2}
        infiniteGrid
        position={[0, 0, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow onPointerMove={onMove} onClick={onClick}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#0d1322" roughness={1} metalness={0} />
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

  return (
    <>
      <color attach="background" args={["#0b1020"]} />
      <fog attach="fog" args={["#0b1020", 26, 60]} />
      <hemisphereLight args={["#cfe0ff", "#20160f", 0.55]} />
      <ambientLight intensity={0.28} />
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
      <pointLight position={[-7, 5, -4]} intensity={26} color="#ff7a59" distance={34} />

      <Ground />
      {items.map((it) => (
        <Piece key={it.id} item={it} />
      ))}
      {addType && ghost && <Piece item={{ id: "ghost", type: addType, x: ghost.x, z: ghost.z, ry: 0 }} ghost />}

      <ContactShadows position={[0, 0.02, 0]} opacity={0.38} scale={44} blur={2.6} far={14} resolution={1024} color="#000814" />
      <OrbitControls
        makeDefault
        enabled={!draggingId}
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={0.9}
        minDistance={4}
        maxDistance={34}
        minPolarAngle={0.15}
        maxPolarAngle={1.45}
        target={[0, 0.6, 0]}
      />
      <Capture />
    </>
  );
}

export default function Studio() {
  const addType = useStore((s) => s.addType);
  const selectedId = useStore((s) => s.selectedId);
  const items = useStore((s) => s.items);
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
    download(gl.domElement.toDataURL("image/png"), "casita.png");
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
    rec.onstop = () => download(URL.createObjectURL(new Blob(chunks, { type: "video/webm" })), "casita-tour.webm");
    setRecording(true);
    rec.start();
    setTimeout(() => {
      rec.stop();
      setRecording(false);
      flash("Tour saved 🎬");
    }, 15000);
  };

  const hint = addType
    ? "Click the floor to place · Shift-click for many · Esc to cancel"
    : selectedId
    ? "Drag to move · R rotate · D duplicate · Del remove"
    : "Pick a piece to start · drag to orbit · scroll to zoom";

  const sel = selectedId && items.find((i) => i.id === selectedId);

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
              <div className="brand-name">casita</div>
              <div className="brand-tag">design your home in 3D</div>
            </div>
          </div>
          <div className="tools">
            <button className="btn primary" onClick={autoTour}>✨ Auto-tour</button>
            <button className={"btn" + (autoRotate ? " on" : "")} onClick={() => useStore.getState().toggleAutoRotate()}>⟳ Spin</button>
            <span className="sep" />
            <button className={"btn" + (recording ? " rec" : "")} onClick={recordTour}>
              {recording ? "● Rec 15s…" : "🎬 Record"}
            </button>
            <button className="btn" onClick={shot}>📸 Shot</button>
            <span className="sep" />
            <button className="btn" onClick={() => { useStore.getState().save(); flash("Saved 💾"); }}>💾 Save</button>
            <button className="btn" onClick={() => flash(useStore.getState().load() ? "Loaded 📂" : "Nothing saved")}>📂 Load</button>
            <button className="btn" onClick={() => { useStore.getState().clear(); flash("Cleared"); }}>🗑️ New</button>
          </div>
        </header>

        <aside className="panel glass">
          <div className="panel-head">Add pieces</div>
          {GROUPS.map((g) => (
            <div className="cat" key={g}>
              <div className="cat-title">{g}</div>
              <div className="cards">
                {CATALOG.filter((c) => c.group === g).map((c) => (
                  <button
                    key={c.type}
                    className={"card" + (addType === c.type ? " active" : "")}
                    onClick={() => setAdd(c.type)}
                    title={c.label}
                  >
                    <span className="emoji">{c.emoji}</span>
                    <span className="lbl">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <a className="ghlink" href="https://github.com/rohitguta2432/casita" target="_blank" rel="noreferrer">
            ★ Star on GitHub
          </a>
        </aside>

        {sel && (
          <div className="inspector glass">
            <div className="insp-title">Selected piece</div>
            <div className="insp-row">
              <button className="ibtn" onClick={() => useStore.getState().rotateSelected(1)}>↻ Rotate</button>
              <button className="ibtn" onClick={() => useStore.getState().duplicateSelected()}>⧉ Copy</button>
              <button className="ibtn danger" onClick={() => useStore.getState().removeSelected()}>🗑 Delete</button>
            </div>
            <div className="swatches">
              {SWATCHES.map((c) => (
                <button key={c} className="swatch" style={{ background: c }} onClick={() => useStore.getState().recolorSelected(c)} />
              ))}
            </div>
          </div>
        )}

        <footer className="hint glass">{hint}</footer>
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}
