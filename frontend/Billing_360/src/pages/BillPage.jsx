import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPrint, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import "../styles/BillPage.css"; // We'll define the professional styles below

const BillPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generated, setGenerated] = useState(false);
  const [processing, setProcessing] = useState(false);


const generateFinalBill = async () => {
  try {
    setProcessing(true);
    await fetch(`http://127.0.0.1:8000/api/billing/generate-session-bill/${sessionId}`, {
      method: "POST"
    });

    // refresh session data
    const res = await fetch(`http://127.0.0.1:8000/api/sessions/${sessionId}`);
    const data = await res.json();
    setSession(data);
    setGenerated(true);

  } catch (err) {
    console.error("Generate Bill Error:", err);
  }finally {
    setProcessing(false);
  }
};


  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/sessions/${sessionId}`);
        const data = await res.json();
        setSession(data);
      } catch (err) {
        console.error("Bill Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBillDetails();
  }, [sessionId]);

  useEffect(() => {
  if (generated) {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [generated, navigate]);


  if (loading) return <div className="loader-dark">Generating Invoice...</div>;
  if (!session) return null;


  const subtotal = session.orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const gst = subtotal * 0.05; // 5% GST
  const grandTotal = subtotal + gst;

  return (
    <div className="bill-container dark-theme">
      <div className="bill-actions no-print">
        <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>
        <button className="print-btn" onClick={() => window.print()}><FaPrint /> Print Receipt</button>
        <button className="generate-btn" onClick={generateFinalBill} disabled={generated || processing} > {generated ? "Bill Generated" :  processing ? "Generating..." :  "Generate Bill"}</button>
      </div>

      <div className="receipt-paper">
        <header className="receipt-header">
          <h2 className="brand-name">BILLING 360</h2>
          <p>Premium Dining Experience</p>
          <div className="receipt-divider"></div>
        </header>

        <div className="receipt-info">
          <p><span>Table:</span> <strong>{session.table_number}</strong></p>
          <p><span>Session ID:</span> #{sessionId.slice(-6)}</p>
          <p><span>Date:</span> {new Date().toLocaleString()}</p>
        </div>

        <table className="receipt-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {session.orders.flatMap(order => order.items).map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="receipt-divider"></div>

        <div className="receipt-totals">
          <p>Subtotal: <span>₹{subtotal.toFixed(2)}</span></p>
          <p>GST (5%): <span>₹{gst.toFixed(2)}</span></p>
          <div className="grand-total">
            TOTAL AMOUNT: <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <footer className="receipt-footer">
          <FaCheckCircle className="success-icon" />
          <p>Thank you for dining with us!</p>
          <small>Visit again soon</small>
        </footer>
      </div>
    </div>
  );
};

export default BillPage;