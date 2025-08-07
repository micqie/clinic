const baseApiUrl = "http://localhost/clinic/api";
 let selectedId = null;

    function fetchPatients() {
      axios.get(`${baseApiUrl}/patients.php?operation=list`)
        .then(res => {
          const patients = res.data;
          const tbody = document.getElementById('patientsTableBody');
          if (!tbody) return; // Only run on patient management pages
          tbody.innerHTML = '';

          patients.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${p.full_name}</td>
              <td>${p.email}</td>
              <td>${p.birthdate || '-'}</td>
              <td>${p.sex === 1 ? 'Male' : 'Female'}</td>
              <td>${p.contact_number || '-'}</td>
              <td>
                <button class="btn btn-sm btn-info" onclick="viewPatient(${p.id})">View</button>
                <button class="btn btn-sm btn-warning" onclick="editPatient(${p.id})">Edit</button>
              </td>
            `;
            tbody.appendChild(tr);
          });
        });
    }

function viewPatient(id) {
  axios.get(`${baseApiUrl}/patients.php?operation=view&id=${id}`).then(res => {
    const p = res.data;

    document.getElementById('viewName').textContent = p.full_name || '-';
    document.getElementById('viewEmail').textContent = p.email || '-';
    document.getElementById('viewBirthdate').textContent = p.birthdate || '-';
    document.getElementById('viewSex').textContent = p.sex == 1 ? 'Male' : 'Female';
    document.getElementById('viewContact').textContent = p.contact_number || '-';
    document.getElementById('viewAddress').textContent = p.address || '-';

    document.getElementById('viewModal').style.display = 'block';
  });
}

function closeViewModal() {
  document.getElementById('viewModal').style.display = 'none';
}

    function editPatient(id) {
      selectedId = id;
      axios.get(`${baseApiUrl}/patients.php?operation=view&id=${id}`).then(res => {
        const p = res.data;
        document.getElementById('editName').value = p.full_name;
        document.getElementById('editEmail').value = p.email;
        document.getElementById('editBirthdate').value = p.birthdate;
        document.getElementById('editSex').value = p.sex;
        document.getElementById('editContact').value = p.contact_number;
        document.getElementById('editAddress').value = p.address;
        document.getElementById('updateModal').style.display = 'block';
        document.getElementById('modalBackdrop').style.display = 'block';
      });
    }

    function saveUpdate() {
      const name = document.getElementById('editName').value.trim();
      const email = document.getElementById('editEmail').value.trim();
      const birthdate = document.getElementById('editBirthdate').value.trim();
      const sex = parseInt(document.getElementById('editSex').value);
      const contact = document.getElementById('editContact').value.trim();
      const address = document.getElementById('editAddress').value.trim();

      if (!name || !email) {
        alert("Name and email are required.");
        return;
      }

      const updatedData = {
        full_name: name,
        email: email,
        birthdate: birthdate,
        sex: sex,
        contact_number: contact,
        address: address
      };

      axios.post(`${baseApiUrl}/patients.php?operation=update&id=${selectedId}`, updatedData)
        .then(res => {
          alert(res.data.message || "Patient updated.");
          closeModal();
          fetchPatients();
        });
    }

    function closeModal() {
      document.getElementById('updateModal').style.display = 'none';
      document.getElementById('modalBackdrop').style.display = 'none';
    }

    // Appointment request logic for patient_appointment.html

    // Fetch and display patient's appointments (all statuses)
function loadPatientAppointments() {
    const storedId = localStorage.getItem('id') || window.firstAvailablePatientId;
    if (!storedId) return;
    axios.get(`../api/appointment.php?action=list`)
        .then(res => {
            const data = res.data;
            if (data.success && Array.isArray(data.requests)) {
                // Only show confirmed appointments
                const myAppointments = data.requests.filter(app =>
                    app.patient_id == storedId && app.status_name?.toLowerCase() === 'confirmed'
                );
                displayPatientAppointments(myAppointments);
            }
        });
}




    function fetchPatients() {
      axios.get(`${baseApiUrl}/patients.php?operation=list`)
        .then(res => {
          const patients = res.data;
          const tbody = document.getElementById('patientsTableBody');
          if (!tbody) return; // Only run on patient management pages
          tbody.innerHTML = '';

          patients.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${p.full_name}</td>
              <td>${p.email}</td>
              <td>${p.birthdate || '-'}</td>
              <td>${p.sex === 1 ? 'Male' : 'Female'}</td>
              <td>${p.contact_number || '-'}</td>
              <td>
                <button class="btn btn-sm btn-info" onclick="viewPatient(${p.id})">View</button>
                <button class="btn btn-sm btn-warning" onclick="editPatient(${p.id})">Edit</button>
              </td>
            `;
            tbody.appendChild(tr);
          });
        });
    }

