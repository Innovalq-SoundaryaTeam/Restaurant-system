import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.gmail_email = os.getenv("GMAIL_EMAIL")
        self.gmail_password = os.getenv("GMAIL_PASSWORD")
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
    
    def send_bill_email(self, to_email: str, customer_name: str, order_details: dict, pdf_path: str = None):
        """Send bill email with PDF attachment"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.gmail_email
            msg['To'] = to_email
            msg['Subject'] = f"Restaurant Bill - Order #{order_details.get('order_number', 'N/A')}"
            
            # Email body
            body = f"""
            Dear {customer_name},
            
            Thank you for dining with us!
            
            Order Details:
            Order Number: {order_details.get('order_number', 'N/A')}
            Table Number: {order_details.get('table_number', 'N/A')}
            Total Amount: ₹{order_details.get('total_amount', 0)}
            
            Items Ordered:
            """
            
            for item in order_details.get('items', []):
                body += f"- {item.get('name', 'Unknown')} x{item.get('quantity', 1)} = ₹{item.get('price', 0)}\n"
            
            body += f"""
            
            Payment Method: {order_details.get('payment_method', 'UPI')}
            
            We hope to see you again soon!
            
            Best regards,
            Restaurant Team
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Attach PDF if provided
            if pdf_path and os.path.exists(pdf_path):
                with open(pdf_path, "rb") as attachment:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment.read())
                
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= "bill_{order_details.get("order_number", "N/A")}.pdf"'
                )
                msg.attach(part)
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.gmail_email, self.gmail_password)
            text = msg.as_string()
            server.sendmail(self.gmail_email, to_email, text)
            server.quit()
            
            return {"success": True, "message": "Bill sent successfully"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

email_service = EmailService()
