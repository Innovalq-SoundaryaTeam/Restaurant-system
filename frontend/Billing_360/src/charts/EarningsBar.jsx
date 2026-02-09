import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DATA = {
  monthly: [
    { day: "01", value: 35 },
    { day: "02", value: 18 },
    { day: "03", value: 15 },
    { day: "04", value: 35 },
    { day: "05", value: 40 },
    { day: "06", value: 20 },
    { day: "07", value: 30 },
  ],
  weekly: [
    { day: "Mon", value: 20 },
    { day: "Tue", value: 25 },
    { day: "Wed", value: 18 },
    { day: "Thu", value: 30 },
    { day: "Fri", value: 40 },
  ],
  today: [
    { day: "10am", value: 10 },
    { day: "12pm", value: 25 },
    { day: "2pm", value: 40 },
    { day: "4pm", value: 30 },
  ],
};

export default function EarningsChart({ range, setRange }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Earnings</h3>

        <div className="toggle">
          {["Monthly", "Weekly", "Today"].map((item) => (
            <button
              key={item}
              className={range === item ? "active" : ""}
              onClick={() => setRange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="80%" height={350}>
        <BarChart data={DATA[range]}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="value"
            fill="#2845D6"
            radius={[10, 10, 0, 0]}
            isAnimationActive
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
