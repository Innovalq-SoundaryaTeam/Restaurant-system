import urllib.request
import urllib.parse
import json

# Test placing an order
order_data = {
    "table_number": "T1",
    "phone_number": "9999999999",
    "items": [
        {
            "menu_item_id": 1,
            "quantity": 2
        }
    ]
}

try:
    data = json.dumps(order_data).encode('utf-8')
    req = urllib.request.Request(
        "http://localhost:8000/api/orders",
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req) as response:
        result = response.read().decode('utf-8')
        print("Order Response Status:", response.status)
        print("Order Response:", result)
    
except Exception as e:
    print("Error placing order:", e)

# Test getting kitchen orders
try:
    with urllib.request.urlopen("http://localhost:8000/api/kitchen/orders") as response:
        result = response.read().decode('utf-8')
        print("\nKitchen Orders Status:", response.status)
        print("Kitchen Orders:", result)
    
except Exception as e:
    print("Error getting kitchen orders:", e)
