/* =============================================
   City Care Hospital - Doctors JS
   ============================================= */

'use strict';

let allDoctors = [];
let sortKey = 'id';
let sortDir = 'asc';
let currentPage = 1;
const PER_PAGE = 8;

const specColors = {
  'Cardiology': '#e53935', 'Neurology': '#8e24aa', 'Orthopedics': '#f57c00',
  'Pediatrics': '#00acc1', 'Oncology': '#3949ab', 'Dermatology': '#e91e63',
  'Endocrinology': '#00897b', 'General Surgery': '#43a047', 'Pulmonology': '#6d4c41',
  'Gastroenterology': '#fdd835', 'Nephrology': '#0288d1', 'Urology': '#5e35b1',
  'Psychiatry': '#d81b60', 'Ophthalmology': '#039be5', 'ENT': '#7cb342'
};

const loadDoctors = () => { allDoctors = Storage.get('hms_doctors') || []; };
const saveDoctors = () => { Storage.set('hms_doctors', allDoctors); };

const renderDoctorStats = () => {
  const container = document.getElementById('doctorStats');
  if (!container) return;
  const available = allDoctors.filter(d => d.status === 'Available').length;
  const onLeave = allDoctors.filter(d => d.status === 'On Leave').length;
  const specs = [...new Set(allDoctors.map(d => d.specialization))].length;
  container.innerHTML = `
    <div class="stat-card stat-card-1"><div class="stat-icon"><i class="fas fa-user-md"></i></div><div class="stat-info"><h3>${allDoctors.length}</h3><p>Doctors</p></div></div>
    <div class="stat-card stat-card-2"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><h3>${available}</h3><p>Available</p></div></div>
    <div class="stat-card stat-card-3"><div class="stat-icon"><i class="fas fa-bed"></i></div><div class="stat-info"><h3>${onLeave}</h3><p>On Leave</p></div></div>
    <div class="stat-card" style="border-top:4px solid var(--secondary)"><div class="stat-icon" style="background:linear-gradient(135deg,#00bcd4,#006064)"><i class="fas fa-stethoscope"></i></div><div class="stat-info"><h3>${specs}</h3><p>Specs</p></div></div>`;
};

