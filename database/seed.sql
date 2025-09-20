-- Sample data for testing
-- Execute this after running schema.sql

-- Insert sample farmers
INSERT INTO users (email, password_hash, user_type, profile) VALUES
('farmer1@test.com', '$2a$12$placeholder_hash', 'farmer', '{
    "farmName": "Green Valley Farm",
    "farmSize": 150,
    "farmLocation": "Sacramento, CA",
    "primaryCrops": ["corn", "soybeans", "wheat"],
    "contactPhone": "+1-555-0101",
    "rating": 4.8,
    "totalJobs": 15
}'),
('farmer2@test.com', '$2a$12$placeholder_hash', 'farmer', '{
    "farmName": "Sunset Acres",
    "farmSize": 200,
    "farmLocation": "Fresno, CA",
    "primaryCrops": ["almonds", "grapes", "citrus"],
    "contactPhone": "+1-555-0102",
    "rating": 4.6,
    "totalJobs": 8
}');

-- Insert sample carriers
INSERT INTO users (email, password_hash, user_type, profile) VALUES
('carrier1@test.com', '$2a$12$placeholder_hash', 'carrier', '{
    "companyName": "Valley Transport Co",
    "vehicleType": "Semi-truck with trailer",
    "vehicleCapacity": 80000,
    "serviceAreas": ["Central Valley", "Bay Area", "Sacramento"],
    "contactPhone": "+1-555-0201",
    "rating": 4.9,
    "totalDeliveries": 142,
    "equipmentTypes": ["refrigerated", "bulk", "standard"]
}'),
('carrier2@test.com', '$2a$12$placeholder_hash', 'carrier', '{
    "companyName": "AgriLogistics LLC",
    "vehicleType": "Box truck",
    "vehicleCapacity": 26000,
    "serviceAreas": ["Northern California", "Oregon"],
    "contactPhone": "+1-555-0202",
    "rating": 4.7,
    "totalDeliveries": 89,
    "equipmentTypes": ["temperature-controlled", "standard"]
}');

-- Insert sample jobs (using the farmer IDs from above)
INSERT INTO jobs (
    farmer_id,
    title,
    description,
    crop_type,
    quantity,
    unit,
    pickup_location,
    delivery_location,
    pickup_date,
    delivery_date,
    budget,
    equipment_required,
    special_instructions,
    status
) VALUES
(
    (SELECT id FROM users WHERE email = 'farmer1@test.com'),
    'Corn Harvest Transport',
    'Need transport for fresh corn harvest from farm to processing facility',
    'corn',
    25000.00,
    'lbs',
    'Green Valley Farm, 123 Farm Rd, Sacramento, CA 95825',
    'Valley Processing Plant, 456 Industrial Ave, Stockton, CA 95202',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '3 days',
    1200.00,
    ARRAY['bulk', 'covered'],
    'Corn must be kept dry during transport. Early morning pickup preferred.',
    'open'
),
(
    (SELECT id FROM users WHERE email = 'farmer2@test.com'),
    'Almond Transport to Port',
    'Transport processed almonds to shipping port',
    'almonds',
    15000.00,
    'lbs',
    'Sunset Acres Processing, 789 Orchard Way, Fresno, CA 93720',
    'Port of Oakland, Oakland, CA 94607',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '6 days',
    1800.00,
    ARRAY['covered', 'secure'],
    'High-value cargo. Requires GPS tracking and security protocols.',
    'open'
);

-- Insert sample bids
INSERT INTO bids (
    job_id,
    carrier_id,
    bid_amount,
    estimated_duration,
    message,
    status
) VALUES
(
    (SELECT id FROM jobs WHERE title = 'Corn Harvest Transport'),
    (SELECT id FROM users WHERE email = 'carrier1@test.com'),
    1150.00,
    8,
    'We have experience with grain transport and can provide covered trailer. Available for pickup at 6 AM.',
    'pending'
),
(
    (SELECT id FROM jobs WHERE title = 'Almond Transport to Port'),
    (SELECT id FROM users WHERE email = 'carrier2@test.com'),
    1750.00,
    10,
    'Specialized in high-value agricultural products. GPS tracking included. Insured for full cargo value.',
    'pending'
);