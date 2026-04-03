import { Suspense } from "react";
import type { Metadata } from "next";
import WallPageContent from "./WallPageContent";

export const metadata: Metadata = {
  title: "Wall Archive | Nightfall Clan",
};

export default function WallPage() {
  return (
    <Suspense>
      <WallPageContent />
    </Suspense>
  );
}
