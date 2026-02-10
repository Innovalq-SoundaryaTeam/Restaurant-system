import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

const QrCode = ({ qrValue = "restaurant_id:rest_001", size = 250, showDownload = true }) => {
  const qrRef = useRef();

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const url = canvas.toDataURL("image/png");

    const a = document.createElement("a");
    a.href = url;
    a.download = "restaurant-qr-code.png";
    a.click();
  };

  return (
    <div className="qr-code-container">
      <div ref={qrRef} className="qr-code-wrapper">
        <QRCodeCanvas
          value={qrValue}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>
      
      {showDownload && (
        <button className="btn btn-primary" onClick={downloadQRCode}>
          Download QR Code
        </button>
      )}
    </div>
  );
};

export default QrCode;
