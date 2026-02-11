import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "../styles/charts.css"; // Ensure you have styles for the center text

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
  "#4f46e5", "#22c55e", "#f59e0b", "#ef4444",
  "#8b5cf6", "#0ea5e9", "#14b8a6", "#f97316",
];

export default function OrdersPie() {
  return (
    <div className="chart-card pie-container">
      <h3>Order Types</h3>
      <div className="pie-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={75} // Larger inner radius for thinner donut
              outerRadius={100}
              paddingAngle={5} // Spacing between segments
              dataKey="value"
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* CENTER TEXT: Matches the "Beverages : 8" overlay in your screenshot */}
        <div className="pie-center-label">
          <p>Beverages : 8</p>
        </div>
      </div>
    </div>
  );
}