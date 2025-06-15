
-- Ensure all required columns exist in the employees table (they should already exist based on the schema)
-- Add any missing columns if needed
DO $$
BEGIN
    -- Check and add address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'address') THEN
        ALTER TABLE employees ADD COLUMN address text;
    END IF;
    
    -- Check and add emergency_contact_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE employees ADD COLUMN emergency_contact_name text;
    END IF;
    
    -- Check and add emergency_contact_phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE employees ADD COLUMN emergency_contact_phone text;
    END IF;
    
    -- Check and add bank_account_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'bank_account_number') THEN
        ALTER TABLE employees ADD COLUMN bank_account_number text;
    END IF;
    
    -- Check and add bank_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'bank_name') THEN
        ALTER TABLE employees ADD COLUMN bank_name text;
    END IF;
END $$;

-- Update employees with null values by adding dummy data
UPDATE employees 
SET 
    address = CASE 
        WHEN address IS NULL THEN 
            (ARRAY[
                '123 Brigade Road, Bangalore, Karnataka 560001',
                '456 MG Road, Bangalore, Karnataka 560002',
                '789 Commercial Street, Bangalore, Karnataka 560003',
                '321 Koramangala, Bangalore, Karnataka 560034',
                '654 Indiranagar, Bangalore, Karnataka 560038',
                '987 Whitefield, Bangalore, Karnataka 560066',
                '147 Electronic City, Bangalore, Karnataka 560100',
                '258 JP Nagar, Bangalore, Karnataka 560078',
                '369 Jayanagar, Bangalore, Karnataka 560011',
                '741 HSR Layout, Bangalore, Karnataka 560102'
            ])[1 + (ABS(HASHTEXT(id::text)) % 10)]
        ELSE address 
    END,
    emergency_contact_name = CASE 
        WHEN emergency_contact_name IS NULL THEN 
            (ARRAY[
                'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sneha Patel', 'Vikram Reddy',
                'Anita Gupta', 'Ravi Nair', 'Kavya Iyer', 'Suresh Rao', 'Meera Joshi'
            ])[1 + (ABS(HASHTEXT(id::text)) % 10)]
        ELSE emergency_contact_name 
    END,
    emergency_contact_phone = CASE 
        WHEN emergency_contact_phone IS NULL THEN 
            '+91' || (9000000000 + (ABS(HASHTEXT(id::text)) % 900000000))::text
        ELSE emergency_contact_phone 
    END,
    bank_account_number = CASE 
        WHEN bank_account_number IS NULL THEN 
            (100000000000 + (ABS(HASHTEXT(id::text)) % 900000000000))::text
        ELSE bank_account_number 
    END,
    bank_name = CASE 
        WHEN bank_name IS NULL THEN 
            (ARRAY[
                'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank',
                'Canara Bank', 'Bank of Baroda', 'Union Bank of India', 'Indian Bank', 'Central Bank of India'
            ])[1 + (ABS(HASHTEXT(id::text)) % 10)]
        ELSE bank_name 
    END
WHERE 
    address IS NULL OR 
    emergency_contact_name IS NULL OR 
    emergency_contact_phone IS NULL OR 
    bank_account_number IS NULL OR 
    bank_name IS NULL;
