import type { Metadata } from "next";
import "./globals.css";

const title = "Light — Login Experience";
const description =
  "Uma experiência de login interativa controlada pela luz de um abajur.";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://light-login-x7rg.contato-rgsantos.workers.dev";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const socialImageUrl = new URL(`${basePath}/og-v3.png`, siteUrl).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: `${basePath}/favicon-x7rg.png`,
    shortcut: `${basePath}/favicon-x7rg.png`,
  },
  openGraph: {
    title,
    description,
    images: [{ url: socialImageUrl, width: 1536, height: 909 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
