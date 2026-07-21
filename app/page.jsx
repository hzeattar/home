"use client";

import dynamic from "next/dynamic";

// R3F touches window/WebGL, so it can only run in the browser.
const Studio = dynamic(() => import("../src/Studio"), {
  ssr: false,
  loading: () => (
    <div className="boot">
      <div className="boot-logo">casita</div>
      <div className="boot-sub">warming up the studio…</div>
    </div>
  ),
});

export default function Page() {
  return <Studio />;
}
