import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LTCube — Learn to Solve the Rubik's Cube",
  description:
    "Interactive step-by-step tutorials to learn the beginner layer-by-layer method for solving a 3x3 Rubik's Cube.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-[#FFFFFF] text-[#1E293B] antialiased">
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 min-h-full overflow-y-auto md:ml-64">
            <div className="max-w-4xl mx-auto px-6 py-10">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
