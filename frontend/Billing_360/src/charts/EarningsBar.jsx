import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const DATA = {
  Monthly: [
    { day: "Jan", value: 4000 },
    { day: "Feb", value: 3000 },
    { day: "Mar", value: 5000 },
    { day: "Apr", value: 4500 },
    { day: "May", value: 6000 },
  ],
  Weekly: [
    { day: "Mon", value: 2000 },
    { day: "Tue", value: 4500 },
    { day: "Wed", value: 3000 },
    { day: "Thu", value: 5500 },
    { day: "Fri", value: 4800 },
    { day: "Sat", value: 7000 },
    { day: "Sun", value: 3500 },
  ],
  Today: [
    { day: "9am", value: 400 },
    { day: "12pm", value: 900 },
    { day: "3pm", value: 1200 },
    { day: "6pm", value: 800 },
  ],
};

export default function EarningsChart({ range = "Weekly" }) {
  const chartData = DATA[range] || DATA.Weekly;

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          {/* DEFINING THE GRADIENT COLOR */}
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c853" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00c853" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#1f1f1f" 
            vertical={false} 
          />
          
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#666', fontSize: 12 }} 
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#666', fontSize: 12 }} 
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#121212', 
              border: '1px solid #333', 
              borderRadius: '8px',
              color: '#fff'
            }}
            itemStyle={{ color: '#00c853' }}
          />

          <Area
            type="monotone" /* Makes the line smooth/curved */
            dataKey="value"
            stroke="#00c853" /* The green line color */
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)" /* Applies the gradient fill */
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}