import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vertex One SoundingBoard",
  description: "By Jenessa Disler · GPT-5 demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#111111] text-gray-200 min-h-screen">
        {children}
      </body>
    </html>
  );
}