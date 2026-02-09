-- Restaurant Ordering System - MySQL Database Schema
-- Version: 1.0 - Complete Schema
-- No OTP System - Direct Customer Flow

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
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS bills;

-- 1. Staff Table (Admin & Kitchen Staff)
CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role ENUM('ADMIN', 'KITCHEN', 'MANAGER') NOT NULL,
    pin VARCHAR(255) NOT NULL,  -- hashed password
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_role (role)
);

-- 2. Tables Table (Restaurant Tables)
CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT DEFAULT 4,
    status ENUM('FREE', 'OCCUPIED', 'RESERVED', 'CLEANING') DEFAULT 'FREE',
    qr_code_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_table_number (table_number),
    INDEX idx_status (status)
);

-- 3. Customers Table (No OTP Required)
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) NULL,
    is_verified BOOLEAN DEFAULT TRUE, -- Auto-verified, no OTP needed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone_number),
    INDEX idx_email (email)
);

-- 4. Menu Items Table
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    preparation_time INT DEFAULT 15, -- in minutes
    spicy_level ENUM('none', 'mild', 'medium', 'hot') DEFAULT 'none',
    dietary_info ENUM('veg', 'non-veg', 'vegan', 'gluten-free') DEFAULT 'non-veg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_availability (is_available)
);

-- 5. Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    customer_id INT NOT NULL,
    status ENUM('PENDING', 'PREPARING', 'ALMOST_DONE', 'READY', 'CANCELLED', 'PAID') DEFAULT 'PENDING',
    total_price DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    payment_method ENUM('cash', 'card', 'upi', 'wallet') DEFAULT 'upi',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    special_instructions TEXT,
    order_date DATE NOT NULL,
    order_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_order_number (order_number),
    INDEX idx_customer_orders (customer_id),
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
    INDEX idx_menu_item_orders (menu_item_id)
);

-- 7. Bills Table (For billing and PDF generation)
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
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP NULL,
    pdf_generated BOOLEAN DEFAULT FALSE,
    pdf_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_bill_number (bill_number),
    INDEX idx_order_bills (order_id),
    INDEX idx_payment_status (payment_status)
);

-- Create trigger for automatic order numbering
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
DELIMITER ;

-- Create trigger for automatic bill numbering
DELIMITER //
CREATE TRIGGER before_bills_insert 
BEFORE INSERT ON bills
FOR EACH ROW
BEGIN
    IF NEW.bill_number IS NULL THEN
        SET NEW.bill_number = CONCAT('BILL', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(CONNECTION_ID(), 6, '0'));
    END IF;
END//
DELIMITER ;

-- Create view for kitchen dashboard
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
WHERE o.status IN ('PENDING', 'PREPARING', 'ALMOST_DONE', 'READY')
GROUP BY o.id, o.order_number, o.table_number, c.name, c.phone_number, o.total_price, o.status, o.created_at
ORDER BY o.created_at ASC;

-- Insert default admin user (password: 1234)
INSERT INTO staff (name, phone, role, pin) VALUES 
('Admin', '9999999999', 'ADMIN', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e');

-- Insert sample tables
INSERT INTO tables (table_number, capacity, status, qr_code_data) VALUES 
('T1', 4, 'FREE', '{"tableNumber": "T1"}'),
('T2', 4, 'FREE', '{"tableNumber": "T2"}'),
('T3', 2, 'FREE', '{"tableNumber": "T3"}'),
('T4', 6, 'FREE', '{"tableNumber": "T4"}'),
('T5', 4, 'FREE', '{"tableNumber": "T5"}'),
('T6', 2, 'FREE', '{"tableNumber": "T6"}');

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, image_url, is_available, spicy_level, dietary_info) VALUES 
('Classic Burger', 'Juicy beef patty with lettuce, tomato, and our secret sauce', 12.99, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 1, 'mild', 'non-veg'),
('Margherita Pizza', 'Fresh mozzarella, tomato sauce, and basil on wood-fired crust', 15.99, 'Pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg'),
('Caesar Salad', 'Crisp romaine lettuce with parmesan cheese and croutons', 10.99, 'Salads', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg'),
('Spicy Chicken Tacos', 'Three soft tortillas with grilled chicken and chipotle sauce', 13.50, 'Mexican', 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=800&q=80', 1, 'medium', 'non-veg'),
('Mushroom Risotto', 'Creamy arborio rice with fresh mushrooms and truffle oil', 14.99, 'Italian', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg'),
('French Fries', 'Crispy golden potato fries with sea salt', 4.99, 'Sides', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg'),
('Coca Cola', 'Refreshing cola drink', 2.99, 'Beverages', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg'),
('Chocolate Cake', 'Decadent chocolate cake with vanilla frosting', 6.99, 'Desserts', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 1, 'none', 'veg');

COMMIT;
