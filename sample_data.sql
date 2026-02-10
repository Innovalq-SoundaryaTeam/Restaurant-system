-- Sample Data for Restaurant QR Ordering System
-- This file contains sample data for testing and demonstration

USE restaurant_db;

-- Insert more restaurants
INSERT INTO restaurants (restaurant_id, name, description, cuisine_type, address, phone, email) VALUES 
('REST002', 'Italian Bistro', 'Authentic Italian cuisine in a cozy atmosphere', 'Italian', '456 Pasta Street, City - 123457', '+91 98765 43211', 'info@italianbistro.com'),
('REST003', 'Spice Garden', 'Traditional Indian spices and flavors', 'Indian', '789 Curry Lane, City - 123458', '+91 98765 43212', 'info@spicegarden.com'),
('REST004', 'Sushi Master', 'Fresh Japanese sushi and sashimi', 'Japanese', '321 Fish Market, City - 123459', '+91 98765 43213', 'info@sushimaster.com');

-- Insert more menu items for REST001
INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url, is_available, spicy_level, dietary_info, preparation_time) VALUES 
('REST001', 'BBQ Chicken Wings', 'Crispy chicken wings tossed in BBQ sauce', 8.99, 'Starters', 'https://images.unsplash.com/photo-1567620838834-3d8a9c4b4b1c?auto=format&fit=crop&w=800&q=80', 1, 'medium', 'non-veg', 20),
('REST001', 'Vegetable Spring Rolls', 'Crispy rolls with fresh vegetables', 6.99, 'Starters', 'https://images.unsplash.com/photo-1567620838834-3d8a9c4b4b1c?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg', 15),
('REST001', 'Grilled Salmon', 'Fresh Atlantic salmon with lemon butter sauce', 18.99, 'Main Course', 'https://images.unsplash.com/photo-1567620838834-3d8a9c4b4b1c?auto=format&fit=crop&w=800&q=80', 1, 'none', 'non-veg', 25),
('REST001', 'Pasta Carbonara', 'Classic Italian pasta with bacon and cream sauce', 14.99, 'Italian', 'https://images.unsplash.com/photo-1567620838834-3d8a9c4b4b1c?auto=format&fit=crop&w=800&q=80', 1, 'none', 'non-veg', 20),
('REST001', 'Greek Salad', 'Fresh vegetables with feta cheese and olives', 9.99, 'Salads', 'https://images.unsplash.com/photo-1567620838834-3d8a9c4b4b1c?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg', 10),
('REST001', 'Fish Tacos', 'Grilled fish with cabbage slaw and chipotle mayo', 12.99, 'Mexican', 'https://images.unsplash.com/photo-1567620838834-3d8a9c4b4b1c?auto=format&fit=crop&w=800&q=80', 1, 'mild', 'non-veg', 18),
('REST001', 'Lemonade', 'Fresh squeezed lemonade with mint', 3.99, 'Beverages', 'https://images.unsplash.com/photo-1567620838834-3d8a9c4b4b1c?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg', 5),
('REST001', 'Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce and nuts', 5.99, 'Desserts', 'https://images.unsplash.com/photo-1567620838834-3d8a9c4b4b1c?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg', 5);

-- Insert sample customers
INSERT INTO customers (name, phone_number, email, is_verified) VALUES 
('John Doe', '+91 98765 43210', 'john.doe@email.com', 1),
('Jane Smith', '+91 98765 43211', 'jane.smith@email.com', 1),
('Mike Johnson', '+91 98765 43212', 'mike.johnson@email.com', 1),
('Sarah Williams', '+91 98765 43213', 'sarah.williams@email.com', 1),
('David Brown', '+91 98765 43214', 'david.brown@email.com', 1),
('Emily Davis', '+91 98765 43215', 'emily.davis@email.com', 1),
('Robert Miller', '+91 98765 43216', 'robert.miller@email.com', 1),
('Lisa Wilson', '+91 98765 43217', 'lisa.wilson@email.com', 1);

-- Insert sample orders
INSERT INTO orders (order_number, restaurant_id, customer_id, table_number, status, total_price, subtotal, tax_amount, payment_method, payment_status, order_date, order_time) VALUES 
('ORD20260206001', 'REST001', 1, 'T1', 'paid', 31.98, 31.98, 0.00, 'upi', 'paid', '2026-02-06', '12:30:00'),
('ORD20260206002', 'REST001', 2, 'T2', 'preparing', 45.97, 45.97, 0.00, 'card', 'pending', '2026-02-06', '13:15:00'),
('ORD20260206003', 'REST001', 3, 'T3', 'ready', 28.98, 28.98, 0.00, 'cash', 'pending', '2026-02-06', '13:45:00'),
('ORD20260206004', 'REST001', 4, 'T4', 'confirmed', 52.96, 52.96, 0.00, 'upi', 'pending', '2026-02-06', '14:20:00'),
('ORD20260206005', 'REST001', 5, 'T5', 'pending', 19.98, 19.98, 0.00, 'wallet', 'pending', '2026-02-06', '14:50:00');

-- Insert sample order items
INSERT INTO order_items (order_id, menu_item_id, quantity, price, subtotal) VALUES 
-- Order 1 items
(1, 1, 2, 12.99, 25.98), -- 2x Classic Burger
(1, 7, 2, 2.99, 5.98),  -- 2x Coca Cola

