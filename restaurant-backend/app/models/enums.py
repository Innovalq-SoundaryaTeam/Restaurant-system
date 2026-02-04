import enum


class OrderStatus(str, enum.Enum):

    PENDING = "PENDING"
    PREPARING = "PREPARING"
    ALMOST_DONE = "ALMOST_DONE"
    READY = "READY"
    CANCELLED = "CANCELLED"
    PAID = "PAID"
