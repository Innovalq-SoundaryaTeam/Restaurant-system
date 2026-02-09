-- Common SQL Queries for Restaurant QR Ordering System
-- This file contains frequently used queries for the restaurant management system

-- ============================================
-- MENU MANAGEMENT QUERIES
-- ============================================

-- Get all available menu items for a restaurant
SELECT 
    mi.id,
    mi.name,
    mi.description,
    mi.price,
    mi.category,
    mi.image_url,
    mi.is_available,
    mi.preparation_time,
    mi.spicy_level,
    mi.dietary_info
FROM menu_items mi
WHERE mi.restaurant_id = 'REST001' 
    AND mi.is_available = 1
ORDER BY mi.category, mi.name;

-- Get menu items by category
SELECT 
    mi.id,
    mi.name,
    mi.description,
    mi.price,
    mi.image_url,
    mi.is_available
FROM menu_items mi
WHERE mi.restaurant_id = 'REST001' 
    AND mi.category = 'Burgers'
    AND mi.is_available = 1
ORDER BY mi.name;

-- Add new menu item
INSERT INTO menu_items (
    restaurant_id, 
    name, 
    description, 
    price, 
    category, 
    image_url, 
    is_available, 
    spicy_level, 
    dietary_info, 
    preparation_time
) VALUES (
    'REST001', 
    'New Burger', 
    'Delicious new burger with special sauce', 
    14.99, 
    'Burgers', 
    'https://example.com/image.jpg', 
    1, 
    'medium', 
    'non-veg', 
    20
);

-- Update menu item availability
UPDATE menu_items 
SET is_available = 0 
WHERE id = 1 AND restaurant_id = 'REST001';

-- ============================================
-- ORDER MANAGEMENT QUERIES
-- ============================================

-- Get all orders for a restaurant (for admin)
SELECT 
    o.id,
    o.order_number,
    o.table_number,
    c.name as customer_name,
    c.phone_number,
    c.email,
    o.total_price,
    o.status,
    o.payment_method,
    o.payment_status,
    o.order_date,
    o.order_time,
    o.created_at
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.restaurant_id = 'REST001'
ORDER BY o.created_at DESC;

-- Get order details with items
SELECT 
    o.id as order_id,
    o.order_number,
    o.table_number,
    c.name as customer_name,
    c.phone_number,
    c.email,
    o.total_price,
    o.status,
    o.payment_method,
    o.special_instructions,
    o.created_at,
    oi.menu_item_id,
    oi.quantity,
    oi.price as item_price,
    oi.subtotal,
    mi.name as item_name,
    mi.description as item_description
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.id = 1;

-- Create new order with items (transaction)
START TRANSACTION;

-- Insert order
INSERT INTO orders (
    order_number,
    restaurant_id,
    customer_id,
    table_number,
    total_price,
    subtotal,
    payment_method,
    order_date,
    order_time
) VALUES (
    CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(CONNECTION_ID(), 6, '0')),
    'REST001',
    1,
    'T1',
    31.98,
    31.98,
    'upi',
    CURDATE(),
    CURTIME()
);

-- Get the order ID
SET @last_order_id = LAST_INSERT_ID();

-- Insert order items
INSERT INTO order_items (order_id, menu_item_id, quantity, price, subtotal) VALUES
(@last_order_id, 1, 2, 12.99, 25.98),
(@last_order_id, 7, 2, 2.99, 5.98);

COMMIT;

-- Update order status
CALL update_order_status(1, 'preparing', 'kitchen_staff', 'Order is being prepared');

-- ============================================
-- KITCHEN DASHBOARD QUERIES
-- ============================================

-- Get active orders for kitchen
SELECT 
    o.id,
    o.order_number,
    o.table_number,
    c.name as customer_name,
    c.phone_number,
    o.total_price,
    o.status,
    o.created_at,
    COUNT(oi.id) as total_items,
    GROUP_CONCAT(CONCAT(oi.quantity, 'x ', mi.name) SEPARATOR ', ') as items_summary,
    TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) as minutes_ago
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.status IN ('pending', 'confirmed', 'preparing', 'ready')
    AND o.restaurant_id = 'REST001'
GROUP BY o.id, o.order_number, o.table_number, c.name, c.phone_number, o.total_price, o.status, o.created_at
ORDER BY 
    CASE o.status 
        WHEN 'pending' THEN 1
        WHEN 'confirmed' THEN 2
        WHEN 'preparing' THEN 3
        WHEN 'ready' THEN 4
    END,
    o.created_at ASC;

-- Get kitchen order status
SELECT 
    kos.order_id,
    o.order_number,
    kos.status,
    kos.estimated_time,
    kos.actual_time,
    kos.notes,
    kos.created_at,
    kos.created_by
FROM kitchen_order_status kos
JOIN orders o ON kos.order_id = o.id
WHERE o.restaurant_id = 'REST001'
ORDER BY kos.created_at DESC;

-- ============================================
-- BILLING AND REPORTS QUERIES
-- ============================================

-- Generate daily sales report
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(o.id) as total_orders,
    SUM(o.total_price) as total_revenue,
    AVG(o.total_price) as average_order_value,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    SUM(CASE WHEN o.payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
    SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
    SUM(CASE WHEN o.payment_method = 'upi' THEN o.total_price ELSE 0 END) as upi_revenue,
    SUM(CASE WHEN o.payment_method = 'card' THEN o.total_price ELSE 0 END) as card_revenue,
    SUM(CASE WHEN o.payment_method = 'cash' THEN o.total_price ELSE 0 END) as cash_revenue
FROM orders o
WHERE o.restaurant_id = 'REST001'
    AND DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- Get popular menu items
SELECT 
    mi.name,
    mi.category,
    COUNT(oi.id) as times_ordered,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.subtotal) as total_revenue,
    AVG(oi.price) as average_price
