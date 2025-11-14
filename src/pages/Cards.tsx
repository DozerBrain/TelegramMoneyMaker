import React from "react";
import CardFrame from "../components/CardFrame";

export default function Cards() {
  const cardData = [
    {
      id: "starter",
      rarity: "common",
      imgSrc: "/cards/starter.png",
      title: "Starter",
      serial: "#CM-0001",
    },
    {
      id: "boost",
      rarity: "rare",
      imgSrc: "/cards/boost.png",
      title: "Boost",
      serial: "#CM-0002",
    },
    // add more cards here as needed
  ];

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold text-emerald-200">Cards</h1>
      <div className="grid grid-cols-2 gap-3">
        {cardData.map((card) => (
          <CardFrame
            key={card.id}
            rarity={card.rarity as any}
            imgSrc={card.imgSrc}
            title={card.title}
            serial={card.serial}
          />
        ))}
      </div>
    </div>
  );
}
