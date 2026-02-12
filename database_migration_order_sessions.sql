-- Restaurant QR Ordering System - Order Sessions Migration
-- Version: 2.1 (Add Order Sessions Support)
-- Description: Add order sessions for multiple orders per table

USE restaurant_db;

-- Create OrderSession table
CREATE TABLE IF NOT EXISTS order_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    status ENUM('ACTIVE', 'CLOSED') DEFAULT 'ACTIVE',
    customer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_table_number (table_number),
    INDEX idx_status (status)
);

-- Add session_id column to orders table if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(50) NULL AFTER order_number,
ADD INDEX IF NOT EXISTS idx_session_id (session_id),
ADD FOREIGN KEY IF NOT EXISTS (session_id) REFERENCES order_sessions(session_id) ON DELETE SET NULL;

-- Create trigger for session ID generation
DELIMITER //
CREATE TRIGGER IF NOT EXISTS before_order_session_insert 
BEFORE INSERT ON order_sessions
FOR EACH ROW
BEGIN
    IF NEW.session_id IS NULL THEN
        SET NEW.session_id = CONCAT('SES', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(CONNECTION_ID(), 6, '0'));
    END IF;
END//
DELIMITER ;

-- Create view for active sessions
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    os.id,
    os.session_id,
    os.table_number,
    os.status,
    c.name as customer_name,
    c.phone_number,
    os.created_at,
    COUNT(o.id) as order_count,
    COALESCE(SUM(o.total_price), 0) as session_total,
    GROUP_CONCAT(DISTINCT o.status ORDER BY o.created_at DESC) as order_statuses
FROM order_sessions os
LEFT JOIN customers c ON os.customer_id = c.id
LEFT JOIN orders o ON os.session_id = o.session_id
WHERE os.status = 'ACTIVE'
GROUP BY os.id, os.session_id, os.table_number, os.status, c.name, c.phone_number, os.created_at
ORDER BY os.created_at DESC;

-- Create stored procedure for creating new session
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS create_order_session(
    IN p_table_number VARCHAR(20),
    IN p_customer_id INT
)
BEGIN
    DECLARE v_session_id VARCHAR(50);
    
    -- Check if there's already an active session for this table
    SELECT session_id INTO v_session_id 
    FROM order_sessions 
    WHERE table_number = p_table_number AND status = 'ACTIVE' 
    LIMIT 1;
    
    -- If no active session exists, create one
    IF v_session_id IS NULL THEN
        INSERT INTO order_sessions (table_number, customer_id)
        VALUES (p_table_number, p_customer_id);
        
        SELECT LAST_INSERT_ID() as session_id, session_id, table_number, status
        FROM order_sessions WHERE id = LAST_INSERT_ID();
    ELSE
        -- Return existing session
        SELECT id as session_id, session_id, table_number, status
        FROM order_sessions WHERE session_id = v_session_id;
    END IF;
END//
DELIMITER ;

-- Create stored procedure for finishing meal
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS finish_meal_session(
    IN p_session_id VARCHAR(50)
)
BEGIN
    DECLARE v_subtotal DECIMAL(10,2);
    DECLARE v_tax_rate DECIMAL(5,2) DEFAULT 18.0;
    DECLARE v_tax_amount DECIMAL(10,2);
    DECLARE v_grand_total DECIMAL(10,2);
    
    -- Calculate totals
    SELECT COALESCE(SUM(subtotal), 0) INTO v_subtotal
    FROM orders 
    WHERE session_id = p_session_id;
    
    SET v_tax_amount = v_subtotal * (v_tax_rate / 100);
    SET v_grand_total = v_subtotal + v_tax_amount;
    
    -- Update session status
    UPDATE order_sessions 
    SET status = 'CLOSED', 
        closed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id;
    
    -- Update all orders in session to COMPLETED
    UPDATE orders 
    SET status = 'COMPLETED',
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id;
    
    -- Return session summary
    SELECT 
        p_session_id as session_id,
        table_number,
        v_subtotal as subtotal,
        v_tax_amount as tax_amount,
        v_grand_total as grand_total,
        COUNT(*) as total_orders,
        status
    FROM order_sessions 
    WHERE session_id = p_session_id;
END//
DELIMITER ;

COMMIT;

-- Migration complete
SELECT 'Order Sessions migration completed successfully!' as message;
