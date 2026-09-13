import type { Metadata } from "next";
import "./global.css";
import { ThemeProvider } from "@/components/ThemeContext";

export const metadata: Metadata = {
  title: "BotClips - Social Media Marketing Automation & Panel",
  description: "Manage your SMM services, automations, and growth all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
