export default function Topselling() {
  const items = [
    {
      name: "Italiano pizza",
      count: "124 times",
      price: "$12.56",
      img: "IMAGE_LINK_HERE",
    },
    {
      name: "Cheese Momos",
      count: "116 times",
      price: "$12.56",
      img: "IMAGE_LINK_HERE",
    },
    {
      name: "French fries",
      count: "200 times",
      price: "$12.56",
      img: "IMAGE_LINK_HERE",
    },
    {
      name: "Cheese Sandwich",
      count: "50 times",
      price: "$12.56",
      img: "IMAGE_LINK_HERE",
    },
  ];

  return (
    <div className="card">
      <h3>Top Selling items</h3>

      {items.map((item, i) => (
        <div className="item-row" key={i}>
          <div className="item-left">
            <div className="img-box">
              {/* replace src later */}
              <img src={item.img} alt="" />
            </div>

            <div>
              <strong>{item.name}</strong>
              <small>{item.count}</small>
            </div>
          </div>

          <span className="price">{item.price}</span>
        </div>
      ))}
    </div>
  );
}
