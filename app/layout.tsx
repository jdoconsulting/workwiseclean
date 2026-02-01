import "./globals.css";

export const metadata = {
  title: "Vertex One SoundingBoard",
  description: "Your sounding board for the Leader as Coach program",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#212121]">{children}</body>
    </html>
  );
}