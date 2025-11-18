const Database = require('better-sqlite3');
const path = require('path');

let db;

function initializeDatabase() {
    try {
        // Use in-memory database for serverless deployments, file-based for local
        const dbPath = process.env.NODE_ENV === 'production'
            ? ':memory:'
            : path.join(__dirname, '..', 'meetings.db');

        db = new Database(dbPath);

        // Create meetings table
        db.exec(`
      CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        organization TEXT NOT NULL,
        title TEXT,
        purpose TEXT NOT NULL,
        preferred_date TEXT NOT NULL,
        preferred_time TEXT NOT NULL,
        duration INTEGER NOT NULL,
        meeting_type TEXT NOT NULL,
        attendees INTEGER NOT NULL,
        accommodations TEXT,
        additional_info TEXT,
        status TEXT DEFAULT 'pending',
        admin_notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('📊 Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

function saveMeetingRequest(data) {
    try {
        const stmt = db.prepare(`
      INSERT INTO meetings (
        request_id, first_name, last_name, email, phone, organization, title,
        purpose, preferred_date, preferred_time, duration, meeting_type, 
        attendees, accommodations, additional_info, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            data.requestId,
            data.firstName,
            data.lastName,
            data.email,
            data.phone,
            data.organization,
            data.title || '',
            data.purpose,
            data.preferredDate,
            data.preferredTime,
            data.duration,
            data.meetingType,
            data.attendees,
            data.accommodations || '',
            data.additionalInfo || '',
            data.status,
            data.createdAt
        );

        console.log(`✅ Meeting request saved: ${data.requestId}`);
        return result;
    } catch (error) {
        console.error('Error saving meeting request:', error);
        throw error;
    }
}

function getMeetingRequests() {
    try {
        const stmt = db.prepare('SELECT * FROM meetings ORDER BY created_at DESC');
        return stmt.all();
    } catch (error) {
        console.error('Error fetching meetings:', error);
        throw error;
    }
}

function updateMeetingStatus(requestId, status, notes = '') {
    try {
        const stmt = db.prepare(`
      UPDATE meetings 
      SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE request_id = ?
    `);

        const result = stmt.run(status, notes, requestId);
        console.log(`📝 Meeting ${requestId} status updated to: ${status}`);
        return result;
    } catch (error) {
        console.error('Error updating meeting status:', error);
        throw error;
    }
}

module.exports = {
    initializeDatabase,
    saveMeetingRequest,
    getMeetingRequests,
    updateMeetingStatus
};
