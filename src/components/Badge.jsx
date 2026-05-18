export function Badge({ label, type = 'default' }) {
  const map = {
    present: 'bg-green-900 text-green-400',
    approved: 'bg-green-900 text-green-400',
    active: 'bg-green-900 text-green-400',
    absent: 'bg-red-900 text-red-400',
    rejected: 'bg-red-900 text-red-400',
    inactive: 'bg-red-900 text-red-400',
    pending: 'bg-yellow-900 text-yellow-400',
    late: 'bg-yellow-900 text-yellow-400',
    correction: 'bg-blue-900 text-blue-400',
    unplanned_holiday: 'bg-purple-900 text-purple-400',
    batch_access: 'bg-purple-900 text-purple-400',
    default: 'bg-gray-800 text-gray-200',
  };

  const classes = map[type?.toLowerCase()] || map.default;

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${classes}`}>{label}</span>
  );
}

export default Badge;
