-- Running Page 2.0 Database Schema
-- Modern, extensible database design for fitness activity tracking

-- Users table for multi-user support (future)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSON, -- User preferences as JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activities table (enhanced from original)
CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id VARCHAR(255), -- ID from source platform (Strava, Garmin, etc.)
    user_id INTEGER DEFAULT 1, -- Foreign key to users table
    source VARCHAR(50) NOT NULL, -- 'strava', 'garmin', 'nike', 'manual', etc.
    
    -- Basic activity info
    name VARCHAR(255),
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'Run', 'Walk', 'Ride', 'Swim', etc.
    sport_type VARCHAR(50), -- More specific: 'TrailRun', 'RoadRun', etc.
    
    -- Time and date
    start_date DATETIME NOT NULL,
    start_date_local DATETIME NOT NULL,
    timezone VARCHAR(50),
    
    -- Distance and duration
    distance REAL, -- meters
    moving_time INTEGER, -- seconds
    elapsed_time INTEGER, -- seconds
    total_elevation_gain REAL, -- meters
    
    -- Performance metrics
    average_speed REAL, -- m/s
    max_speed REAL, -- m/s
    average_pace REAL, -- seconds per km (calculated)
    best_pace REAL, -- seconds per km
    
    -- Heart rate data
    average_heartrate REAL, -- bpm
    max_heartrate REAL, -- bpm
    heartrate_zones JSON, -- Time in each HR zone
    
    -- Location data
    start_latitude REAL,
    start_longitude REAL,
    end_latitude REAL,
    end_longitude REAL,
    location_city VARCHAR(255),
    location_state VARCHAR(255),
    location_country VARCHAR(255),
    
    -- Route data
    summary_polyline TEXT, -- Encoded polyline
    detailed_polyline TEXT, -- Higher resolution polyline
    map_id VARCHAR(255), -- Strava map ID or similar
    
    -- Additional metrics
    calories REAL,
    average_cadence REAL, -- steps/min for running
    average_power REAL, -- watts for cycling
    weighted_average_power REAL,
    training_stress_score REAL,
    
    -- Weather data (if available)
    weather JSON, -- Temperature, humidity, wind, etc.
    
    -- Privacy and sharing
    visibility VARCHAR(20) DEFAULT 'private', -- 'public', 'private', 'followers'
    privacy_zones JSON, -- Areas to blur/hide
    
    -- Metadata
    gear_id VARCHAR(255), -- Equipment used
    device_name VARCHAR(255), -- Recording device
    raw_data JSON, -- Store original API response
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(external_id, source) -- Prevent duplicates from same source
);

-- Activity segments (for detailed analysis)
CREATE TABLE activity_segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    segment_type VARCHAR(50), -- 'lap', 'split', 'climb', 'interval'
    sequence_number INTEGER,
    
    -- Segment metrics
    distance REAL,
    moving_time INTEGER,
    elapsed_time INTEGER,
    average_speed REAL,
    max_speed REAL,
    average_heartrate REAL,
    max_heartrate REAL,
    total_elevation_gain REAL,
    
    -- Segment boundaries
    start_index INTEGER, -- Index in activity's data points
    end_index INTEGER,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- Data points for detailed activity analysis
CREATE TABLE activity_data_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    
    -- Time and position
    timestamp DATETIME,
    elapsed_time INTEGER, -- seconds from start
    latitude REAL,
    longitude REAL,
    altitude REAL, -- meters
    
    -- Performance data
    distance REAL, -- cumulative meters
    speed REAL, -- m/s
    heartrate INTEGER, -- bpm
    cadence INTEGER, -- steps/min or rpm
    power REAL, -- watts
    temperature REAL, -- celsius
    
    -- Movement data
    grade REAL, -- percentage
    bearing REAL, -- degrees
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- Sync logs for tracking data synchronization
CREATE TABLE sync_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    source VARCHAR(50) NOT NULL,
    sync_type VARCHAR(50), -- 'full', 'incremental', 'manual'
    
    -- Sync results
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'partial'
    activities_processed INTEGER DEFAULT 0,
    activities_created INTEGER DEFAULT 0,
    activities_updated INTEGER DEFAULT 0,
    activities_skipped INTEGER DEFAULT 0,
    
    -- Error handling
    error_message TEXT,
    error_details JSON,
    
    -- Timing
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    duration_seconds INTEGER,
    
    -- Metadata
    sync_params JSON, -- Parameters used for sync
    api_calls_made INTEGER DEFAULT 0,
    rate_limit_remaining INTEGER,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User settings for data sources
CREATE TABLE data_source_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    source VARCHAR(50) NOT NULL,
    
    -- Authentication
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at DATETIME,
    
    -- Sync preferences
    auto_sync BOOLEAN DEFAULT true,
    sync_frequency VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
    last_sync_at DATETIME,
    
    -- Data preferences
    activity_types JSON, -- Which types to sync
    privacy_settings JSON,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    connection_status VARCHAR(20) DEFAULT 'connected',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, source)
);

-- Achievements and milestones
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    
    -- Achievement details
    type VARCHAR(50) NOT NULL, -- 'distance', 'time', 'streak', 'pace', 'custom'
    category VARCHAR(50), -- 'monthly', 'yearly', 'lifetime', 'personal'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Achievement criteria
    target_value REAL,
    current_value REAL,
    unit VARCHAR(20), -- 'km', 'minutes', 'days', 'activities'
    
    -- Status
    is_completed BOOLEAN DEFAULT false,
    completed_at DATETIME,
    progress_percentage REAL DEFAULT 0,
    
    -- Related activity
    activity_id INTEGER, -- Activity that triggered achievement
    
    -- Metadata
    icon VARCHAR(50), -- Emoji or icon identifier
    color VARCHAR(20),
    badge_data JSON,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id)
);

-- Indexes for performance
CREATE INDEX idx_activities_user_date ON activities(user_id, start_date DESC);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_source ON activities(source);
CREATE INDEX idx_activities_external_id ON activities(external_id, source);
CREATE INDEX idx_activity_segments_activity ON activity_segments(activity_id);
CREATE INDEX idx_activity_data_points_activity ON activity_data_points(activity_id);
CREATE INDEX idx_sync_logs_user_source ON sync_logs(user_id, source);
CREATE INDEX idx_sync_logs_date ON sync_logs(started_at DESC);

-- Insert default user for single-user setup
INSERT INTO users (id, email, name, timezone) 
VALUES (1, 'user@example.com', 'Runner', 'UTC');
