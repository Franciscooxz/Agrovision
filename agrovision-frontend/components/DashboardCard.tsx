interface DashboardCardProps {
  title: string;
  value: string | number;
}

export default function DashboardCard({
  title,
  value,
}: DashboardCardProps) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border">
      <h3 className="text-gray-500 text-sm uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-3xl font-bold mt-2 text-green-600">
        {value}
      </p>
    </div>
  );
}
