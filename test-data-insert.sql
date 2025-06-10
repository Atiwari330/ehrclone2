-- Test Data Script for Safety Check Pipeline Testing
-- Run this to create the required foreign key records

-- Test User (Provider)
INSERT INTO "User" (id, email) 
VALUES ('550e8400-e29b-41d4-a716-446655440003', 'test-provider@example.com') 
ON CONFLICT (id) DO NOTHING;

-- Test Patient  
INSERT INTO patient (id, first_name, last_name, date_of_birth, "createdAt") 
VALUES ('550e8400-e29b-41d4-a716-446655440002', 'Test', 'Patient', '1990-01-01', NOW()) 
ON CONFLICT (id) DO NOTHING;

-- Test Provider (links to User)
INSERT INTO provider (id, title, specialty) 
VALUES ('550e8400-e29b-41d4-a716-446655440003', 'Dr.', 'Psychiatry') 
ON CONFLICT (id) DO NOTHING;

-- Test Session
INSERT INTO session (id, patient_id, provider_id, session_type, session_status, scheduled_at, "createdAt") 
VALUES (
  '550e8400-e29b-41d4-a716-446655440001', 
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003', 
  'therapy', 
  'completed', 
  NOW(), 
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the records were created
SELECT 'Users' as table_name, count(*) as count FROM "User" WHERE id = '550e8400-e29b-41d4-a716-446655440003'
UNION ALL
SELECT 'Patients', count(*) FROM patient WHERE id = '550e8400-e29b-41d4-a716-446655440002'
UNION ALL  
SELECT 'Providers', count(*) FROM provider WHERE id = '550e8400-e29b-41d4-a716-446655440003'
UNION ALL
SELECT 'Sessions', count(*) FROM session WHERE id = '550e8400-e29b-41d4-a716-446655440001';
