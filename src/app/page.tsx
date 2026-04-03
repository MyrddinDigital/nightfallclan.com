import type { Metadata } from "next";
import HistoryHeader from "@ui/HistoryHeader";
import HistoryContent from "@ui/HistoryContent";

export const metadata: Metadata = {
  title: "History | Nightfall Clan",
};

export default function HistoryPage() {
  return (
    <>
      <div className="history-page-body">
        <HistoryHeader />
        <HistoryContent />
      </div>
    </>
  );
}
