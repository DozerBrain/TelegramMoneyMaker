// src/pages/WorldMap.tsx
import React from "react";
import WorldMapPage from "./world/WorldMapPage";

type Props = {
  balance: number;
};

export default function WorldMapWrapper(props: Props) {
  return <WorldMapPage {...props} />;
}
