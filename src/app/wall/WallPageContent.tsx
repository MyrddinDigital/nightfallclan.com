"use client";

import WallView from "@ui/WallView";
import GroupBio from "@ui/GroupBio";
import { useState } from "react";

const DEFAULT_LATEST_DATE_SHOWN = Date.parse("2010-03-10");

export default function WallPageContent() {
  const [latestDateShown, setLatestDateShown] = useState<number | null>(
    DEFAULT_LATEST_DATE_SHOWN
  );

  return (
    <div className="wall-page-body">
      <WallView onLatestDateShownChange={setLatestDateShown} />
      <GroupBio latestDateShown={latestDateShown} />
    </div>
  );
}
