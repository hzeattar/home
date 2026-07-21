import "./globals.css";

export const metadata = {
  title: "Casita — design your home in 3D",
  description:
    "Casita is a free, open-source browser studio for designing your dream home in 3D. Drag rooms and furniture onto a live blueprint — no installs, no CAD degree.",
  metadataBase: new URL("https://casita.rohitraj.tech"),
  openGraph: {
    title: "Casita — design your home in 3D",
    description:
      "Drag rooms and furniture onto a live 3D blueprint. Free, open-source, runs in your browser.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0b1020",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
