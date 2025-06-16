-- Insert sample raffles
INSERT INTO raffles (
    title,
    description,
    prize_description,
    ticket_price,
    total_tickets,
    available_tickets,
    start_date,
    end_date,
    status
) VALUES 
(
    'iPhone 15 Pro Max Giveaway',
    'Win the latest iPhone 15 Pro Max! This premium smartphone features a titanium design, A17 Pro chip, and an advanced camera system.',
    'Brand new iPhone 15 Pro Max (256GB) in Natural Titanium',
    10.00,
    1000,
    1000,
    NOW(),
    NOW() + INTERVAL '30 days',
    'active'
),
(
    'PlayStation 5 Bundle',
    'Enter for a chance to win a PlayStation 5 console with two controllers and three popular games!',
    'PlayStation 5 Digital Edition, 2 DualSense controllers, and games: God of War Ragnarök, Spider-Man 2, and Final Fantasy XVI',
    5.00,
    2000,
    2000,
    NOW(),
    NOW() + INTERVAL '14 days',
    'active'
),
(
    'MacBook Pro M3',
    'Win a powerful MacBook Pro with the revolutionary M3 chip! Perfect for professionals and creatives.',
    'MacBook Pro 14" with M3 Pro chip, 18GB RAM, and 512GB SSD',
    25.00,
    500,
    500,
    NOW(),
    NOW() + INTERVAL '60 days',
    'active'
); 