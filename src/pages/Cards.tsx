import React from "react";
import Card from "../components/Card";        // if you have a single card component
import CardFrame from "../components/CardFrame"; // optional frame

export default function Cards() {
  // Render your available cards here (placeholder grid)
  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold text-emerald-200">Cards</h1>
      <div className="grid grid-cols-2 gap-3">
        <CardFrame><Card id="starter" /></CardFrame>
        <CardFrame><Card id="boost" /></CardFrame>
        {/* add the rest */}
      </div>
    </div>
  );
}
