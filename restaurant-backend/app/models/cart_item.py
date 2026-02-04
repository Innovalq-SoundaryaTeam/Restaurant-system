from sqlalchemy import Column, Integer, ForeignKey
from app.db.database import Base


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True)
    cart_id = Column(Integer, ForeignKey("carts.id"))
    menu_item_id = Column(Integer)
    quantity = Column(Integer)