function viewPatient(id) {
  axios.get(`${baseApiUrl}/patients.php?operation=view&id=${id}`).then(res => {
    const p = res.data;

    document.getElementById('viewName').textContent = p.full_name || '-';
    document.getElementById('viewEmail').textContent = p.email || '-';
    document.getElementById('viewBirthdate').textContent = p.birthdate || '-';
    document.getElementById('viewSex').textContent = p.sex == 1 ? 'Male' : 'Female';
    document.getElementById('viewContact').textContent = p.contact_number || '-';
    document.getElementById('viewAddress').textContent = p.address || '-';

    document.getElementById('viewModal').style.display = 'block';
  });
}

function closeViewModal() {
  document.getElementById('viewModal').style.display = 'none';
}

    function editPatient(id) {
      selectedId = id;
      axios.get(`${baseApiUrl}/patients.php?operation=view&id=${id}`).then(res => {
        const p = res.data;
        document.getElementById('editName').value = p.full_name;
        document.getElementById('editEmail').value = p.email;
        document.getElementById('editBirthdate').value = p.birthdate;
        document.getElementById('editSex').value = p.sex;
        document.getElementById('editContact').value = p.contact_number;
        document.getElementById('editAddress').value = p.address;
        document.getElementById('updateModal').style.display = 'block';
        document.getElementById('modalBackdrop').style.display = 'block';
      });
    }

    function saveUpdate() {
      const name = document.getElementById('editName').value.trim();
      const email = document.getElementById('editEmail').value.trim();
      const birthdate = document.getElementById('editBirthdate').value.trim();
      const sex = parseInt(document.getElementById('editSex').value);
      const contact = document.getElementById('editContact').value.trim();
      const address = document.getElementById('editAddress').value.trim();

      if (!name || !email) {
        alert("Name and email are required.");
        return;
      }

      const updatedData = {
        full_name: name,
        email: email,
        birthdate: birthdate,
        sex: sex,
        contact_number: contact,
        address: address
      };

      axios.post(`${baseApiUrl}/patients.php?operation=update&id=${selectedId}`, updatedData)
        .then(res => {
          alert(res.data.message || "Patient updated.");
          closeModal();
          fetchPatients();
        });
    }

    function closeModal() {
      document.getElementById('updateModal').style.display = 'none';
      document.getElementById('modalBackdrop').style.display = 'none';
    }

    // Appointment request logic for patient_appointment.html

    // Fetch and display patient's appointments (all statuses)
