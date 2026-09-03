import "./globals.css";

export const metadata = {
  title: "Qubaisa 3D — design your home with real dimensions",
  description:
    "A browser-based 3D home designer for planning rooms and placing furniture at real-world dimensions before purchase.",
  openGraph: {
    title: "Qubaisa 3D — real-scale home designer",
    description:
      "Design a room using real measurements and preview furniture at its exact physical dimensions in 3D.",
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
