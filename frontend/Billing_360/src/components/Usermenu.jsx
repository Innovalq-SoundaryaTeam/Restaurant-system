// import React, { useState, useEffect } from "react";


// export default function Usermenu() {
//   const [menuItems, setMenuItems] = useState([]);
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch from FastAPI
//   useEffect(() => {
//     const fetchMenu = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/menu");
//         if (response.ok) {
//           const data = await response.json();
//           setMenuItems(data);
//         }
//       } catch (error) {
//         console.error("Connection error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMenu();
//   }, []);

//   const addToCart = (product) => {
//     setCartItems((prev) => {
//       const exists = prev.find((i) => i.id === product.id);
//       return exists
//         ? prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
//         : [...prev, { ...product, quantity: 1 }];
//     });
//   };

//   const removeFromCart = (id) => {
//     setCartItems((prev) =>
//       prev.reduce((acc, item) => {
//         if (item.id === id) {
//           if (item.quantity > 1) acc.push({ ...item, quantity: item.quantity - 1 });
//         } else {
//           acc.push(item);
//         }
//         return acc;
//       }, [])
//     );
//   };

//   const totalPrice = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

//   const getImageUrl = (path) => {
//     if (!path) return "https://placehold.co/400x300/1a1a1a/white?text=Tasty+Food";
//     return path.startsWith("http") ? path : `http://127.0.0.1:8000/${path}`;
//   };

//   if (loading) return <div className="menu-loader">Loading...</div>;

//   return (
//     <div className="menu-app">
//       <header className="menu-app__header">
//         <h1 className="menu-app__title">Our Menu</h1>
//         <p className="menu-app__subtitle">Freshly prepared, just for you.</p>
//       </header>

//       {cartItems.length > 0 && (
//         <section className="cart-preview">
//           <div className="cart-preview__header">
//             <span>Your Order</span>
//             <span className="cart-preview__total">${totalPrice.toFixed(2)}</span>
//           </div>
//           <div className="cart-preview__list">
//             {cartItems.map((item) => (
//               <div key={item.id} className="cart-item">
//                 <div className="cart-item__controls">
//                   <button className="cart-item__btn" onClick={() => removeFromCart(item.id)}>−</button>
//                   <span className="cart-item__qty">{item.quantity}x</span>
//                   <span className="cart-item__name">{item.name}</span>
//                 </div>
//                 <span className="cart-item__price">${(item.price * item.quantity).toFixed(2)}</span>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//       <main className="menu-grid">
//         {menuItems.map((item) => (
//           <article key={item.id} className="item-card">
//             <div className="item-card__media">
//               <img src={getImageUrl(item.image)} alt={item.name} className="item-card__img" />
//               <span className="item-card__tag">{item.category || "Special"}</span>
//             </div>
//             <div className="item-card__content">
//               <h2 className="item-card__name">{item.name}</h2>
//               <p className="item-card__description">{item.description}</p>
//               <div className="item-card__footer">
//                 <span className="item-card__price">${item.price}</span>
//                 <button className="item-card__add-btn" onClick={() => addToCart(item)}>ADD +</button>
//               </div>
//             </div>
//           </article>
//         ))}
//       </main>

//       {cartItems.length > 0 && (
//         <button className="checkout-sticky" onClick={() => alert("Order Sent!")}>
//           Checkout (${totalPrice.toFixed(2)})
//         </button>
//       )}
//     </div>
//   );
// }

