export default function OrdersFrom() {
  const data = [
    { label: "Dine-in", value: 60, color: "#4f46e5" },
    { label: "Takeaway", value: 25, color: "#22c55e" },
    { label: "Online", value: 15, color: "#f59e0b" },
  ];

  return (
    <div className="card">
      <h3>Orders From</h3>

      {data.map((item, i) => (
        <div key={i} className="progress-row">
          <div className="progress-header">
            <span>{item.label}</span>
            <span>{item.value}%</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${item.value}%`,
                background: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
