import { ReactNode } from "react";

export default function Card({title, children, right}:{title:string; children:ReactNode; right?:ReactNode}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}
