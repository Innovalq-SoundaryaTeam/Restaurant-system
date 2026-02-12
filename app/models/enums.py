import enum

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED" 
    PREPARING = "PREPARING"
    ALMOST_DONE = "ALMOST_DONE"
    READY = "READY"
    SERVED = "SERVED"
    CANCELLED = "CANCELLED"
    PAID = "PAID"