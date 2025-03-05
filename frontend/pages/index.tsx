import { Geist, Geist_Mono } from "next/font/google";
import HomeComponent from "@/components/HomeComponent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-[family-name:var(--font-geist-sans)] pt-0`}
    >
      <main className="w-full">
        <HomeComponent />
      </main>
    </div>
  );
}
