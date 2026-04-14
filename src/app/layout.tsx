import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LTCube — Learn to Solve the Rubik's Cube",
  description:
    "Interactive 3D tutorials that teach the beginner layer-by-layer method for solving a 3x3 Rubik's Cube — step through every algorithm on a live 3D cube.",
  openGraph: {
    title: "LTCube — Learn to Solve the Rubik's Cube",
    description:
      "Interactive 3D tutorials that teach the beginner layer-by-layer method for solving a 3x3 Rubik's Cube.",
    type: "website",
    siteName: "LTCube",
  },
  twitter: {
    card: "summary",
    title: "LTCube — Learn to Solve the Rubik's Cube",
    description: "Interactive 3D tutorials for solving the Rubik's Cube.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-[#FFFFFF] text-[#1E293B] antialiased">
        {children}
      </body>
    </html>
  );
}
