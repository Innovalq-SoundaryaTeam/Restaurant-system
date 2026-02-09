# Restaurant QR Ordering System - Database Setup

This document explains the database structure and setup for the Restaurant QR Ordering System.

## 📁 Files Included

1. **`database_setup.sql`** - Complete database schema and initial setup
2. **`sample_data.sql`** - Sample data for testing and demonstration
3. **`queries.sql`** - Common SQL queries for operations
4. **`README_DATABASE.md`** - This documentation file

## 🚀 Quick Setup

### 1. Create Database
```sql
-- Run this in MySQL command line or your favorite MySQL client
mysql -u root -p < database_setup.sql
```

### 2. Add Sample Data (Optional)
```sql
-- Add sample data for testing
mysql -u root -p restaurant_db < sample_data.sql
```

## 📊 Database Schema

### Core Tables

#### 🏪 `restaurants`
Stores restaurant information
- `restaurant_id` (UNIQUE) - Restaurant identifier
- `name`, `description`, `cuisine_type`
- `address`, `phone`, `email`
- Timestamps for tracking

#### 🪑 `tables`
Restaurant table management
- Links to `restaurants`
- `table_number`, `capacity`, `status`
- `qr_code_data` for QR scanning
- Status: available/occupied/reserved

#### 👥 `customers`
Customer information
- `name`, `phone_number` (UNIQUE), `email` (UNIQUE)
- `otp`, `is_verified`
- Login and verification tracking

#### 🍽 `menu_items`
Menu items management
- Links to `restaurants`
- `name`, `description`, `price`
- `category`, `image_url`, `is_available`
- `spicy_level`, `dietary_info`, `preparation_time`

#### 📋 `orders`
Order management
- Links to `restaurants`, `customers`
- `order_number` (AUTO), `table_number`
- `status`, `total_price`, `payment_method`
- Order tracking with timestamps

#### 🛒 `order_items`
Order line items (Junction table)
- Links `orders` ↔ `menu_items`
- `quantity`, `price`, `subtotal`
- Special instructions per item

#### 🧾 `bills`
Billing and invoicing
- Links to `orders`
- `bill_number` (AUTO), payment tracking
- Email sent status, PDF generation flags
- Tax and discount calculations

### Supporting Tables

#### 👨‍🍳 `kitchen_order_status`
Real-time kitchen tracking
- Order preparation stages
- Time estimates vs actual times
- Staff assignment tracking

#### 👤 `admin_users`
Staff and admin management
- Role-based access (super_admin/admin/manager/staff)
- Login tracking, active status
- Password hashing for security

#### 📈 `order_status_history`
Order change tracking
- Complete audit trail
- Status transition history
- Staff responsibility tracking

## 🔗 Relationships

```
restaurants (1) → (N) tables
restaurants (1) → (N) menu_items
restaurants (1) → (N) orders

customers (1) → (N) orders
orders (1) → (N) order_items
orders (1) → (1) bills

menu_items (1) → (N) order_items
orders (1) → (N) kitchen_order_status
orders (1) → (N) order_status_history
```

## 🎯 Key Features

### QR Code Integration
- Tables store QR code data in JSON format
- Format: `{"restaurantId": "REST001", "tableNumber": "T1"}`
- Automatic table assignment on scan

### Order Status Flow
```
pending → confirmed → preparing → ready → served → paid
    ↓
cancelled (any stage)
```

### Payment Methods
- `cash`, `card`, `upi`, `wallet`
- Payment status tracking separate from order status
- Support for partial payments and refunds

### Dietary Information
- `veg`, `non-veg`, `vegan`, `gluten-free`
- Spicy levels: `none`, `mild`, `medium`, `hot`
- Preparation time estimates

## 📊 Views & Stored Procedures

### Views
- **`kitchen_dashboard`** - Active orders for kitchen staff
- **`daily_sales_report`** - Automated daily sales analytics

### Stored Procedures
- **`generate_order_number()`** - Automatic order numbering
- **`update_order_status()`** - Status updates with history tracking

## 🔍 Common Queries

### Get Active Orders
```sql
SELECT * FROM kitchen_dashboard 
WHERE restaurant_id = 'REST001' 
ORDER BY created_at ASC;
```

### Daily Sales Report
```sql
SELECT * FROM daily_sales_report 
WHERE sale_date >= CURDATE() - INTERVAL 7 DAY;
```

### Popular Menu Items
```sql
SELECT 
    mi.name,
    COUNT(oi.id) as times_ordered,
    SUM(oi.quantity) as total_quantity_sold
FROM menu_items mi
JOIN order_items oi ON mi.id = oi.menu_item_id
WHERE mi.restaurant_id = 'REST001'
GROUP BY mi.id
ORDER BY total_quantity_sold DESC;
```

## 🔧 Maintenance

### Regular Cleanup
```sql
-- Clean old history (keep 90 days)
DELETE FROM order_status_history 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Clean old kitchen status (keep 7 days)
DELETE FROM kitchen_order_status 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### Performance Optimization
- Indexes on all foreign keys
- Composite indexes for common queries
- Partitioning options for large datasets

## 🔐 Security

### Password Hashing
- Uses bcrypt for admin passwords
- Default admin: `admin@restaurant.com` / `admin123`
- Change immediately in production

### Data Validation
- Foreign key constraints enforced
- Check constraints for enums
- Unique constraints for business rules

## 📱 Integration Points

### Frontend Integration
- API endpoints match table structure
- Real-time updates via status tables
- PDF generation from bill data

### Email Integration
- Bill email status tracking
- Customer communication history
- Automated notifications

## 🚀 Production Setup

### 1. Security
```sql
-- Create dedicated database user
CREATE USER 'restaurant_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON restaurant_db.* TO 'restaurant_app'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Performance
```sql
-- Enable query cache (MySQL specific)
SET GLOBAL query_cache_size = 268435456;
SET GLOBAL query_cache_type = ON;
```

### 3. Backup Strategy
```bash
# Daily backup
mysqldump -u root -p restaurant_db > backup_$(date +%Y%m%d).sql

# Compress old backups
gzip backup_*.sql
```

## 🐛 Troubleshooting

### Common Issues

#### Foreign Key Errors
- Ensure parent records exist before child records
- Check data types match exactly

#### Character Encoding
- Use `utf8mb4` for full Unicode support
- Set collation to `utf8mb4_unicode_ci`

#### Performance Issues
- Check query execution plans
- Monitor slow query log
- Consider table partitioning for large datasets

### Debug Queries
```sql
-- Check table structure
DESCRIBE orders;

-- Check indexes
SHOW INDEX FROM orders;

-- Check query execution
EXPLAIN SELECT * FROM orders WHERE restaurant_id = 'REST001';
```

## 📞 Support

For database-related issues:
1. Check error logs in MySQL
2. Verify connection strings in backend
3. Test with sample data first
4. Monitor query performance

## 🔄 Updates

### Version Control
- Use migration scripts for schema changes
- Backup before major updates
- Test changes in development first

### Schema Changes
```sql
-- Example: Add new column
ALTER TABLE menu_items ADD COLUMN allergen_info TEXT;

-- Example: Add new index
CREATE INDEX idx_menu_category_price ON menu_items(category, price);
```

---

**Database Version**: 1.0  
**Last Updated**: 2026-02-06  
**Compatible MySQL Versions**: 5.7+ / 8.0+
