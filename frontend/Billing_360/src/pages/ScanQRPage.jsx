import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "../styles/ScanQRPage.css";

const ScanQRPage = () => {
  const qrRef = useRef(null);
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState("T1");

  const tables = ["T1", "T2", "T3", "T4", "T5", "T6"];

  const generateQRValue = (tableNumber) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/usermenu?restaurant_id=REST001&table=${tableNumber}`;
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-code-table-${selectedTable}.png`;
    a.click();
  };

  const handleTableSelect = (tableNumber) => {
    localStorage.setItem("tableNumber", tableNumber);
    localStorage.setItem("restaurantId", "REST001");
    navigate(`/customer?restaurant_id=REST001&table=${tableNumber}`);
  };

  return (
    <div className="scan-qr-container">
      {/* HEADER */}
      <div className="qr-header">
        <h1>🍽️ Restaurant QR Ordering</h1>
        <p>Select your table number or scan the QR code</p>
      </div>

      <div className="entry-options">
        <div className="option-section">

          {/* TABLE BUTTONS */}
          <div className="table-selector">
            <h2>Select Your Table</h2>
            <div className="table-grid">
              {tables.map((table) => (
                <button
                  key={table}
                  className="table-btn"
                  onClick={() => handleTableSelect(table)}
                >
                  {table}
                </button>
              ))}
            </div>
          </div>

          {/* QR SECTION */}
          <div className="qr-section">
            <h2>Scan QR Code for Table</h2>

            <div className="qr-dropdown">
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
              >
                {tables.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
              </select>
            </div>

            <div className="qr-display" ref={qrRef}>
              <QRCodeCanvas
                value={generateQRValue(selectedTable)}
                size={250}
                level="H"
                includeMargin
              />
            </div>

            <div className="qr-actions">
              <button className="download-btn" onClick={downloadQRCode}>
                📥 Download QR Code
              </button>
            </div>
          </div>

          {/* SINGLE MANUAL ENTRY (ONLY ONE) */}
          <div className="manual-entry">
            <h2>Enter Table Number Manually</h2>
            <button
              className="manual-btn"
              onClick={() => navigate("/table-entry")}
            >
              📝 Enter Table Number
            </button>
          </div>

          {/* INSTRUCTIONS */}
          <div className="instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>Scan the QR code placed on your table</li>
              <li>If QR scan fails, use manual entry</li>
              <li>Menu opens automatically after selection</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScanQRPage;
