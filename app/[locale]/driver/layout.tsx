import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: "noindex, nofollow, noarchive",
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
