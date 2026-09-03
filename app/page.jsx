"use client";

import dynamic from "next/dynamic";

// R3F touches window/WebGL, so it can only run in the browser.
const Studio = dynamic(() => import("../src/Studio"), {
  ssr: false,
  loading: () => (
    <div className="boot">
      <div className="boot-logo">Qubaisa 3D</div>
      <div className="boot-sub">preparing your real-scale home studio…</div>
    </div>
  ),
});

export default function Page() {
  return <Studio />;
}
