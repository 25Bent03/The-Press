import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "./components/AppWalletProvider";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Press",
  description: "Proof of Shill - Work for Coins",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppWalletProvider>
          <Navbar />
          <div className="pt-16">
            {children}
          </div>
        </AppWalletProvider>
      </body>
    </html>
  );
}