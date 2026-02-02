-- Sample Data for GharBhada Database
-- This file contains seed data for development and testing

-- Insert Admin User
INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, is_active) VALUES
('admin@gharbhada.com', '$2b$10$rKZYvVxwXXnKZXJZqXqXqeXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'Admin User', '9841234567', 'admin', TRUE, TRUE);

-- Insert Sample Owners
INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, is_active) VALUES
('owner1@example.com', '$2b$10$rKZYvVxwXXnKZXJZqXqXqeXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'Ram Sharma', '9841111111', 'owner', TRUE, TRUE),
('owner2@example.com', '$2b$10$rKZYvVxwXXnKZXJZqXqXqeXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'Sita Thapa', '9842222222', 'owner', TRUE, TRUE),
('owner3@example.com', '$2b$10$rKZYvVxwXXnKZXJZqXqXqeXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'Hari Gurung', '9843333333', 'owner', TRUE, TRUE);

-- Insert Sample Tenants
INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, is_active) VALUES
('tenant1@example.com', '$2b$10$rKZYvVxwXXnKZXJZqXqXqeXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'Krishna Poudel', '9844444444', 'tenant', TRUE, TRUE),
('tenant2@example.com', '$2b$10$rKZYvVxwXXnKZXJZqXqXqeXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'Maya Rai', '9845555555', 'tenant', TRUE, TRUE),
('tenant3@example.com', '$2b$10$rKZYvVxwXXnKZXJZqXqXqeXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', 'Bikash Tamang', '9846666666', 'tenant', TRUE, TRUE);

-- Insert Sample Properties
INSERT INTO properties (owner_id, title, description, property_type, address, city, state, postal_code, latitude, longitude, bedrooms, bathrooms, area_sqft, price_per_month, security_deposit, is_available, is_verified, amenities, images) VALUES
(2, '2BHK Apartment in Thamel', 'Beautiful 2 bedroom apartment in the heart of Thamel with modern amenities', 'apartment', 'Thamel Marg, Ward 26', 'Kathmandu', 'Bagmati', '44600', 27.7172, 85.3240, 2, 2, 850, 25000.00, 50000.00, TRUE, TRUE, 
'["WiFi", "Parking", "Water Supply", "Elevator", "Security"]', 
'["property1_1.jpg", "property1_2.jpg", "property1_3.jpg"]'),

(3, 'Spacious 3BHK House in Lalitpur', 'Modern house with garden and parking space in peaceful neighborhood', 'house', 'Jawalakhel, Lalitpur', 'Lalitpur', 'Bagmati', '44700', 27.6710, 85.3199, 3, 3, 1500, 45000.00, 90000.00, TRUE, TRUE,
'["WiFi", "Parking", "Garden", "Water Supply", "Security", "Balcony"]',
'["property2_1.jpg", "property2_2.jpg", "property2_3.jpg"]'),

(2, 'Single Room near Tribhuvan University', 'Affordable single room perfect for students, close to TU', 'room', 'Kirtipur, Near TU Gate', 'Kathmandu', 'Bagmati', '44618', 27.6781, 85.2847, 1, 1, 200, 8000.00, 16000.00, TRUE, TRUE,
'["WiFi", "Water Supply", "Shared Kitchen"]',
'["property3_1.jpg", "property3_2.jpg"]'),

(4, 'Commercial Space in New Road', 'Prime commercial space suitable for retail or office', 'commercial', 'New Road, Kathmandu', 'Kathmandu', 'Bagmati', '44600', 27.7025, 85.3138, 0, 2, 1200, 80000.00, 160000.00, TRUE, TRUE,
'["WiFi", "Parking", "Water Supply", "Elevator", "Security", "AC"]',
'["property4_1.jpg", "property4_2.jpg", "property4_3.jpg"]'),

(3, '1BHK Apartment in Bhaktapur', 'Cozy apartment in historic Bhaktapur city', 'apartment', 'Durbar Square Area, Bhaktapur', 'Bhaktapur', 'Bagmati', '44800', 27.6710, 85.4298, 1, 1, 600, 18000.00, 36000.00, TRUE, TRUE,
'["WiFi", "Water Supply", "Balcony"]',
'["property5_1.jpg", "property5_2.jpg"]');

-- Insert Sample Bookings
INSERT INTO bookings (property_id, tenant_id, owner_id, start_date, end_date, monthly_rent, security_deposit, status, approved_date) VALUES
(1, 5, 2, '2026-02-01', NULL, 25000.00, 50000.00, 'active', '2026-01-15 10:30:00'),
(3, 6, 2, '2026-01-15', NULL, 8000.00, 16000.00, 'active', '2026-01-10 14:20:00'),
(2, 7, 3, '2026-03-01', NULL, 45000.00, 90000.00, 'approved', '2026-01-20 09:15:00'),
(5, 5, 3, '2025-12-01', '2026-01-31', 18000.00, 36000.00, 'completed', '2025-11-25 11:00:00');

-- Insert Sample Payments
INSERT INTO payments (booking_id, tenant_id, owner_id, amount, payment_type, payment_method, transaction_id, payment_status, payment_for_month, due_date) VALUES
(1, 5, 2, 50000.00, 'security_deposit', 'esewa', 'ESW123456789', 'completed', NULL, '2026-01-31'),
(1, 5, 2, 25000.00, 'rent', 'esewa', 'ESW123456790', 'completed', '2026-02-01', '2026-02-05'),
(2, 6, 2, 16000.00, 'security_deposit', 'khalti', 'KHL987654321', 'completed', NULL, '2026-01-14'),
(2, 6, 2, 8000.00, 'rent', 'khalti', 'KHL987654322', 'completed', '2026-01-01', '2026-01-05'),
(3, 7, 3, 90000.00, 'security_deposit', 'stripe', 'STR_abc123def456', 'completed', NULL, '2026-02-28');

-- Insert Sample Reviews
INSERT INTO reviews (property_id, tenant_id, booking_id, rating, comment, is_verified) VALUES
(1, 5, 1, 5, 'Excellent apartment! Great location and very well maintained. The owner is very responsive.', TRUE),
(3, 6, 2, 4, 'Good value for money. Perfect for students. Could use better furniture.', TRUE),
(5, 5, 4, 5, 'Loved staying here! Bhaktapur is beautiful and the apartment was cozy and clean.', TRUE);

-- Insert Sample Notifications
INSERT INTO notifications (user_id, title, message, type, related_id, is_read) VALUES
(5, 'Booking Confirmed', 'Your booking for 2BHK Apartment in Thamel has been confirmed!', 'booking', 1, TRUE),
(2, 'New Booking Request', 'You have a new booking request for your property in Thamel', 'booking', 1, TRUE),
(5, 'Payment Successful', 'Your rent payment of Rs. 25,000 has been processed successfully', 'payment', 2, TRUE),
(6, 'Booking Confirmed', 'Your booking for Single Room near Tribhuvan University has been confirmed!', 'booking', 2, FALSE),
(7, 'Booking Approved', 'Your booking request for Spacious 3BHK House in Lalitpur has been approved!', 'booking', 3, FALSE);

-- Insert Sample Maintenance Requests
INSERT INTO maintenance_requests (property_id, tenant_id, owner_id, title, description, priority, status) VALUES
(1, 5, 2, 'Leaking Faucet in Kitchen', 'The kitchen faucet has been leaking for the past two days. Needs immediate attention.', 'high', 'in_progress'),
(3, 6, 2, 'WiFi Not Working', 'Internet connection has been down since yesterday evening.', 'medium', 'pending');

-- Insert Sample Favorites
INSERT INTO favorites (user_id, property_id) VALUES
(5, 2),
(5, 4),
(6, 1),
(6, 5),
(7, 4);

-- Insert Sample Messages
INSERT INTO messages (sender_id, receiver_id, property_id, message, is_read) VALUES
(5, 2, 1, 'Hello, I am interested in viewing the apartment. When would be a good time?', TRUE),
(2, 5, 1, 'Hi! You can visit tomorrow at 2 PM. Does that work for you?', TRUE),
(5, 2, 1, 'Yes, that works perfectly. Thank you!', TRUE),
(6, 2, 3, 'Is the room still available?', FALSE);

-- Note: Password hash shown is a placeholder. In production, use bcrypt to hash passwords.
-- Example: For password "password123", use bcrypt.hash('password123', 10)
