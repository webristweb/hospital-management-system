/* =============================================
   City Care Hospital - Patients JS
   ============================================= */

'use strict';

let allPatients = [];
let sortKey = 'id';
let sortDir = 'asc';
let currentPage = 1;
const PER_PAGE = 8;

const loadPatients = () => {
  allPatients = Storage.get('hms_patients') || [];
};

const savePatients = () => {
  Storage.set('hms_patients', allPatients);
};

// Populate doctor dropdown
const populateDoctors = () => {
  const doctors = Storage.get('hms_doctors') || [];
  const sel = document.getElementById('patientDoctor');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select Doctor</option>' +
    doctors.map(d => `<option value="${d.name}" data-id="${d.id}">${d.name} — ${d.specialization}</option>`).join('');
};

// Stats
const renderPatientStats = () => {
  const container = document.getElementById('patientStats');
  if (!container) return;
  const active = allPatients.filter(p => p.status === 'Active').length;
  const discharged = allPatients.filter(p => p.status === 'Discharged').length;
  const critical = allPatients.filter(p => p.status === 'Critical').length;
  container.innerHTML = `
    <div class="stat-card stat-card-1"><div class="stat-icon"><i class="fas fa-users"></i></div><div class="stat-info"><h3>${allPatients.length}</h3><p>Patients</p></div></div>
    <div class="stat-card stat-card-2"><div class="stat-icon"><i class="fas fa-heartbeat"></i></div><div class="stat-info"><h3>${active}</h3><p>Active</p></div></div>
    <div class="stat-card stat-card-3"><div class="stat-icon"><i class="fas fa-procedures"></i></div><div class="stat-info"><h3>${critical}</h3><p>Critical</p></div></div>
    <div class="stat-card" style="border-top:4px solid var(--gray-400)"><div class="stat-icon" style="background:linear-gradient(135deg,#9e9e9e,#616161)"><i class="fas fa-sign-out-alt"></i></div><div class="stat-info"><h3>${discharged}</h3><p>Discharged</p></div></div>`;
};

