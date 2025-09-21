-- AgriHaul Database Schema
-- Execute this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('farmer', 'carrier')),
    profile JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    crop_type VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    pickup_location TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    equipment_required TEXT[], -- Array of equipment types
    special_instructions TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'bidding', 'assigned', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    carrier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bid_amount DECIMAL(10,2) NOT NULL,
    estimated_duration INTEGER, -- in hours
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, carrier_id) -- One bid per carrier per job
);

-- Active Jobs table (tracks accepted bids as active jobs)
CREATE TABLE IF NOT EXISTS active_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    carrier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id) -- One active job per original job
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_jobs_farmer_id ON jobs(farmer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_pickup_date ON jobs(pickup_date);
CREATE INDEX IF NOT EXISTS idx_bids_job_id ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_carrier_id ON bids(carrier_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_active_jobs_farmer_id ON active_jobs(farmer_id);
CREATE INDEX IF NOT EXISTS idx_active_jobs_carrier_id ON active_jobs(carrier_id);
CREATE INDEX IF NOT EXISTS idx_active_jobs_status ON active_jobs(status);
CREATE INDEX IF NOT EXISTS idx_active_jobs_job_id ON active_jobs(job_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_active_jobs_updated_at BEFORE UPDATE ON active_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_jobs ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Anyone can view open jobs" ON jobs FOR SELECT USING (status = 'open' OR farmer_id = auth.uid());
CREATE POLICY "Farmers can create jobs" ON jobs FOR INSERT WITH CHECK (farmer_id = auth.uid());
CREATE POLICY "Farmers can update own jobs" ON jobs FOR UPDATE USING (farmer_id = auth.uid());
CREATE POLICY "Farmers can delete own jobs" ON jobs FOR DELETE USING (farmer_id = auth.uid());

-- Bids policies
CREATE POLICY "Job owners and bid creators can view bids" ON bids FOR SELECT USING (
    carrier_id = auth.uid() OR
    job_id IN (SELECT id FROM jobs WHERE farmer_id = auth.uid())
);
CREATE POLICY "Carriers can create bids" ON bids FOR INSERT WITH CHECK (carrier_id = auth.uid());
CREATE POLICY "Carriers can update own bids" ON bids FOR UPDATE USING (carrier_id = auth.uid());
CREATE POLICY "Carriers can delete own bids" ON bids FOR DELETE USING (carrier_id = auth.uid());

-- Active Jobs policies
CREATE POLICY "Farmers and carriers can view their active jobs" ON active_jobs FOR SELECT USING (
    farmer_id = auth.uid() OR carrier_id = auth.uid()
);
CREATE POLICY "Farmers can create active jobs" ON active_jobs FOR INSERT WITH CHECK (farmer_id = auth.uid());
CREATE POLICY "Farmers and carriers can update active jobs" ON active_jobs FOR UPDATE USING (
    farmer_id = auth.uid() OR carrier_id = auth.uid()
);