from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import os
from datetime import datetime

class PDFService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=1  # Center
        )
    
    def generate_bill_pdf(self, order_details: dict, customer_info: dict, save_path: str = None):
        """Generate PDF bill for the order"""
        if not save_path:
            save_path = f"temp_bills/bill_{order_details.get('order_number', datetime.now().strftime('%Y%m%d_%H%M%S'))}.pdf"
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        doc = SimpleDocTemplate(save_path, pagesize=A4)
        story = []
        
        # Restaurant Header
        story.append(Paragraph("Restaurant Name", self.title_style))
        story.append(Paragraph("123 Restaurant Street, City - 123456", self.styles['Normal']))
        story.append(Paragraph("Phone: +91 98765 43210", self.styles['Normal']))
        story.append(Paragraph("Email: info@restaurant.com", self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Bill Title
        story.append(Paragraph("TAX INVOICE / BILL", self.styles['Heading2']))
        story.append(Spacer(1, 12))
        
        # Customer and Order Info
        customer_data = [
            ["Customer Name:", customer_info.get('name', 'N/A')],
            ["Phone:", customer_info.get('phone', 'N/A')],
            ["Email:", customer_info.get('email', 'N/A')],
            ["Order Number:", order_details.get('order_number', 'N/A')],
            ["Table Number:", order_details.get('table_number', 'N/A')],
            ["Date & Time:", datetime.now().strftime("%d/%m/%Y %H:%M:%S")],
        ]
        
        customer_table = Table(customer_data, colWidths=[2*inch, 4*inch])
        customer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (0, 0), (0, -1), colors.grey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
        ]))
        
        story.append(customer_table)
        story.append(Spacer(1, 20))
        
        # Order Items
        story.append(Paragraph("Order Details", self.styles['Heading2']))
        story.append(Spacer(1, 12))
        
        items_data = [["Item Name", "Quantity", "Price", "Total"]]
        
        for item in order_details.get('items', []):
            items_data.append([
                item.get('name', 'Unknown'),
                str(item.get('quantity', 1)),
                f"₹{item.get('price', 0)}",
                f"₹{item.get('price', 0) * item.get('quantity', 1)}"
            ])
        
        items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1*inch, 1*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(items_table)
        story.append(Spacer(1, 20))
        
        # Total Amount
        total_amount = order_details.get('total_amount', 0)
        total_data = [["", "", "Total Amount:", f"₹{total_amount}"]]
        
        total_table = Table(total_data, colWidths=[3*inch, 1*inch, 1*inch, 1*inch])
        total_table.setStyle(TableStyle([
            ('BACKGROUND', (2, 0), (3, 0), colors.grey),
            ('TEXTCOLOR', (2, 0), (3, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (2, 0), (3, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        story.append(total_table)
        story.append(Spacer(1, 30))
        
        # Footer
        story.append(Paragraph("Thank you for dining with us!", self.styles['Normal']))
        story.append(Paragraph("Please visit again", self.styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        return save_path

pdf_service = PDFService()
