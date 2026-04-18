import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree, Fira_Code } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira",
  weight: ["400", "500", "600"],
  display: "swap",
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
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} ${firaCode.variable} h-full`}>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  );
}
