import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ViraVeste — Seu armário em movimento",
  description: "Compre e venda peças especiais em uma comunidade brasileira de moda circular.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
  return <html lang="pt-BR"><body>{children}</body></html>;
}
