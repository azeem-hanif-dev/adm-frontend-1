type StatCardProps = {
  label: string;
  value: string | number;
  color?: string;
};

const StatCard = ({ label, value, color }: StatCardProps) => (
  <div className="bg-white rounded-lg px-6 py-4 shadow-lg text-center border">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-xl font-semibold" style={{ color }}>
      {value}
    </p>
  </div>
);

export default StatCard;
