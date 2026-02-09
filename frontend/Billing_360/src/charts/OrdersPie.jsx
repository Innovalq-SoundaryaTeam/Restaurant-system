import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { name: "Fast Food", value: 20 },
  { name: "Italian", value: 15 },
  { name: "Main Course", value: 18 },
  { name: "Starter", value: 10 },
  { name: "Beverages", value: 8 },
  { name: "Indian", value: 12 },
  { name: "Dessert", value: 10 },
  { name: "Other", value: 7 },
];

const COLORS = [
  "#4f46e5",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#14b8a6",
  "#f97316",
];

export default function OrdersPie() {
  return (
    <div className="card">
      <h3>Orders Status</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            isAnimationActive
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
