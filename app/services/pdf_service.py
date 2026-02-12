from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
import os
from datetime import datetime
from io import BytesIO
from typing import Dict, Any

class PDFService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            textColor=colors.darkblue
        )
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6
        )
        self.right_style = ParagraphStyle(
            'CustomRight',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_RIGHT
        )
    
    def generate_bill_pdf(self, order_details: dict, customer_info: dict, save_path: str = None):
        """Generate PDF bill for single order"""
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

    def generate_session_invoice_pdf(self, invoice_data: Dict[str, Any], save_path: str = None) -> str:
        """Generate PDF invoice for complete session"""
        if not save_path:
            save_path = f"temp_bills/invoice_{invoice_data['invoice_number']}.pdf"
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        doc = SimpleDocTemplate(save_path, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        story = []
        
        # Restaurant Header
        story.append(Paragraph("RESTAURANT BILL", self.title_style))
        story.append(Spacer(1, 20))
        
        # Invoice Info
        invoice_info = [
            ['Invoice Number:', invoice_data['invoice_number']],
            ['Table Number:', invoice_data['table_number']],
            ['Date:', datetime.datetime.fromisoformat(invoice_data['created_at']).strftime('%d-%m-%Y %H:%M:%S')],
        ]
        
        invoice_table = Table(invoice_info, colWidths=[2*inch, 3*inch])
        invoice_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (0, 0), (0, -1), colors.beige),
        ]))
        
        story.append(invoice_table)
        story.append(Spacer(1, 20))
        
        # Orders Summary
        story.append(Paragraph("Orders Summary", self.heading_style))
        
        orders_data = [['Order #', 'Status', 'Amount']]
        for order in invoice_data['orders']:
            orders_data.append([
                order['order_number'],
                order['status'],
                f"₹{order['total_price']:.2f}"
            ])
        
        orders_table = Table(orders_data, colWidths=[2*inch, 2*inch, 1.5*inch])
        orders_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(orders_table)
        story.append(Spacer(1, 20))
        
        # Items Details
        story.append(Paragraph("Item Details", self.heading_style))
        
        items_data = [['Item Name', 'Quantity', 'Price', 'Subtotal']]
        for item in invoice_data['items']:
            items_data.append([
                item['name'],
                str(item['quantity']),
                f"₹{item['price']:.2f}",
                f"₹{item['subtotal']:.2f}"
            ])
        
        items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1*inch, 1.5*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(items_table)
        story.append(Spacer(1, 20))
        
        # Total Summary
        total_data = [
            ['Subtotal:', f"₹{invoice_data['subtotal']:.2f}"],
            [f"GST ({invoice_data['tax_rate']}%):", f"₹{invoice_data['tax_amount']:.2f}"],
            ['Grand Total:', f"₹{invoice_data['grand_total']:.2f}"]
        ]
        
        total_table = Table(total_data, colWidths=[3*inch, 1.5*inch])
        total_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 2), (-1, 2), colors.lightgreen),
            ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 2), (-1, 2), 14),
            ('TEXTCOLOR', (0, 2), (-1, 2), colors.darkgreen),
        ]))
        
        story.append(total_table)
        story.append(Spacer(1, 30))
        
        # Footer
        story.append(Paragraph("Thank you for dining with us!", self.normal_style))
        story.append(Paragraph("Please visit again soon", self.normal_style))
        
        # Build PDF
        doc.build(story)
        
        return save_path

    def generate_session_invoice_pdf_bytes(self, invoice_data: Dict[str, Any]) -> BytesIO:
        """Generate PDF invoice for complete session and return as bytes"""
        buffer = BytesIO()
        save_path = f"temp_bills/invoice_{invoice_data['invoice_number']}.pdf"
        
        # Generate the PDF file first
        self.generate_session_invoice_pdf(invoice_data, save_path)
        
        # Read the generated PDF and return as bytes
        with open(save_path, 'rb') as f:
            buffer.write(f.read())
        
        buffer.seek(0)
        return buffer

pdf_service = PDFService()
