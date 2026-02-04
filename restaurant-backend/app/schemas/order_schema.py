from pydantic import BaseModel, Field
from typing import List


# ==============================
# ORDER ITEM
# ==============================
class OrderItemSchema(BaseModel):

    menu_item_id: int = Field(..., gt=0)

    quantity: int = Field(
        ...,
        gt=0,
        description="Quantity must be greater than 0"
    )


# ==============================
# PLACE ORDER
# ==============================
class PlaceOrderSchema(BaseModel):

    table_number: int = Field(..., gt=0)

    phone_number: str = Field(
        ...,
        min_length=10,
        max_length=15
    )

    items: List[OrderItemSchema]