FROM menu_items mi
JOIN order_items oi ON mi.id = oi.menu_item_id
JOIN orders o ON oi.order_id = o.id
WHERE mi.restaurant_id = 'REST001'
    AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY mi.id, mi.name, mi.category
ORDER BY total_quantity_sold DESC
LIMIT 10;

-- Get customer order history
SELECT 
    o.id,
    o.order_number,
    o.total_price,
    o.status,
    o.payment_method,
    o.order_date,
    o.order_time,
    COUNT(oi.id) as total_items,
    GROUP_CONCAT(CONCAT(oi.quantity, 'x ', mi.name) SEPARATOR ', ') as items_summary
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.customer_id = 1
    AND o.restaurant_id = 'REST001'
GROUP BY o.id, o.order_number, o.total_price, o.status, o.payment_method, o.order_date, o.order_time
ORDER BY o.created_at DESC;

-- ============================================
-- CUSTOMER MANAGEMENT QUERIES
-- ============================================

-- Get all customers
SELECT 
    c.id,
    c.name,
    c.phone_number,
    c.email,
    c.is_verified,
    c.created_at,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_price), 0) as total_spent,
    MAX(o.created_at) as last_order_date
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.phone_number, c.email, c.is_verified, c.created_at
ORDER BY c.created_at DESC;

-- Search customers
SELECT 
    c.id,
    c.name,
    c.phone_number,
    c.email,
    c.is_verified,
    c.created_at
FROM customers c
WHERE c.name LIKE '%John%' 
    OR c.phone_number LIKE '%98765%' 
    OR c.email LIKE '%john%'
ORDER BY c.name;

-- ============================================
-- TABLE MANAGEMENT QUERIES
-- ============================================

-- Get all tables for a restaurant
SELECT 
    t.id,
    t.table_number,
    t.capacity,
    t.status,
    t.qr_code_data,
    CASE 
        WHEN t.status = 'occupied' THEN 'red'
        WHEN t.status = 'reserved' THEN 'orange'
        ELSE 'green'
    END as status_color
FROM tables t
WHERE t.restaurant_id = 'REST001'
ORDER BY t.table_number;

-- Update table status
UPDATE tables 
SET status = 'occupied' 
WHERE restaurant_id = 'REST001' 
    AND table_number = 'T1';

-- ============================================
-- PERFORMANCE ANALYSIS QUERIES
-- ============================================

-- Peak hours analysis
SELECT 
    HOUR(o.created_at) as hour_of_day,
    COUNT(o.id) as order_count,
    SUM(o.total_price) as total_revenue
FROM orders o
WHERE o.restaurant_id = 'REST001'
    AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY HOUR(o.created_at)
ORDER BY order_count DESC;

-- Table performance
SELECT 
    t.table_number,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_price), 0) as total_revenue,
    AVG(o.total_price) as average_order_value
FROM tables t
LEFT JOIN orders o ON t.table_number = o.table_number 
    AND t.restaurant_id = o.restaurant_id
WHERE t.restaurant_id = 'REST001'
    AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY t.id, t.table_number
ORDER BY total_revenue DESC;

-- ============================================
-- INVENTORY AND STOCK QUERIES
-- ============================================

-- Get items running low (if inventory tracking is added)
SELECT 
    mi.name,
    mi.category,
    mi.is_available,
    COUNT(oi.id) as recent_orders,
    SUM(oi.quantity) as total_quantity_ordered
FROM menu_items mi
LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE mi.restaurant_id = 'REST001'
    AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY mi.id, mi.name, mi.category, mi.is_available
HAVING total_quantity_ordered > 50
ORDER BY total_quantity_ordered DESC;

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Clean up old order history (keep last 90 days)
DELETE FROM order_status_history 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Clean up old kitchen status (keep last 7 days)
DELETE FROM kitchen_order_status 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Update order numbers for consistency
UPDATE orders 
SET order_number = CONCAT('ORD', DATE_FORMAT(created_at, '%Y%m%d'), LPAD(id, 6, '0'))
WHERE order_number IS NULL OR order_number = '';

-- ============================================
-- SEARCH AND FILTERING QUERIES
-- ============================================

-- Search menu items
SELECT 
    mi.id,
    mi.name,
    mi.description,
    mi.price,
    mi.category,
    mi.image_url,
    mi.is_available,
    mi.spicy_level,
    mi.dietary_info,
    MATCH(mi.name, mi.description) AGAINST('burger' IN NATURAL LANGUAGE MODE) as relevance_score
FROM menu_items mi
WHERE mi.restaurant_id = 'REST001'
    AND mi.is_available = 1
    AND (mi.name LIKE '%burger%' 
         OR mi.description LIKE '%burger%'
         OR MATCH(mi.name, mi.description) AGAINST('burger' IN NATURAL LANGUAGE MODE))
ORDER BY relevance_score DESC, mi.name;

-- Filter menu items by dietary preferences
SELECT 
    mi.id,
    mi.name,
    mi.description,
    mi.price,
    mi.category,
    mi.image_url,
    mi.dietary_info
FROM menu_items mi
WHERE mi.restaurant_id = 'REST001'
    AND mi.is_available = 1
    AND mi.dietary_info IN ('veg', 'vegan')
ORDER BY mi.category, mi.name;
