export function StatCard({ label, value, color = 'default' }) {
  const valueColor =
    color === 'green' ? 'text-green-400' : color === 'red' ? 'text-red-400' : color === 'yellow' ? 'text-yellow-400' : 'text-white';

  return (
    <div className="bg-fbs-card rounded-xl p-4">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-2xl font-semibold mt-2 ${valueColor}`}>{value}</div>
    </div>
  );
}

export default StatCard;
