import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "../styles/ScanQRPage.css";

const ScanQRPage = () => {
  const qrRef = useRef(null);
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState("T1");

  const tables = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"];

  // Generates the URL that the customer would visit
  const generateQRValue = (tableNumber) => {
    const baseUrl = window.location.origin;
    // Points to your menu page
    return `${baseUrl}/usermenu?restaurant_id=REST001&table=${tableNumber}`;
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `Table-${selectedTable}-QR.png`;
    a.click();
  };

  const handleTableSelect = (tableNumber) => {
    localStorage.setItem("tableNumber", tableNumber);
    localStorage.setItem("restaurantId", "REST001");
    // Navigate to the menu
    navigate(`/usermenu?restaurant_id=REST001&table=${tableNumber}`);
  };

  return (
    <div className="scan-qr-container">
      <div className="qr-header">
        <h1>🍽️ Welcome</h1>
        <p>Select your table to begin ordering</p>
      </div>

      <div className="main-grid">
        {/* LEFT: Customer Selection */}
        <div className="card table-selection-card">
          <h2>Select Table Number</h2>
          <p className="card-subtitle">Tap your table number below</p>
          
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

          <div className="manual-entry-section">
            <p>Don't see your table?</p>
            <button className="outline-btn" onClick={() => navigate("/table-entry")}>
              Enter Manually
            </button>
          </div>
        </div>

        {/* RIGHT: QR Generator (For Staff/Printing) */}
        <div className="card qr-generator-card">
          <h2>QR Code Generator</h2>
          <p className="card-subtitle">Generate & Print Table Codes</p>

          <div className="qr-controls">
            <label>Current Table:</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="dark-select"
            >
              {tables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>

          {/* White container for QR because QRs need contrast */}
          <div className="qr-display-box" ref={qrRef}>
            <QRCodeCanvas
              value={generateQRValue(selectedTable)}
              size={200}
              level="H"
              fgColor="#000000"
              bgColor="#ffffff"
            />
            <span className="qr-label">Scan for {selectedTable}</span>
          </div>

          <button className="action-btn" onClick={downloadQRCode}>
            ⬇ Download PNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanQRPage;