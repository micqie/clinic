// Secretary appointment management logic for secretary_appointment.html

document.addEventListener('DOMContentLoaded', function() {
    const requestsContainer = document.getElementById('requestsContainer');

    function loadRequests() {
        axios.get('api/appointment.php?action=list')
            .then(res => {
                const data = res.data;
                if (data.success && Array.isArray(data.requests)) {
                    requestsContainer.innerHTML = '';
                    data.requests.forEach(req => {
                        const div = document.createElement('div');
                        div.className = 'appointment-request';
                        div.innerHTML = `
                            <p><b>Patient:</b> ${req.patient_name || req.patient_id}<br>
                            <b>Date:</b> ${req.appointment_date}<br>
                            <b>Status:</b> ${req.status_name || req.status_id}</p>
                            <label>Assign Doctor:
                                <select class="doctor-select">
                                    <option value="">Select</option>
                                    ${(data.doctors || []).map(doc => `<option value="${doc.id}">${doc.name}</option>`).join('')}
                                </select>
                            </label>
                            <button class="confirm-btn">Confirm</button>
                            <div class="ref-number"></div>
                        `;
                        // Attach event
                        div.querySelector('.confirm-btn').onclick = function() {
                            const doctorId = div.querySelector('.doctor-select').value;
                            if (!doctorId) {
                                alert('Please select a doctor.');
                                return;
                            }
                            axios.post('api/appointment.php', {
                                action: 'confirm',
                                appointment_id: req.appointment_id,
                                doctor_id: doctorId
                            })
                            .then(resp => {
                                const respData = resp.data;
                                if (respData.success) {
                                    div.querySelector('.ref-number').innerHTML = `Reference #: <b>${respData.reference}</b>`;
                                    div.querySelector('.confirm-btn').disabled = true;
                                } else {
                                    alert(respData.message || 'Failed to confirm appointment.');
                                }
                            });
                        };
                        requestsContainer.appendChild(div);
                    });
                } else {
                    requestsContainer.textContent = 'No appointment requests.';
                }
            });
    }

    loadRequests();
});
