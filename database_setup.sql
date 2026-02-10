-- Restaurant QR Ordering System - MySQL Database Setup
-- Version: 2.0 (Updated - No OTP Required)
-- Description: Complete database schema for restaurant QR ordering system
-- Features: Real-time orders, billing, admin management, reporting
-- Author: Restaurant Development Team
-- Created: 2024

-- ================================================================================
-- IMPORTANT NOTES:
-- 1. No OTP system - customers are auto-verified
-- 2. Real-time WebSocket support for order updates
-- 3. Complete audit trail with status history
-- 4. Comprehensive reporting views
-- 5. Stored procedures for common operations
-- ================================================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS restaurant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the restaurant database
USE restaurant_db;

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS restaurants;

-- 1. Restaurants Table
CREATE TABLE restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_restaurant_id (restaurant_id)
);

-- 2. Tables Table (Restaurant Tables)
CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id VARCHAR(50) NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 4,
    status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
    qr_code_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_restaurant_table (restaurant_id, table_number),
    INDEX idx_restaurant_table (restaurant_id, table_number)
);

-- 3. Customers Table (Updated - No OTP Required)
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    is_verified TINYINT(1) DEFAULT 1, -- Auto-verified, no OTP needed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone_number),
    INDEX idx_email (email)
);

-- 4. Menu Items Table
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    is_available TINYINT(1) DEFAULT 1,
    preparation_time INT DEFAULT 15, -- in minutes
    spicy_level ENUM('none', 'mild', 'medium', 'hot') DEFAULT 'none',
    dietary_info ENUM('veg', 'non-veg', 'vegan', 'gluten-free') DEFAULT 'non-veg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    INDEX idx_restaurant_menu (restaurant_id),
    INDEX idx_category (category),
    INDEX idx_availability (is_available)
);

-- 5. Orders Table (Updated for better compatibility)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NULL, -- Made nullable for trigger to handle
    restaurant_id VARCHAR(50) NOT NULL,
    customer_id INT,
    table_number VARCHAR(20),
    order_type ENUM('dine-in', 'takeaway', 'delivery') DEFAULT 'dine-in',
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10, 2) DEFAULT 0, -- Default to 0
    subtotal DECIMAL(10, 2),
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    payment_method ENUM('cash', 'card', 'upi', 'wallet') DEFAULT 'upi',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    special_instructions TEXT,
    order_date DATE NOT NULL,
    order_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_order_number (order_number),
    INDEX idx_customer_orders (customer_id),
    INDEX idx_restaurant_orders (restaurant_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date),
    INDEX idx_table_number (table_number)
);

-- 6. Order Items Table (Junction Table)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL, -- Price at time of order
    subtotal DECIMAL(10, 2) NOT NULL, -- quantity * price
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
    INDEX idx_order_items (order_id),
    INDEX idx_menu_item_orders (menu_item_id),
    UNIQUE KEY unique_order_menu_item (order_id, menu_item_id)
);

-- 7. Kitchen Order Status Table (For real-time tracking)
CREATE TABLE kitchen_order_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status ENUM('received', 'preparing', 'ready', 'served') NOT NULL,
    estimated_time INT, -- in minutes
    actual_time INT, -- in minutes
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_kitchen_orders (order_id),
    INDEX idx_status (status)
);

-- 8. Bills Table (For billing and PDF generation)
CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNIQUE NOT NULL,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'wallet') NOT NULL,
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    email_sent TINYINT(1) DEFAULT 0,
    email_sent_at TIMESTAMP NULL,
    pdf_generated TINYINT(1) DEFAULT 0,
    pdf_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_bill_number (bill_number),
    INDEX idx_order_bills (order_id),
    INDEX idx_payment_status (payment_status)
);

-- 9. Admin Users Table
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'manager', 'staff') DEFAULT 'staff',
    is_active TINYINT(1) DEFAULT 1,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- 10. Order Status History Table (For tracking status changes)
CREATE TABLE order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    old_status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'),
    new_status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled') NOT NULL,
    changed_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_history (order_id),
    INDEX idx_status_change (new_status, created_at)
);

