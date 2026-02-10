import enum

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed" 
    PREPARING = "preparing"
    ALMOST_DONE = "almost_done"
    READY = "ready"
    CANCELLED = "cancelled"
    PAID = "paid"