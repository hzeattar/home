<div align="center">

# 🏠 Casita

### Design your dream home in 3D — right in your browser.

No installs. No CAD degree. No login. Just drag rooms and furniture onto a live blueprint and watch your home come to life.

![Casita demo](media/casita-demo.gif)

[**▶ Live demo**](https://casita.rohitraj.tech) · [Report a bug](https://github.com/rohitguta2432/casita/issues) · [Add a piece](#-add-your-own-furniture-in-10-lines)

![MIT License](https://img.shields.io/badge/license-MIT-ff7a59) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React Three Fiber](https://img.shields.io/badge/react--three--fiber-9-6d8cc9) ![no%20backend](https://img.shields.io/badge/backend-none-4c9d63)

</div>

---

## What is this?

**Casita** is a tiny, free, open-source home-design studio that runs entirely in the browser. Pick a piece from the catalog, click the floor, and it pops into a real 3D scene. Drag it around, spin it, recolor it, furnish a whole apartment — then **record a 15-second orbit video** of your design with one click.

It's built to be *read*. The entire "3D engine" is a handful of small files and every piece of furniture is just a few boxes and cylinders — so it's a genuinely friendly place to learn React Three Fiber.

## ✨ Features

- 🪑 **18 furniture & structure pieces** — walls, doors, windows, sofas, beds, kitchens, plants, lamps and more
- 🖱️ **Click-to-place, drag-to-move** on a snapping grid — no gizmos to fight
- 🎨 **Recolor** any piece with one click
- ✨ **Auto-tour** — instantly furnishes a demo apartment and orbits it
- 🎬 **Record a 15s video** of your design (native `MediaRecorder` — no server, downloads a `.webm`)
- 📸 **Snapshot** to PNG
- 💾 **Save / load** to your browser (localStorage) — nothing leaves your machine
- ⌨️ **Keyboard shortcuts** for rotate / duplicate / delete
- 📱 Works on any modern browser. Zero backend, zero tracking.

## 🚀 Run it in 30 seconds

You need [Node.js](https://nodejs.org) 18+. That's the only requirement.

```bash
git clone https://github.com/rohitguta2432/casita.git
cd casita
npm install
npm run dev
```

Open **http://localhost:3000** and start building. That's it.

## ⌨️ Controls

| Action | How |
|---|---|
| Add a piece | Click it in the left panel, then click the floor |
| Add many | **Shift-click** the floor |
| Move a piece | Drag it |
| Rotate | Select it, press **R** (Shift+R to reverse) |
| Duplicate | Select it, press **D** |
| Delete | Select it, press **Delete** |
| Cancel / deselect | **Esc** |
| Orbit / zoom | Drag empty space / scroll |

## 🧩 Add your own furniture in ~10 lines

This is the fun part. A "piece" is two things: a **catalog entry** and a **little pile of meshes**. Want to add a **coffee mug**? Open [`src/pieces.jsx`](src/pieces.jsx):

**1. Add it to the model switch** (inside `Model`):

```jsx
case "mug":
  return (
    <>
      <Cyl args={[0.08, 0.06, 0.12, 16]} pos={[0, 0.06, 0]} color="#e8e8ef" />
      <mesh position={[0.1, 0.06, 0]}>
        <torusGeometry args={[0.05, 0.015, 8, 16]} />
        <Mat color="#e8e8ef" />
      </mesh>
    </>
  );
```

**2. Add it to the catalog** (the `CATALOG` array):

```jsx
{ type: "mug", label: "Mug", emoji: "☕", group: "Decor", footprint: [0.3, 0.3] },
```

Save. It appears in the panel instantly. **That's the whole extension API** — no registration, no config, no build step. Every one of the 18 built-in pieces was made exactly this way.

## 🧠 How it works (the 60-second tour)

Casita is deliberately small. Here's the whole thing:

```
app/
  page.jsx        # loads the studio (client-only — WebGL needs the browser)
  layout.jsx      # metadata
  globals.css     # the glass UI + motion
src/
  Studio.jsx      # the <Canvas>, the glass panels, keyboard shortcuts, recorder
  pieces.jsx      # every furniture model + the catalog + the demo apartment
  store.js        # all app state (Zustand) — items, selection, save/load
```

Three ideas do most of the work:

1. **One raycast for everything.** A single invisible ground plane handles `onPointerMove` (drag the held object / show the placement ghost) and `onClick` (place or deselect). Objects themselves only need a one-line `onPointerDown` to grab themselves — no per-object math.
2. **Furniture is just primitives.** No `.glb` files, no asset pipeline. A chair is a seat-box + a back-box + four leg-boxes. The whole library is math, which is why the app loads instantly and the repo is tiny.
3. **Motion from `useFrame`.** The satisfying "pop" when a piece lands is a one-line `easeOutBack` scale animation. The selection ring pulses the same way. No animation library.

## 🛠️ Built with

- **[Next.js 15](https://nextjs.org)** (App Router)
- **[React Three Fiber](https://r3f.docs.pmnd.rs/)** — React renderer for [Three.js](https://threejs.org)
- **[@react-three/drei](https://github.com/pmndrs/drei)** — `OrbitControls`, `Grid`, `ContactShadows`
- **[Zustand](https://zustand.docs.pmnd.rs/)** — ~90 lines of state
- Plain CSS for the UI (glassmorphism + a single coral accent)

## 🌐 Deploy your own

Casita is a static-friendly Next.js app, so it deploys anywhere in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rohitguta2432/casita)

Or `npm run build && npm run start` on any Node host.

## 🤝 Contributing

PRs welcome — especially new furniture pieces (see [above](#-add-your-own-furniture-in-10-lines), it's 10 lines). Fork it, add your piece, open a PR. First-timers encouraged.

## 📄 License

[MIT](LICENSE) — do anything you like with it.

---

<div align="center">

Built by [**Rohit Raj**](https://rohitraj.tech) · [more AI agents & experiments](https://rohitraj.tech/agents)

*If Casita made you smile, drop it a ⭐ — it genuinely helps.*

</div>