function loadPatientAppointments() {
    const storedId = localStorage.getItem('id') || window.firstAvailablePatientId;
    if (!storedId) return;
    axios.get(`../api/appointment.php?action=list`)
        .then(res => {
            const data = res.data;
            if (data.success && Array.isArray(data.requests)) {
                // Only show confirmed appointments
                const myAppointments = data.requests.filter(app =>
                    app.patient_id == storedId && app.status_name?.toLowerCase() === 'confirmed'
                );
                displayPatientAppointments(myAppointments);
            }
        });
}

    function displayPatientAppointments(appointments) {
        const tableBody = document.getElementById('patientAppointmentsTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (!appointments || appointments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No appointments found.</td></tr>';
            return;
        }
        appointments.forEach(app => {
            const statusClass = getStatusClass(app.status_name);
            const queue = app.queue_number || app.appointment_id;
            const doctor = app.doctor_name || 'Not assigned';
            const status = app.status_name || 'Pending';
            const date = formatDate(app.appointment_date);
            row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="status-badge status-info">${queue}</span></td>
                <td>${date}</td>
                <td><span class="status-badge status-${statusClass}">${status}</span></td>
                <td>${doctor}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function getStatusClass(status) {
        switch(status?.toLowerCase()) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'danger';
            case 'completed': return 'info';
            default: return 'secondary';
        }
    }

    // After DOMContentLoaded, also load patient appointments
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('appointmentForm');
        const statusDiv = document.getElementById('appointmentStatus');

        // Debug function to check localStorage
        function debugLocalStorage() {
            console.log('localStorage contents:');
            console.log('id:', localStorage.getItem('id'));
            console.log('fullName:', localStorage.getItem('fullName'));
            console.log('role:', localStorage.getItem('role'));
        }

        // Function to get available patients
        function getAvailablePatients() {
            axios.get('../api/patients.php?operation=list')
                .then(res => {
                    console.log('Available patients:', res.data);
                    if (res.data && res.data.length > 0) {
                        console.log('First patient ID:', res.data[0].patient_id);
                        // Update the fallback to use the first available patient
                        window.firstAvailablePatientId = res.data[0].patient_id;
                    }
                })
                .catch(err => {
                    console.error('Error fetching patients:', err);
                });
        }

        // Call debug function
        debugLocalStorage();
        // Get available patients
        getAvailablePatients();

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                // Clear previous status
                statusDiv.innerHTML = '';
                statusDiv.className = '';

                const date = document.getElementById('appointmentDate').value;

                if (!date) {
                    statusDiv.textContent = 'Please select a date.';
                    statusDiv.className = 'error';
                    return;
                }

                // Check if date is in the past
                const selectedDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                    statusDiv.textContent = 'Please select a future date.';
                    statusDiv.className = 'error';
                    return;
                }

                // Show loading message
                statusDiv.textContent = 'Requesting appointment...';
                statusDiv.className = 'loading';

                // Get patient_id from localStorage or use fallback
                const storedId = localStorage.getItem('id');
                console.log('Stored ID from localStorage:', storedId);

                // If no stored ID, use a fallback for testing (you can change this to a valid patient_id from your database)
                let patientId = storedId;
                if (!storedId) {
                    // Use the first available patient ID from the database
                    patientId = window.firstAvailablePatientId || 1;
                    console.log('Using fallback patient_id:', patientId);
                    if (window.firstAvailablePatientId) {
                        statusDiv.innerHTML = '<div class="warning">Warning: Using test patient ID. Please log in for production use.</div>';
                    } else {
                        statusDiv.textContent = 'Error: No patients found in database. Please add a patient first.';
                        statusDiv.className = 'error';
                        return;
                    }
                }

                axios.post('../api/appointment.php?action=request', {
                    date: date,
                    patient_id: parseInt(patientId)
                })
                .then(res => {
                    const data = res.data;
                    if (data && data.success) {
                        statusDiv.innerHTML = `
                            <div class="success">
                                <strong>Appointment requested successfully!</strong><br>
                                Status: ${data.status}<br>
                                ${data.reference ? `Reference #: <b>${data.reference}</b>` : ''}
                            </div>
                        `;
                        statusDiv.className = 'success';
                        // Clear the form
                        form.reset();
                    } else {
                        let msg = (data && data.message) ? data.message : 'Unknown error occurred.';
                        if (data && data.error) msg += ' (' + data.error + ')';
                        statusDiv.textContent = msg;
                        statusDiv.className = 'error';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    let errorMsg = 'Error connecting to server.';
                    if (error.response && error.response.data && error.response.data.message) {
                        errorMsg = error.response.data.message;
                    }
                    statusDiv.textContent = errorMsg;
                    statusDiv.className = 'error';
                });
            });
        }
        // Only run fetchPatients if the table exists
        if (document.getElementById('patientsTableBody')) {
            fetchPatients();
        }
        loadPatientAppointments();
    });


    function displayPatientAppointments(appointments) {
        const tableBody = document.getElementById('patientAppointmentsTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (!appointments || appointments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No appointments found.</td></tr>';
            return;
        }
        appointments.forEach(app => {
            const statusClass = getStatusClass(app.status_name);
            const queue = app.queue_number || app.appointment_id;
            const doctor = app.doctor_name || 'Not assigned';
            const status = app.status_name || 'Pending';
            const date = formatDate(app.appointment_date);
            row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="status-badge status-info">${queue}</span></td>
                <td>${date}</td>
                <td><span class="status-badge status-${statusClass}">${status}</span></td>
                <td>${doctor}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function getStatusClass(status) {
        switch(status?.toLowerCase()) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'danger';
            case 'completed': return 'info';
            default: return 'secondary';
        }
    }

    // After DOMContentLoaded, also load patient appointments
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('appointmentForm');
        const statusDiv = document.getElementById('appointmentStatus');

        // Debug function to check localStorage
        function debugLocalStorage() {
            console.log('localStorage contents:');
            console.log('id:', localStorage.getItem('id'));
            console.log('fullName:', localStorage.getItem('fullName'));
            console.log('role:', localStorage.getItem('role'));
        }

        // Function to get available patients
        function getAvailablePatients() {
            axios.get('../api/patients.php?operation=list')
                .then(res => {
                    console.log('Available patients:', res.data);
                    if (res.data && res.data.length > 0) {
                        console.log('First patient ID:', res.data[0].patient_id);
                        // Update the fallback to use the first available patient
                        window.firstAvailablePatientId = res.data[0].patient_id;
                    }
                })
                .catch(err => {
                    console.error('Error fetching patients:', err);
                });
        }

        // Call debug function
        debugLocalStorage();
        // Get available patients
        getAvailablePatients();

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                // Clear previous status
                statusDiv.innerHTML = '';
                statusDiv.className = '';

                const date = document.getElementById('appointmentDate').value;

                if (!date) {
                    statusDiv.textContent = 'Please select a date.';
                    statusDiv.className = 'error';
                    return;
                }

                // Check if date is in the past
                const selectedDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                    statusDiv.textContent = 'Please select a future date.';
                    statusDiv.className = 'error';
                    return;
                }

                // Show loading message
                statusDiv.textContent = 'Requesting appointment...';
                statusDiv.className = 'loading';

                // Get patient_id from localStorage or use fallback
                const storedId = localStorage.getItem('id');
                console.log('Stored ID from localStorage:', storedId);

                // If no stored ID, use a fallback for testing (you can change this to a valid patient_id from your database)
                let patientId = storedId;
                if (!storedId) {
                    // Use the first available patient ID from the database
                    patientId = window.firstAvailablePatientId || 1;
                    console.log('Using fallback patient_id:', patientId);
                    if (window.firstAvailablePatientId) {
                        statusDiv.innerHTML = '<div class="warning">Warning: Using test patient ID. Please log in for production use.</div>';
                    } else {
                        statusDiv.textContent = 'Error: No patients found in database. Please add a patient first.';
                        statusDiv.className = 'error';
                        return;
                    }
                }

                axios.post('../api/appointment.php?action=request', {
                    date: date,
                    patient_id: parseInt(patientId)
                })
                .then(res => {
                    const data = res.data;
                    if (data && data.success) {
                        statusDiv.innerHTML = `
                            <div class="success">
                                <strong>Appointment requested successfully!</strong><br>
                                Status: ${data.status}<br>
                                ${data.reference ? `Reference #: <b>${data.reference}</b>` : ''}
                            </div>
                        `;
                        statusDiv.className = 'success';
                        // Clear the form
                        form.reset();
                    } else {
                        let msg = (data && data.message) ? data.message : 'Unknown error occurred.';
                        if (data && data.error) msg += ' (' + data.error + ')';
                        statusDiv.textContent = msg;
                        statusDiv.className = 'error';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    let errorMsg = 'Error connecting to server.';
                    if (error.response && error.response.data && error.response.data.message) {
                        errorMsg = error.response.data.message;
                    }
                    statusDiv.textContent = errorMsg;
                    statusDiv.className = 'error';
                });
            });
        }
        // Only run fetchPatients if the table exists
        if (document.getElementById('patientsTableBody')) {
            fetchPatients();
        }
        loadPatientAppointments();
    });