const renderDoctors = () => {
  const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const filterSpec = document.getElementById('filterSpec')?.value || '';
  const filterStatus = document.getElementById('filterStatus')?.value || '';

  let filtered = allDoctors.filter(d => {
    const mq = !query || ['name','specialization','phone','email','id'].some(f => String(d[f]||'').toLowerCase().includes(query));
    const ms = !filterSpec || d.specialization === filterSpec;
    const mst = !filterStatus || d.status === filterStatus;
    return mq && ms && mst;
  });

  filtered = sortTable(filtered, sortKey, sortDir);
  const { items, total, totalPages, page } = paginate(filtered, currentPage, PER_PAGE);

  const tbody = document.getElementById('doctorsTableBody');
  const countEl = document.getElementById('doctorCount');
  if (countEl) countEl.textContent = `Showing ${filtered.length} of ${allDoctors.length} doctors`;

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><i class="fas fa-user-md"></i><h3>No doctors found</h3><p>Try adjusting filters</p></div></td></tr>`;
  } else {
    tbody.innerHTML = items.map(d => {
      const color = specColors[d.specialization] || '#1a73e8';
      return `<tr>
        <td><span class="badge badge-primary" style="font-size:11px">${d.id}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="doctor-avatar" style="background:${color}20;color:${color};font-size:13px">${getInitials(d.name)}</div>
            <div><div class="table-name">${d.name}</div><div class="table-sub">${d.qualification || 'MBBS, MD'}</div></div>
          </div>
        </td>
        <td><span class="badge" style="background:${color}15;color:${color}">${d.specialization}</span></td>
        <td>${d.phone}</td>
        <td style="font-size:12px">${d.email}</td>
        <td><span style="font-size:12px;color:var(--text-secondary)">${d.schedule || '—'}</span></td>
        <td><span class="badge badge-info">${d.experience || '—'}</span></td>
        <td><strong>${d.patients || 0}</strong></td>
        <td>${getStatusBadge(d.status)}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="action-btn action-btn-view" title="View" onclick="viewDoctor('${d.id}')"><i class="fas fa-eye"></i></button>
            <button class="action-btn action-btn-edit" title="Edit" onclick="editDoctor('${d.id}')"><i class="fas fa-edit"></i></button>
            <button class="action-btn action-btn-delete" title="Delete" onclick="deleteDoctor('${d.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  renderPagination(total, totalPages, page);

  // Mobile card view
  const mobileList = document.getElementById('mobileCardList');
  if (mobileList) {
    if (!items.length) {
      mobileList.innerHTML = `<div class="empty-state"><i class="fas fa-user-md"></i><h3>No doctors found</h3><p>Try adjusting filters</p></div>`;
    } else {
      mobileList.innerHTML = items.map(d => {
        const color = specColors[d.specialization] || '#1a73e8';
        const statusMap = { 'Available':'badge-success','On Leave':'badge-warning','Inactive':'badge-secondary' };
        return `<div class="mobile-card">
          <div class="mobile-card-header">
            <div class="mobile-card-avatar" style="background:${color}20;color:${color}">${getInitials(d.name)}</div>
            <div class="mobile-card-title"><h4>${d.name}</h4><p style="color:${color};font-weight:600">${d.specialization}</p></div>
            <span class="badge ${statusMap[d.status]||'badge-secondary'}">${d.status}</span>
          </div>
          <div class="mobile-card-body">
            <div class="mobile-card-field"><span class="mobile-card-field-label">Phone</span><span class="mobile-card-field-value">${d.phone}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Experience</span><span class="mobile-card-field-value">${d.experience||'—'}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Patients</span><span class="mobile-card-field-value">${d.patients||0}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Schedule</span><span class="mobile-card-field-value" style="font-size:11px">${d.schedule||'—'}</span></div>
          </div>
          <div class="mobile-card-actions">
            <button class="btn btn-light btn-sm" onclick="viewDoctor('${d.id}')"><i class="fas fa-eye"></i> View</button>
            <button class="btn btn-outline btn-sm" onclick="editDoctor('${d.id}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteDoctor('${d.id}')"><i class="fas fa-trash"></i> Delete</button>
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
      <button class="btn btn-light btn-sm" ${page<=1?'disabled':''} onclick="changePage(${page-1})"><i class="fas fa-chevron-left"></i></button>
      ${Array.from({length:totalPages},(_,i)=>`<button class="btn ${i+1===page?'btn-primary':'btn-light'} btn-sm" onclick="changePage(${i+1})">${i+1}</button>`).join('')}
      <button class="btn btn-light btn-sm" ${page>=totalPages?'disabled':''} onclick="changePage(${page+1})"><i class="fas fa-chevron-right"></i></button>
    </div>`;
};

const changePage = (p) => { currentPage = p; renderDoctors(); };
const sortBy = (k) => { if (sortKey===k) sortDir=sortDir==='asc'?'desc':'asc'; else { sortKey=k; sortDir='asc'; } renderDoctors(); };
const clearFilters = () => { ['searchInput','filterSpec','filterStatus'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';}); currentPage=1; renderDoctors(); };

const openAddDoctorModal = () => {
  document.getElementById('doctorModalTitle').innerHTML = '<i class="fas fa-user-md"></i> Add New Doctor';
  document.getElementById('doctorForm').reset();
  document.getElementById('doctorId').value = '';
  Modal.open('doctorModal');
};

const editDoctor = (id) => {
  const d = allDoctors.find(d => d.id === id);
  if (!d) return;
  document.getElementById('doctorModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Doctor';
  setTimeout(() => {
    document.getElementById('doctorId').value = d.id;
    document.getElementById('doctorName').value = d.name;
    document.getElementById('doctorSpec').value = d.specialization;
    document.getElementById('doctorPhone').value = d.phone;
    document.getElementById('doctorEmail').value = d.email;
    document.getElementById('doctorSchedule').value = d.schedule || '';
    document.getElementById('doctorExperience').value = d.experience || '';
    document.getElementById('doctorQual').value = d.qualification || '';
    document.getElementById('doctorStatus').value = d.status;
  }, 50);
  Modal.open('doctorModal');
};

const saveDoctor = () => {
  const id = document.getElementById('doctorId').value;
  const name = document.getElementById('doctorName').value.trim();
  const spec = document.getElementById('doctorSpec').value;
  const phone = document.getElementById('doctorPhone').value.trim();
  const email = document.getElementById('doctorEmail').value.trim();

  if (!name || !spec || !phone || !email) { Toast.error('Validation Error', 'Please fill in all required fields.'); return; }
  if (!/^\d{10}$/.test(phone)) { Toast.error('Invalid Phone', 'Enter a valid 10-digit number.'); return; }

  const data = {
    name, specialization: spec, phone, email,
    schedule: document.getElementById('doctorSchedule').value.trim(),
    experience: document.getElementById('doctorExperience').value.trim(),
    qualification: document.getElementById('doctorQual').value.trim(),
    status: document.getElementById('doctorStatus').value,
    createdAt: new Date().toISOString()
  };

  if (id) {
    const idx = allDoctors.findIndex(d => d.id === id);
    if (idx > -1) { allDoctors[idx] = { ...allDoctors[idx], ...data }; Toast.success('Updated!', `${name}'s profile updated.`); }
  } else {
    data.id = generateId('DOC', allDoctors);
    data.patients = 0;
    allDoctors.unshift(data);
    Toast.success('Doctor Added!', `${name} has been registered.`);
  }

  saveDoctors();
  Modal.close('doctorModal');
  renderDoctors();
  renderDoctorStats();
};

const viewDoctor = (id) => {
  const d = allDoctors.find(d => d.id === id);
  if (!d) return;
  const color = specColors[d.specialization] || '#1a73e8';
  const statusMap = { 'Available': 'success', 'On Leave': 'warning', 'Inactive': 'secondary' };
  document.getElementById('viewDoctorBody').innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="width:72px;height:72px;background:${color}20;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:${color};margin:0 auto 10px;border:3px solid ${color}30">${getInitials(d.name)}</div>
      <h3 style="font-size:20px;font-weight:700">${d.name}</h3>
      <p style="color:${color};font-size:13px;font-weight:600">${d.specialization}</p>
      <span class="badge badge-${statusMap[d.status]||'secondary'}" style="margin-top:6px">${d.status}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:var(--light);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Doctor ID</div><div style="font-weight:600">${d.id}</div></div>
      <div style="background:var(--light);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Qualification</div><div style="font-weight:600">${d.qualification || 'MBBS, MD'}</div></div>
      <div style="background:var(--light);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Phone</div><div style="font-weight:600">${d.phone}</div></div>
      <div style="background:var(--light);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Email</div><div style="font-weight:600;font-size:12px">${d.email}</div></div>
      <div style="background:var(--light);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Experience</div><div style="font-weight:600">${d.experience || '—'}</div></div>
      <div style="background:var(--light);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Total Patients</div><div style="font-weight:600">${d.patients || 0}</div></div>
      <div style="background:var(--light);border-radius:8px;padding:14px;grid-column:span 2"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Schedule</div><div style="font-weight:600">${d.schedule || '—'}</div></div>
    </div>`;
  Modal.open('viewDoctorModal');
};

const deleteDoctor = (id) => {
  const d = allDoctors.find(d => d.id === id);
  if (!d) return;
  Confirm.show('Delete Doctor?', `Remove ${d.name} from the system?`, () => {
    allDoctors = allDoctors.filter(d => d.id !== id);
    saveDoctors();
    renderDoctors();
    renderDoctorStats();
    Toast.success('Deleted!', 'Doctor record removed.');
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  loadDoctors();
  renderDoctors();
  renderDoctorStats();
});
