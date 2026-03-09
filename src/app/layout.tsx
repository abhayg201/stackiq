import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StackIQ — Personalized Supplement Intelligence",
  description:
    "Science-backed, personalized supplement recommendations matched to your biology. No marketing BS. No affiliate bias.",
  keywords: [
    "supplements",
    "personalized nutrition",
    "supplement recommendations",
    "health stack",
    "evidence-based supplements",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600;700&family=Fraunces:opsz,ital,wght@9..144,0,700;9..144,0,900;9..144,1,700&family=Epilogue:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-base text-fg font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
