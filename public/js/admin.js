document.addEventListener('DOMContentLoaded', function() {
    loadMeetings();
});

async function loadMeetings() {
    try {
        const response = await fetch('/api/meetings');
        const meetings = await response.json();

        const container = document.getElementById('meetings-container');

        if (meetings.length === 0) {
            container.innerHTML = '<p>No meeting requests found.</p>';
            return;
        }

        container.innerHTML = meetings.map(meeting => `
            <div class="meeting-card ${meeting.status}">
                <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <h3>${meeting.first_name} ${meeting.last_name}</h3>
                        <p style="color: #666; margin: 5px 0;">${meeting.organization}</p>
                        <span class="status-badge ${meeting.status}">${meeting.status}</span>
                    </div>
                    <div style="text-align: right; font-size: 0.9em; color: #666;">
                        <p>ID: ${meeting.request_id}</p>
                        <p>${new Date(meeting.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <p><strong>📧 Email:</strong> ${meeting.email}</p>
                    <p><strong>📞 Phone:</strong> ${meeting.phone}</p>
                    <p><strong>📅 Requested:</strong> ${meeting.preferred_date} at ${meeting.preferred_time}</p>
                    <p><strong>⏱️ Duration:</strong> ${meeting.duration} minutes</p>
                    <p><strong>👥 Attendees:</strong> ${meeting.attendees}</p>
                    <p><strong>📍 Type:</strong> ${meeting.meeting_type}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <p><strong>Purpose:</strong></p>
                    <p style="background: #f9fafb; padding: 10px; border-radius: 5px; margin-top: 5px;">${meeting.purpose}</p>
                </div>
                
                ${meeting.accommodations ? `
                <div style="margin-bottom: 15px;">
                    <p><strong>Accommodations:</strong></p>
                    <p style="background: #fef3c7; padding: 10px; border-radius: 5px; margin-top: 5px;">${meeting.accommodations}</p>
                </div>
                ` : ''}
                
                ${meeting.additional_info ? `
                <div style="margin-bottom: 15px;">
                    <p><strong>Additional Info:</strong></p>
                    <p style="background: #f0f9ff; padding: 10px; border-radius: 5px; margin-top: 5px;">${meeting.additional_info}</p>
                </div>
                ` : ''}
                
                ${meeting.admin_notes ? `
                <div style="margin-bottom: 15px;">
                    <p><strong>Admin Notes:</strong></p>
                    <p style="background: #f3e8ff; padding: 10px; border-radius: 5px; margin-top: 5px;">${meeting.admin_notes}</p>
                </div>
                ` : ''}
                
                ${meeting.status === 'pending' ? `
                <div class="action-buttons">
                    <button class="btn btn-confirm" onclick="updateStatus('${meeting.request_id}', 'confirmed')">
                        ✅ Confirm
                    </button>
                    <button class="btn btn-cancel" onclick="updateStatus('${meeting.request_id}', 'cancelled')">
                        ❌ Cancel
                    </button>
                </div>
                ` : ''}
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading meetings:', error);
        document.getElementById('meetings-container').innerHTML =
            '<p style="color: red;">Error loading meetings. Please refresh the page.</p>';
    }
}

async function updateStatus(requestId, status) {
    const notes = prompt(`Add notes for this ${status} meeting (optional):`);

    try {
        const response = await fetch(`/api/meetings/${requestId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, notes: notes || '' })
        });

        const result = await response.json();

        if (result.success) {
            loadMeetings(); // Refresh the list
        } else {
            alert('Error updating status. Please try again.');
        }

    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again.');
    }
}
