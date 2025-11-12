export default function StatPill({label, value}:{label:string; value:string}) {
  return (
    <div className="badge">{label}: {value}</div>
  );
}
