
    const baseApiUrl = "http://localhost/clinic2.0/api";
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

    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('appointmentForm');
        const statusDiv = document.getElementById('appointmentStatus');

        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const date = document.getElementById('appointmentDate').value;
                axios.post('../api/appointment.php', {
                    action: 'request',
                    date: date,
                    patient_id: 1 // Use test patient for now
                })
                .then(res => {
                    const data = res.data;
                    if (data && data.success) {
                        statusDiv.innerHTML = `Appointment requested! Status: ${data.status}` + (data.reference ? `<br>Reference #: <b>${data.reference}</b>` : '');
                    } else {
                        let msg = (data && data.message) ? data.message : 'Unknown error.';
                        if (data && data.error) msg += ' (' + data.error + ')';
                        statusDiv.textContent = msg;
                    }
                })
                .catch(() => {
                    statusDiv.textContent = 'Error connecting to server.';
                });
            });
        }
        // Only run fetchPatients if the table exists
        if (document.getElementById('patientsTableBody')) {
            fetchPatients();
        }
    });
