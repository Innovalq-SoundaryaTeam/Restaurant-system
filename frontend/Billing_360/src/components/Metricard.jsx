

export default function MetricCard({ title, value }) {
  return (
    <>
    <div className="card">
      <h2>{value}</h2>
      <p>{title}</p>
      <img src="https://i.pinimg.com/1200x/a7/9d/8b/a79d8b15f5de0fc0137382cb9ad283fa.jpg" alt=""  height={110} width="60%" style={{paddingTop:"20px"}}/>
    </div>
    </>
  );
}