-- Insert default restaurant
INSERT INTO restaurants (restaurant_id, name, description, cuisine_type, address, phone, email) VALUES 
('REST001', 'Sample Restaurant', 'Delicious food at your fingertips', 'Multi-cuisine', '123 Restaurant Street, City - 123456', '+91 98765 43210', 'info@restaurant.com');

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, email, password_hash, role) VALUES 
('admin', 'admin@restaurant.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 'super_admin');

-- Insert sample menu items
INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url, is_available, spicy_level, dietary_info) VALUES 
('REST001', 'Classic Burger', 'Juicy beef patty with lettuce, tomato, and our secret sauce', 12.99, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 1, 'mild', 'non-veg'),
('REST001', 'Margherita Pizza', 'Fresh mozzarella, tomato sauce, and basil on wood-fired crust', 15.99, 'Pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg'),
('REST001', 'Caesar Salad', 'Crisp romaine lettuce with parmesan cheese and croutons', 10.99, 'Salads', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg'),
('REST001', 'Spicy Chicken Tacos', 'Three soft tortillas with grilled chicken and chipotle sauce', 13.50, 'Mexican', 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=800&q=80', 1, 'medium', 'non-veg'),
('REST001', 'Mushroom Risotto', 'Creamy arborio rice with fresh mushrooms and truffle oil', 14.99, 'Italian', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg'),
('REST001', 'French Fries', 'Crispy golden potato fries with sea salt', 4.99, 'Sides', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg'),
('REST001', 'Coca Cola', 'Refreshing cola drink', 2.99, 'Beverages', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg'),
('REST001', 'Chocolate Cake', 'Decadent chocolate cake with vanilla frosting', 6.99, 'Desserts', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg');

-- Insert sample tables
INSERT INTO tables (restaurant_id, table_number, capacity, status, qr_code_data) VALUES 
('REST001', 'T1', 4, 'available', '{"restaurantId": "REST001", "tableNumber": "T1"}'),
('REST001', 'T2', 4, 'available', '{"restaurantId": "REST001", "tableNumber": "T2"}'),
('REST001', 'T3', 2, 'available', '{"restaurantId": "REST001", "tableNumber": "T3"}'),
('REST001', 'T4', 6, 'available', '{"restaurantId": "REST001", "tableNumber": "T4"}'),
('REST001', 'T5', 4, 'available', '{"restaurantId": "REST001", "tableNumber": "T5"}'),
('REST001', 'T6', 2, 'available', '{"restaurantId": "REST001", "tableNumber": "T6"}');

-- Create triggers for automatic timestamps
DELIMITER //

CREATE TRIGGER before_orders_insert 
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    IF NEW.order_number IS NULL THEN
        SET NEW.order_number = CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(CONNECTION_ID(), 6, '0'));
    END IF;
    
    IF NEW.order_date IS NULL THEN
        SET NEW.order_date = CURDATE();
    END IF;
    
    IF NEW.order_time IS NULL THEN
        SET NEW.order_time = CURTIME();
    END IF;
END//

CREATE TRIGGER before_bills_insert 
BEFORE INSERT ON bills
FOR EACH ROW
BEGIN
    IF NEW.bill_number IS NULL THEN
        SET NEW.bill_number = CONCAT('BILL', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(CONNECTION_ID(), 6, '0'));
    END IF;
END//

DELIMITER ;

-- Create view for kitchen dashboard (Updated)
CREATE VIEW kitchen_dashboard AS
SELECT 
    o.id,
    o.order_number,
    o.table_number,
    c.name as customer_name,
    c.phone_number,
    o.total_price,
    o.status as order_status,
    o.created_at,
    COUNT(oi.id) as total_items,
    GROUP_CONCAT(CONCAT(oi.quantity, 'x ', mi.name) SEPARATOR ', ') as items_summary,
    TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) as minutes_ago
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.status IN ('pending', 'confirmed', 'preparing', 'ready')
GROUP BY o.id, o.order_number, o.table_number, c.name, c.phone_number, o.total_price, o.status, o.created_at
ORDER BY o.created_at ASC;

-- Create view for active orders (Updated)
CREATE VIEW active_orders AS
SELECT 
    o.id,
    o.order_number,
    o.table_number,
    c.name as customer_name,
    c.phone_number,
    o.status,
    o.total_price,
    o.created_at,
    o.order_date,
    o.order_time,
    CASE 
        WHEN o.status = 'pending' THEN 'New Order'
        WHEN o.status = 'confirmed' THEN 'Confirmed'
        WHEN o.status = 'preparing' THEN 'Preparing'
        WHEN o.status = 'ready' THEN 'Ready for Pickup'
        WHEN o.status = 'served' THEN 'Served'
        WHEN o.status = 'paid' THEN 'Completed'
        ELSE 'Unknown'
    END as status_display
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.status != 'cancelled'
ORDER BY o.created_at DESC;

-- Create view for sales reports
CREATE VIEW daily_sales_report AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(o.id) as total_orders,
    SUM(o.total_price) as total_revenue,
    AVG(o.total_price) as average_order_value,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    SUM(CASE WHEN o.payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
    SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
FROM orders o
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- Create stored procedure for getting order details with items
DELIMITER //
CREATE PROCEDURE get_order_details(
    IN p_order_id INT
)
BEGIN
    SELECT 
        o.id,
        o.order_number,
        o.table_number,
        o.status,
        o.total_price,
        o.created_at,
        o.order_date,
        o.order_time,
        c.name as customer_name,
        c.phone_number,
        c.email as customer_email,
        GROUP_CONCAT(
            JSON_OBJECT(
                'name', mi.name,
                'quantity', oi.quantity,
                'price', oi.price,
                'subtotal', oi.subtotal
            )
        ) as order_items
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE o.id = p_order_id
    GROUP BY o.id, o.order_number, o.table_number, o.status, o.total_price, o.created_at, o.order_date, o.order_time, c.name, c.phone_number, c.email;
END//
DELIMITER ;

-- Create stored procedure for getting menu items with availability
DELIMITER //
CREATE PROCEDURE get_available_menu(
    IN p_restaurant_id VARCHAR(50)
)
BEGIN
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
        mi.dietary_info,
        CASE mi.is_available
            WHEN 1 THEN 'Available'
            ELSE 'Out of Stock'
        END as availability_status
    FROM menu_items mi
    WHERE mi.restaurant_id = p_restaurant_id
    ORDER BY mi.category, mi.name;
END//
DELIMITER ;

-- Create stored procedure for getting today's orders
DELIMITER //
CREATE PROCEDURE get_today_orders(
    IN p_restaurant_id VARCHAR(50)
)
BEGIN
    SELECT 
        o.id,
        o.order_number,
        o.table_number,
        c.name as customer_name,
        o.status,
        o.total_price,
        o.created_at,
        COUNT(oi.id) as item_count,
        TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) as minutes_since_order
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.restaurant_id = p_restaurant_id
    AND DATE(o.created_at) = CURDATE()
    GROUP BY o.id, o.order_number, o.table_number, c.name, o.status, o.total_price, o.created_at
    ORDER BY o.created_at DESC;
END//
DELIMITER ;

-- Create function to calculate order total with tax
DELIMITER //
CREATE FUNCTION calculate_order_total(
    p_subtotal DECIMAL(10,2),
    p_tax_rate DECIMAL(5,2)
) RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE tax_amount DECIMAL(10,2);
    SET tax_amount = p_subtotal * (p_tax_rate / 100);
    RETURN p_subtotal + tax_amount;
END//
DELIMITER ;

-- Create stored procedure for updating order status with history
DELIMITER //
CREATE PROCEDURE update_order_status(
    IN p_order_id INT,
    IN p_new_status VARCHAR(20),
    IN p_changed_by VARCHAR(100),
    IN p_notes TEXT
)
BEGIN
    DECLARE old_status VARCHAR(20);
    
    -- Get current status
    SELECT status INTO old_status FROM orders WHERE id = p_order_id;
    
    -- Update order status
    UPDATE orders 
    SET status = p_new_status, updated_at = CURRENT_TIMESTAMP 
    WHERE id = p_order_id;
    
    -- Add to history
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes)
    VALUES (p_order_id, old_status, p_new_status, p_changed_by, p_notes);
    
    -- Update kitchen status if relevant
    IF p_new_status IN ('preparing', 'ready', 'served') THEN
        INSERT INTO kitchen_order_status (order_id, status, created_by)
        VALUES (p_order_id, p_new_status, p_changed_by)
        ON DUPLICATE KEY UPDATE 
        status = p_new_status, 
        created_by = p_changed_by, 
        created_at = CURRENT_TIMESTAMP;
    END IF;
END//
DELIMITER ;

COMMIT;

-- ================================================================================
-- SETUP COMPLETE
-- ================================================================================

-- USAGE INSTRUCTIONS:
-- 1. Run this script in MySQL to create the database
-- 2. Update .env file with your database credentials
-- 3. Run the FastAPI backend to connect to the database
-- 4. Access the API at http://localhost:8000/docs
-- 5. Frontend will automatically connect to the backend

-- DEFAULT CREDENTIALS:
-- Admin Email: admin@restaurant.com
-- Admin Password: admin123
-- Restaurant ID: REST001

-- SAMPLE DATA INCLUDED:
-- - 1 restaurant (REST001)
-- - 6 tables (T1-T6)
-- - 7 menu items across different categories
-- - 1 admin user

-- VIEWS CREATED:
-- - kitchen_dashboard: Real-time kitchen view
-- - active_orders: All non-cancelled orders
-- - daily_sales_report: Sales analytics

-- STORED PROCEDURES:
-- - get_order_details: Complete order with items
-- - get_available_menu: Menu with availability status
-- - get_today_orders: Today's orders for reporting
-- - update_order_status: Status change with history tracking
-- - calculate_order_total: Tax calculation function

-- WEBSOCKET SUPPORT:
-- Real-time order updates are supported through WebSocket endpoint
-- Kitchen panel receives instant notifications for new orders
-- Customer tracking page shows live order status

-- ================================================================================
-- END OF DATABASE SETUP
-- ================================================================================
