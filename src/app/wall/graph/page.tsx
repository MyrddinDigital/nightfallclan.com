import type { Metadata } from "next";
import MessageDensityChart from "@ui/MessageDensityChart";

export const metadata: Metadata = {
  title: "Wall Activity Graph | Nightfall Clan",
};

export default function GraphPage() {
  return <MessageDensityChart />
}
