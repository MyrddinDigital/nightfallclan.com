import type { Metadata } from "next";
import Nav from "@ui/Nav";
import { SearchProvider } from "@context/SearchContext";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Nightfall Clan",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body>
        <SearchProvider>
          <div id="__next">
            <Nav />
            {children}
          </div>
        </SearchProvider>
      </body>
    </html>
  );
}
