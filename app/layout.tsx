import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppointmentProvider } from "@/context/AppointmentContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { OfflineProvider } from "@/context/OfflineContext";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "NeuroNet",
  description: "AI-Powered Mental Wellness",
  icons: {
    icon: "/nn.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AppointmentProvider>
              <OfflineProvider>
                {children}
                <Toaster />
              </OfflineProvider>
            </AppointmentProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
