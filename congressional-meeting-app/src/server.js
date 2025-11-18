const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, saveMeetingRequest, getMeetingRequests, updateMeetingStatus } = require('./database');
const { sendEmails } = require('./email');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize database on startup
initializeDatabase();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// API Routes
app.post('/api/meeting-request', async (req, res) => {
    try {
        const requestId = 'REQ-' + Date.now();
        const meetingData = {
            ...req.body,
            requestId,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save to database
        await saveMeetingRequest(meetingData);

        // Send notification emails (if email is configured)
        if (process.env.ENABLE_EMAIL === 'true') {
            await sendEmails(meetingData);
        }

        res.json({
            success: true,
            requestId,
            message: 'Meeting request submitted successfully!'
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing your request. Please try again.'
        });
    }
});

app.get('/api/meetings', async (req, res) => {
    try {
        const meetings = await getMeetingRequests();
        res.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});

app.post('/api/meetings/:id/status', async (req, res) => {
    try {
        const { status, notes } = req.body;
        await updateMeetingStatus(req.params.id, status, notes);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Congressional Meeting App running on http://localhost:${PORT}`);
});
