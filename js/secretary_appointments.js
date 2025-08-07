// Secretary appointment management logic for secretary_appointment.html

document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('appointmentsTableBody');
    let currentAppointmentId = null;
    let doctors = [];
    let currentPatientName = '';
    let currentDate = '';

    // Load appointments and doctors
    function loadAppointments() {
        axios.get('../api/appointment.php?action=list')
            .then(res => {
                const data = res.data;
                if (data.success) {
                    displayAppointments(data.requests);
                    doctors = data.doctors || [];
                } else {
                    console.error('Failed to load appointments:', data.message);
                }
            })
            .catch(err => {
                console.error('Error loading appointments:', err);
            });
    }

    // Display appointments in table
    function displayAppointments(appointments) {
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (!appointments || appointments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No appointment requests found.</td></tr>';
            return;
        }

        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.patient_name || 'Unknown Patient'}</td>
                <td>${formatDate(appointment.appointment_date)}</td>
                <td><span class="status-badge status-${getStatusClass(appointment.status_name)}">${appointment.status_name || 'Pending'}</span></td>
                <td>${appointment.doctor_name || 'Not assigned'}</td>
                <td>${appointment.limit_id || appointment.appointment_id || 'N/A'}</td>
                <td>
                    ${appointment.status_name === 'Pending' ? 
                        `<button class="btn btn-sm btn-primary" onclick="openConfirmModal(${appointment.appointment_id}, '${appointment.patient_name}', '${appointment.appointment_date}')">Confirm</button>` : 
                        '<span class="text-muted">Confirmed</span>'
                    }
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Get CSS class for status badge
    function getStatusClass(status) {
        switch(status?.toLowerCase()) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'danger';
            case 'completed': return 'info';
            default: return 'secondary';
        }
    }

    // Open confirm modal
    window.openConfirmModal = function(appointmentId, patientName, date) {
        currentAppointmentId = appointmentId;
        currentPatientName = patientName;
        currentDate = date;
        // Show queue number (appointmentId)
        document.getElementById('modalPatientName').textContent = patientName;
        document.getElementById('modalDate').textContent = formatDate(date);
        document.getElementById('modalQueue').textContent = appointmentId;
        // Populate doctor select
        const doctorSelect = document.getElementById('doctorSelect');
        doctorSelect.innerHTML = '<option value="">Choose a doctor...</option>';
        doctors.forEach(doctor => {
            doctorSelect.innerHTML += `<option value="${doctor.id}">${doctor.name}</option>`;
        });
        // Show modal
        document.getElementById('confirmModal').style.display = 'block';
    };

    // Close confirm modal
    window.closeConfirmModal = function() {
        document.getElementById('confirmModal').style.display = 'none';
        currentAppointmentId = null;
    };

    // Confirm appointment
    window.confirmAppointment = function() {
        const doctorId = document.getElementById('doctorSelect').value;
        if (!doctorId) {
            alert('Please select a doctor.');
            return;
        }
        axios.post('../api/appointment.php?action=confirm', {
            appointment_id: currentAppointmentId,
            doctor_id: doctorId
        })
        .then(res => {
            const data = res.data;
            if (data.success) {
                alert(`Appointment confirmed successfully!\nQueue Number: ${data.queue}`);
                closeConfirmModal();
                loadAppointments(); // Reload the table
            } else {
                alert(data.message || 'Failed to confirm appointment.');
            }
        })
        .catch(err => {
            console.error('Error confirming appointment:', err);
            alert('Error confirming appointment. Please try again.');
        });
    };

    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('confirmModal');
        if (event.target === modal) {
            closeConfirmModal();
        }
    };

    // Initial load
    loadAppointments();
});