-- Order 2 items  
(2, 2, 1, 15.99, 15.99), -- 1x Margherita Pizza
(2, 3, 1, 10.99, 10.99), -- 1x Caesar Salad
(2, 4, 1, 13.50, 13.50), -- 1x Spicy Chicken Tacos
(2, 7, 1, 2.99, 2.99),  -- 1x Coca Cola

-- Order 3 items
(3, 5, 1, 14.99, 14.99), -- 1x Mushroom Risotto
(3, 6, 1, 4.99, 4.99),  -- 1x French Fries
(3, 9, 1, 5.99, 5.99),  -- 1x Ice Cream Sundae

-- Order 4 items
(4, 1, 2, 12.99, 25.98), -- 2x Classic Burger
(4, 6, 2, 4.99, 9.98),   -- 2x French Fries
(4, 7, 2, 2.99, 5.98),   -- 2x Coca Cola
(4, 8, 1, 6.99, 6.99),   -- 1x Chocolate Cake

-- Order 5 items
(5, 2, 1, 15.99, 15.99), -- 1x Margherita Pizza
(5, 7, 1, 2.99, 2.99),  -- 1x Coca Cola
(5, 8, 1, 6.99, 6.99);  -- 1x Chocolate Cake

-- Insert sample bills
INSERT INTO bills (order_id, bill_number, subtotal, tax_amount, total_amount, payment_method, payment_status, email_sent, pdf_generated) VALUES 
(1, 'BILL20260206001', 31.98, 0.00, 31.98, 'upi', 'paid', 1, 1),
(2, 'BILL20260206002', 45.97, 0.00, 45.97, 'card', 'pending', 0, 0),
(3, 'BILL20260206003', 28.98, 0.00, 28.98, 'cash', 'pending', 0, 0),
(4, 'BILL20260206004', 52.96, 0.00, 52.96, 'upi', 'pending', 0, 0),
(5, 'BILL20260206005', 19.98, 0.00, 19.98, 'wallet', 'pending', 0, 0);

-- Insert kitchen order status
INSERT INTO kitchen_order_status (order_id, status, estimated_time, actual_time, notes, created_by) VALUES 
(1, 'served', 25, 20, 'Order completed successfully', 'kitchen_staff'),
(2, 'preparing', 30, NULL, 'Currently preparing', 'kitchen_staff'),
(3, 'ready', 20, 18, 'Ready for pickup', 'kitchen_staff'),
(4, 'preparing', 35, NULL, 'Started preparation', 'kitchen_staff'),
(5, 'received', 25, NULL, 'Order received', 'kitchen_staff');

-- Insert order status history
INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes) VALUES 
(1, 'pending', 'confirmed', 'system', 'Order confirmed'),
(1, 'confirmed', 'preparing', 'kitchen_staff', 'Started preparation'),
(1, 'preparing', 'ready', 'kitchen_staff', 'Order ready'),
(1, 'ready', 'served', 'kitchen_staff', 'Order served'),
(1, 'served', 'paid', 'system', 'Payment completed'),

(2, 'pending', 'confirmed', 'system', 'Order confirmed'),
(2, 'confirmed', 'preparing', 'kitchen_staff', 'Started preparation'),

(3, 'pending', 'confirmed', 'system', 'Order confirmed'),
(3, 'confirmed', 'preparing', 'kitchen_staff', 'Started preparation'),
(3, 'preparing', 'ready', 'kitchen_staff', 'Order ready'),

(4, 'pending', 'confirmed', 'system', 'Order confirmed'),
(4, 'confirmed', 'preparing', 'kitchen_staff', 'Started preparation'),

(5, 'pending', 'confirmed', 'system', 'Order confirmed');

-- Insert more admin users
INSERT INTO admin_users (username, email, password_hash, role) VALUES 
('manager', 'manager@restaurant.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 'manager'),
('kitchen', 'kitchen@restaurant.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 'staff'),
('waiter', 'waiter@restaurant.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 'staff');

-- Insert tables for other restaurants
INSERT INTO tables (restaurant_id, table_number, capacity, status, qr_code_data) VALUES 
('REST002', 'R1', 4, 'available', '{"restaurantId": "REST002", "tableNumber": "R1"}'),
('REST002', 'R2', 4, 'available', '{"restaurantId": "REST002", "tableNumber": "R2"}'),
('REST002', 'R3', 2, 'available', '{"restaurantId": "REST002", "tableNumber": "R3"}'),

('REST003', 'S1', 4, 'available', '{"restaurantId": "REST003", "tableNumber": "S1"}'),
('REST003', 'S2', 6, 'available', '{"restaurantId": "REST003", "tableNumber": "S2"}'),
('REST003', 'S3', 4, 'available', '{"restaurantId": "REST003", "tableNumber": "S3"}'),

('REST004', 'J1', 2, 'available', '{"restaurantId": "REST004", "tableNumber": "J1"}'),
('REST004', 'J2', 4, 'available', '{"restaurantId": "REST004", "tableNumber": "J2"}'),
('REST004', 'J3', 2, 'available', '{"restaurantId": "REST004", "tableNumber": "J3"}');

COMMIT;
