'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import GoogleMapsScript from "./components/GoogleMapsScript";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <GoogleMapsScript />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
