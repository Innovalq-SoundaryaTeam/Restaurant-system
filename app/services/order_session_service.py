from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional, List, Dict, Any
import random

from app.models.order_session import OrderSession, SessionStatus
from app.models.order import Order, OrderStatus
from app.models.customer import Customer


class OrderSessionService:
    
    @staticmethod
    def generate_session_id():
        """Generate unique session ID"""
        now = datetime.now().strftime("%Y%m%d%H%M%S")
        random_part = random.randint(100, 999)
        return f"SES{now}{random_part}"
    
    @staticmethod
    def create_or_get_session(
        db: Session, 
        table_number: str, 
        customer_id: Optional[int] = None
    ) -> OrderSession:
        """Create new session or get existing active session for table"""
        
        # Check if there's already an active session for this table
        existing_session = db.query(OrderSession).filter(
            OrderSession.table_number == table_number,
            OrderSession.status == SessionStatus.ACTIVE
        ).first()
        
        if existing_session:
            return existing_session
        
        # Create new session
        session = OrderSession(
            session_id=OrderSessionService.generate_session_id(),
            table_number=table_number,
            customer_id=customer_id,
            status=SessionStatus.ACTIVE
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return session
    
    @staticmethod
    def get_session_by_id(db: Session, session_id: str) -> Optional[OrderSession]:
        """Get session by ID"""
        return db.query(OrderSession).filter(
            OrderSession.session_id == session_id
        ).first()
    
    @staticmethod
    def get_active_session_for_table(db: Session, table_number: str) -> Optional[OrderSession]:
        """Get active session for a specific table"""
        return db.query(OrderSession).filter(
            OrderSession.table_number == table_number,
            OrderSession.status == SessionStatus.ACTIVE
        ).first()
    
    @staticmethod
    def get_session_orders(db: Session, session_id: str) -> List[Order]:
        """Get all orders for a session"""
        return db.query(Order).filter(
            Order.session_id == session_id
        ).order_by(Order.created_at).all()
    
    @staticmethod
    def finish_meal_session(db: Session, session_id: str) -> Dict[str, Any]:
        """Finish a meal session and calculate totals"""
        
        session = db.query(OrderSession).filter(
            OrderSession.session_id == session_id
        ).first()
        
        if not session:
            raise ValueError("Session not found")
        
        if session.status == SessionStatus.CLOSED:
            raise ValueError("Session is already closed")
        
        # Get all orders in the session
        orders = db.query(Order).filter(Order.session_id == session_id).all()
        
        if not orders:
            raise ValueError("No orders found in session")
        
        # Calculate totals
        subtotal = sum(float(order.subtotal or order.total_price or 0) for order in orders)
        tax_rate = 0.18  # 18% GST
        tax_amount = subtotal * tax_rate
        grand_total = subtotal + tax_amount
        
        # Update session status
        session.status = SessionStatus.CLOSED
        session.closed_at = datetime.now()
        
        # Update all orders to COMPLETED
        for order in orders:
            order.status = OrderStatus.PAID  # or COMPLETED based on your enum
        
        db.commit()
        
        return {
            "session_id": session_id,
            "table_number": session.table_number,
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "grand_total": grand_total,
            "total_orders": len(orders),
            "orders": [
                {
                    "id": order.id,
                    "order_number": order.order_number,
                    "total_price": float(order.total_price),
                    "status": order.status.value
                }
                for order in orders
            ]
        }
    
    @staticmethod
    def can_create_new_order(db: Session, table_number: str) -> bool:
        """Check if new order can be created for table"""
        session = OrderSessionService.get_active_session_for_table(db, table_number)
        return session is not None and session.status == SessionStatus.ACTIVE
