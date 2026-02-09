import enum


class OrderStatus(str, enum.Enum):

    PENDING = "pending"
    PREPARING = "preparing"
    ALMOST_DONE = "almost_done"
    READY = "ready"
    CANCELLED = "cancelled"
    PAID = "paid"
