document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('meeting-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');
    const requestIdElement = document.getElementById('request-id');

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('preferredDate').setAttribute('min', today);

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Disable submit button and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span>Submitting...';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('/api/meeting-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                // Show success message
                requestIdElement.textContent = result.requestId;
                successMessage.style.display = 'block';
                form.style.display = 'none';

                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(result.message || 'Submission failed');
            }

        } catch (error) {
            console.error('Error:', error);
            alert('There was an error submitting your request. Please try again.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Meeting Request';
        }
    });

    // Form validation enhancements
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#10b981';
            }
        });

        input.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(239, 68, 68)') { // red
                this.style.borderColor = '#d1d5db';
            }
        });
    });
});