// Render table
const renderPatients = () => {
  const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const filterStatus = document.getElementById('filterStatus')?.value || '';
  const filterBlood = document.getElementById('filterBlood')?.value || '';
  const filterGender = document.getElementById('filterGender')?.value || '';

  let filtered = allPatients.filter(p => {
    const matchQuery = !query || ['name','id','disease','phone','email','blood'].some(f => String(p[f]||'').toLowerCase().includes(query));
    const matchStatus = !filterStatus || p.status === filterStatus;
    const matchBlood = !filterBlood || p.blood === filterBlood;
    const matchGender = !filterGender || p.gender === filterGender;
    return matchQuery && matchStatus && matchBlood && matchGender;
  });

  filtered = sortTable(filtered, sortKey, sortDir);
  const { items, total, totalPages, page } = paginate(filtered, currentPage, PER_PAGE);

  const tbody = document.getElementById('patientsTableBody');
  const countEl = document.getElementById('patientCount');
  if (countEl) countEl.textContent = `Showing ${filtered.length} of ${allPatients.length} patients`;

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><i class="fas fa-user-slash"></i><h3>No patients found</h3><p>Try adjusting your search or filters</p></div></td></tr>`;
  } else {
    tbody.innerHTML = items.map(p => `
      <tr>
        <td><span class="badge badge-primary" style="font-size:11px">${p.id}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="table-avatar" style="background:${getAvatarColor(p.name)}">${getInitials(p.name)}</div>
            <div><div class="table-name">${p.name}</div><div class="table-sub">${p.gender}, ${p.age} yrs</div></div>
          </div>
        </td>
        <td>${p.age}</td>
        <td><span class="badge badge-info">${p.blood}</span></td>
        <td>${p.phone}</td>
        <td><span title="${p.disease}">${p.disease.length > 20 ? p.disease.slice(0,20)+'…' : p.disease}</span></td>
        <td><div class="table-sub">${p.doctor}</div></td>
        <td>${formatDate(p.admitDate)}</td>
        <td>${getStatusBadge(p.status)}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="action-btn action-btn-view" title="View" onclick="viewPatient('${p.id}')"><i class="fas fa-eye"></i></button>
            <button class="action-btn action-btn-edit" title="Edit" onclick="editPatient('${p.id}')"><i class="fas fa-edit"></i></button>
            <button class="action-btn action-btn-delete" title="Delete" onclick="deletePatient('${p.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`).join('');
  }

  renderPagination(total, totalPages, page);

  // Mobile card view
  const mobileList = document.getElementById('mobileCardList');
  if (mobileList) {
    if (!items.length) {
      mobileList.innerHTML = `<div class="empty-state"><i class="fas fa-user-slash"></i><h3>No patients found</h3><p>Try adjusting your filters</p></div>`;
    } else {
      mobileList.innerHTML = items.map(p => {
        const color = getAvatarColor(p.name);
        const statusMap = { 'Active':'badge-success','Discharged':'badge-secondary','Critical':'badge-danger' };
        return `<div class="mobile-card">
          <div class="mobile-card-header">
            <div class="mobile-card-avatar" style="background:${color}">${getInitials(p.name)}</div>
            <div class="mobile-card-title"><h4>${p.name}</h4><p>${p.id} &bull; ${p.disease}</p></div>
            <span class="badge ${statusMap[p.status]||'badge-secondary'}">${p.status}</span>
          </div>
          <div class="mobile-card-body">
            <div class="mobile-card-field"><span class="mobile-card-field-label">Age / Gender</span><span class="mobile-card-field-value">${p.age} yrs / ${p.gender}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Blood Group</span><span class="mobile-card-field-value"><span class="badge badge-danger">${p.blood}</span></span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Phone</span><span class="mobile-card-field-value">${p.phone}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Doctor</span><span class="mobile-card-field-value" style="font-size:11px">${p.doctor}</span></div>
          </div>
          <div class="mobile-card-actions">
            <button class="btn btn-light btn-sm" onclick="viewPatient('${p.id}')"><i class="fas fa-eye"></i> View</button>
            <button class="btn btn-outline btn-sm" onclick="editPatient('${p.id}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deletePatient('${p.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      }).join('');
    }
  }
};

const renderPagination = (total, totalPages, page) => {
  const container = document.getElementById('paginationContainer');
  if (!container) return;
  const start = (page - 1) * PER_PAGE + 1;
  const end = Math.min(page * PER_PAGE, total);
  container.innerHTML = `
    <span style="font-size:13px;color:var(--text-secondary)">Showing ${total ? start : 0}–${end} of ${total} records</span>
    <div style="display:flex;gap:6px">
      <button class="btn btn-light btn-sm" ${page <= 1 ? 'disabled' : ''} onclick="changePage(${page - 1})"><i class="fas fa-chevron-left"></i></button>
      ${Array.from({length: totalPages}, (_, i) => `<button class="btn ${i+1 === page ? 'btn-primary' : 'btn-light'} btn-sm" onclick="changePage(${i+1})">${i+1}</button>`).join('')}
      <button class="btn btn-light btn-sm" ${page >= totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})"><i class="fas fa-chevron-right"></i></button>
    </div>`;
};

const changePage = (p) => { currentPage = p; renderPatients(); };

const sortBy = (key) => {
  if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  else { sortKey = key; sortDir = 'asc'; }
  renderPatients();
};

const clearFilters = () => {
  ['searchInput','filterStatus','filterBlood','filterGender'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  currentPage = 1;
  renderPatients();
};

// Open Add Modal
const openAddPatientModal = () => {
  document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add New Patient';
  document.getElementById('patientForm').reset();
  document.getElementById('patientId').value = '';
  document.getElementById('patientAdmitDate').value = today();
  populateDoctors();
  Modal.open('patientModal');
};

// Edit
const editPatient = (id) => {
  const p = allPatients.find(p => p.id === id);
  if (!p) return;
  document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Patient';
  populateDoctors();
  setTimeout(() => {
    document.getElementById('patientId').value = p.id;
    document.getElementById('patientName').value = p.name;
    document.getElementById('patientPhone').value = p.phone;
    document.getElementById('patientAge').value = p.age;
    document.getElementById('patientGender').value = p.gender;
    document.getElementById('patientBlood').value = p.blood;
    document.getElementById('patientEmail').value = p.email || '';
    document.getElementById('patientAdmitDate').value = p.admitDate;
    document.getElementById('patientAddress').value = p.address || '';
    document.getElementById('patientDisease').value = p.disease;
    document.getElementById('patientDoctor').value = p.doctor;
    document.getElementById('patientStatus').value = p.status;
    document.getElementById('patientNotes').value = p.notes || '';
  }, 50);
  Modal.open('patientModal');
};

// Save
const savePatient = () => {
  const id = document.getElementById('patientId').value;
  const name = document.getElementById('patientName').value.trim();
  const phone = document.getElementById('patientPhone').value.trim();
  const age = document.getElementById('patientAge').value;
  const gender = document.getElementById('patientGender').value;
  const blood = document.getElementById('patientBlood').value;
  const admitDate = document.getElementById('patientAdmitDate').value;
  const disease = document.getElementById('patientDisease').value.trim();
  const doctor = document.getElementById('patientDoctor').value;

  if (!name || !phone || !age || !gender || !blood || !admitDate || !disease || !doctor) {
    Toast.error('Validation Error', 'Please fill in all required fields.');
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    Toast.error('Invalid Phone', 'Please enter a valid 10-digit phone number.');
    return;
  }

  const doctorEl = document.getElementById('patientDoctor');
  const docId = doctorEl.selectedOptions[0]?.dataset.id || '';

  const data = {
    name, phone, age: parseInt(age), gender, blood,
    email: document.getElementById('patientEmail').value.trim(),
    admitDate, address: document.getElementById('patientAddress').value.trim(),
    disease, doctor, docId, status: document.getElementById('patientStatus').value,
    notes: document.getElementById('patientNotes').value.trim(),
    createdAt: new Date().toISOString()
  };

  if (id) {
    const idx = allPatients.findIndex(p => p.id === id);
    if (idx > -1) { allPatients[idx] = { ...allPatients[idx], ...data }; Toast.success('Updated!', `${name}'s record updated.`); }
  } else {
    data.id = generateId('HMS', allPatients);
    allPatients.unshift(data);
    Toast.success('Patient Added!', `${name} has been registered.`);
  }

  savePatients();
  Modal.close('patientModal');
  renderPatients();
  renderPatientStats();
};

// View
const viewPatient = (id) => {
  const p = allPatients.find(p => p.id === id);
  if (!p) return;
  const statusMap = { 'Active':'success','Discharged':'secondary','Critical':'danger' };
  document.getElementById('viewPatientBody').innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="width:72px;height:72px;background:${getAvatarColor(p.name)};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:white;margin:0 auto 10px">${getInitials(p.name)}</div>
      <h3 style="font-size:20px;font-weight:700">${p.name}</h3>
      <p style="color:var(--text-secondary);font-size:13px">${p.id} &bull; ${p.disease}</p>
      <span class="badge badge-${statusMap[p.status]||'secondary'}" style="margin-top:6px">${p.status}</span>
    </div>
    <div class="form-row" style="gap:12px">
      <div style="background:var(--light);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Age / Gender</div><div style="font-weight:600">${p.age} yrs / ${p.gender}</div></div>
      <div style="background:var(--light);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Blood Group</div><div style="font-weight:600">${p.blood}</div></div>
      <div style="background:var(--light);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Phone</div><div style="font-weight:600">${p.phone}</div></div>
    </div>
    <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:var(--light);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Assigned Doctor</div><div style="font-weight:600">${p.doctor}</div></div>
      <div style="background:var(--light);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Admission Date</div><div style="font-weight:600">${formatDate(p.admitDate)}</div></div>
      <div style="background:var(--light);border-radius:8px;padding:14px;grid-column:span 2"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Address</div><div style="font-weight:600">${p.address || '—'}</div></div>
    </div>`;
  Modal.open('viewPatientModal');
};

// Delete
const deletePatient = (id) => {
  const p = allPatients.find(p => p.id === id);
  if (!p) return;
  Confirm.show('Delete Patient?', `Remove ${p.name} from the system?`, () => {
    allPatients = allPatients.filter(p => p.id !== id);
    savePatients();
    renderPatients();
    renderPatientStats();
    Toast.success('Deleted!', 'Patient record removed.');
  });
};

// Export CSV
const exportCSV = () => {
  const headers = ['ID','Name','Age','Gender','Blood','Phone','Email','Disease','Doctor','Status','Admit Date'];
  const rows = allPatients.map(p => [p.id,p.name,p.age,p.gender,p.blood,p.phone,p.email,p.disease,p.doctor,p.status,p.admitDate]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'patients.csv';
  a.click();
  Toast.success('Exported!', 'Patient data downloaded as CSV.');
};

document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  loadPatients();
  renderPatients();
  renderPatientStats();
});
