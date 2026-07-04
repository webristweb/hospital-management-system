/* =============================================
   City Care Hospital - Appointments JS
   ============================================= */

'use strict';

let allAppointments = [];
let sortKey = 'date';
let sortDir = 'desc';
let currentPage = 1;
let currentView = 'list';
let calYear, calMonth;
const PER_PAGE = 8;

const loadAppointments = () => { allAppointments = Storage.get('hms_appointments') || []; };
const saveAppointments = () => { Storage.set('hms_appointments', allAppointments); };

const populateDropdowns = () => {
  const patients = Storage.get('hms_patients') || [];
  const doctors = Storage.get('hms_doctors') || [];
  const pSel = document.getElementById('apptPatient');
  const dSel = document.getElementById('apptDoctor');
  if (pSel) pSel.innerHTML = '<option value="">Select Patient</option>' + patients.map(p => `<option value="${p.name}" data-id="${p.id}">${p.name} (${p.id})</option>`).join('');
  if (dSel) dSel.innerHTML = '<option value="">Select Doctor</option>' + doctors.map(d => `<option value="${d.name}" data-id="${d.id}">${d.name} — ${d.specialization}</option>`).join('');
};

const renderApptStats = () => {
  const container = document.getElementById('apptStats');
  if (!container) return;
  const todayStr = today();
  const scheduled = allAppointments.filter(a => a.status === 'Scheduled').length;
  const completed = allAppointments.filter(a => a.status === 'Completed').length;
  const cancelled = allAppointments.filter(a => a.status === 'Cancelled').length;
  const todayCount = allAppointments.filter(a => a.date === todayStr).length;
  container.innerHTML = `
    <div class="stat-card stat-card-1"><div class="stat-icon"><i class="fas fa-calendar-alt"></i></div><div class="stat-info"><h3>${allAppointments.length}</h3><p>Appointments</p></div></div>
    <div class="stat-card stat-card-3"><div class="stat-icon"><i class="fas fa-calendar-day"></i></div><div class="stat-info"><h3>${todayCount}</h3><p>Today</p></div></div>
    <div class="stat-card stat-card-2"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><h3>${completed}</h3><p>Completed</p></div></div>
    <div class="stat-card" style="border-top:4px solid var(--danger)"><div class="stat-icon" style="background:linear-gradient(135deg,#f44336,#b71c1c)"><i class="fas fa-ban"></i></div><div class="stat-info"><h3>${cancelled}</h3><p>Cancelled</p></div></div>`;
};

const renderAppointments = () => {
  const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const filterType = document.getElementById('filterType')?.value || '';
  const filterStatus = document.getElementById('filterStatus')?.value || '';
  const filterDate = document.getElementById('filterDate')?.value || '';

  let filtered = allAppointments.filter(a => {
    const mq = !query || ['patientName','doctorName','id','notes'].some(f => String(a[f]||'').toLowerCase().includes(query));
    const mt = !filterType || a.type === filterType;
    const ms = !filterStatus || a.status === filterStatus;
    const md = !filterDate || a.date === filterDate;
    return mq && mt && ms && md;
  });

  filtered = sortTable(filtered, sortKey, sortDir);
  const { items, total, totalPages, page } = paginate(filtered, currentPage, PER_PAGE);

  const countEl = document.getElementById('apptCount');
  if (countEl) countEl.textContent = `Showing ${filtered.length} of ${allAppointments.length} appointments`;

  const tbody = document.getElementById('apptsTableBody');
  if (!tbody) return;

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fas fa-calendar-times"></i><h3>No appointments found</h3><p>Try adjusting filters or add a new appointment</p></div></td></tr>`;
  } else {
    tbody.innerHTML = items.map(a => `
      <tr>
        <td><span class="badge badge-primary" style="font-size:11px">${a.id}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="table-avatar" style="background:${getAvatarColor(a.patientName)}">${getInitials(a.patientName)}</div>
            <div class="table-name">${a.patientName}</div>
          </div>
        </td>
        <td><div class="table-name">${a.doctorName}</div></td>
        <td>
          <div>${formatDate(a.date)}</div>
          <span class="time-badge"><i class="fas fa-clock"></i>${a.time}</span>
        </td>
        <td><span class="badge appt-type-${a.type.toLowerCase()}">${a.type}</span></td>
        <td><span style="font-size:12px;color:var(--text-secondary)">${(a.notes||'—').slice(0,35)}</span></td>
        <td>${getStatusBadge(a.status)}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="action-btn action-btn-edit" title="Edit" onclick="editAppointment('${a.id}')"><i class="fas fa-edit"></i></button>
            <button class="action-btn action-btn-view" title="Mark Complete" onclick="markComplete('${a.id}')"><i class="fas fa-check"></i></button>
            <button class="action-btn action-btn-delete" title="Delete" onclick="deleteAppointment('${a.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`).join('');
  }

  renderPagination(total, totalPages, page);

  // Mobile card view
  const mobileList = document.getElementById('mobileCardList');
  if (mobileList) {
    if (!items.length) {
      mobileList.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-times"></i><h3>No appointments found</h3><p>Try adjusting filters or add a new appointment</p></div>`;
    } else {
      const typeColors = { 'OPD': 'badge-info', 'IPD': 'badge-success', 'Emergency': 'badge-danger' };
      const statusMap = { 'Scheduled': 'badge-info', 'Completed': 'badge-success', 'Cancelled': 'badge-danger' };
      mobileList.innerHTML = items.map(a => {
        const patColor = getAvatarColor(a.patientName);
        return `<div class="mobile-card">
          <div class="mobile-card-header">
            <div class="mobile-card-avatar" style="background:${patColor}">${getInitials(a.patientName)}</div>
            <div class="mobile-card-title"><h4>${a.patientName}</h4><p>${a.id}</p></div>
            <span class="badge ${statusMap[a.status] || 'badge-secondary'}">${a.status}</span>
          </div>
          <div class="mobile-card-body">
            <div class="mobile-card-field"><span class="mobile-card-field-label">Doctor</span><span class="mobile-card-field-value" style="font-size:12px">${a.doctorName}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Type</span><span class="mobile-card-field-value"><span class="badge ${typeColors[a.type] || 'badge-secondary'}">${a.type}</span></span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Date</span><span class="mobile-card-field-value">${formatDate(a.date)}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Time</span><span class="mobile-card-field-value"><i class="fas fa-clock" style="color:var(--primary);font-size:11px"></i> ${a.time}</span></div>
          </div>
          ${a.notes ? `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;padding:8px;background:var(--light);border-radius:8px"><i class="fas fa-sticky-note"></i> ${a.notes}</div>` : ''}
          <div class="mobile-card-actions">
            <button class="btn btn-success btn-sm" onclick="markComplete('${a.id}')"><i class="fas fa-check"></i> Done</button>
            <button class="btn btn-outline btn-sm" onclick="editAppointment('${a.id}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteAppointment('${a.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      }).join('');
    }
  }
};

const renderPagination = (total, totalPages, page) => {
  const container = document.getElementById('paginationContainer');
  if (!container) return;
  const start = (page-1)*PER_PAGE+1, end = Math.min(page*PER_PAGE,total);
  container.innerHTML = `
    <span style="font-size:13px;color:var(--text-secondary)">Showing ${total?start:0}–${end} of ${total} records</span>
    <div style="display:flex;gap:6px">
      <button class="btn btn-light btn-sm" ${page<=1?'disabled':''} onclick="changePage(${page-1})"><i class="fas fa-chevron-left"></i></button>
      ${Array.from({length:totalPages},(_,i)=>`<button class="btn ${i+1===page?'btn-primary':'btn-light'} btn-sm" onclick="changePage(${i+1})">${i+1}</button>`).join('')}
      <button class="btn btn-light btn-sm" ${page>=totalPages?'disabled':''} onclick="changePage(${page+1})"><i class="fas fa-chevron-right"></i></button>
    </div>`;
};

const changePage = (p) => { currentPage=p; renderAppointments(); };
const sortBy = (k) => { if(sortKey===k) sortDir=sortDir==='asc'?'desc':'asc'; else{sortKey=k;sortDir='asc';} renderAppointments(); };
const clearFilters = () => { ['searchInput','filterType','filterStatus','filterDate'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';}); currentPage=1; renderAppointments(); };

// View Toggle
const switchView = (view) => {
  currentView = view;
  document.getElementById('listView').style.display = view==='list' ? '' : 'none';
  document.getElementById('calendarView').style.display = view==='calendar' ? '' : 'none';
  document.getElementById('tabList').classList.toggle('active', view==='list');
  document.getElementById('tabCalendar').classList.toggle('active', view==='calendar');
  if (view==='calendar') renderCalendar();
};

// Calendar
const renderCalendar = () => {
  const d = new Date(calYear, calMonth, 1);
  const monthName = d.toLocaleDateString('en-IN', { month:'long', year:'numeric' });
  document.getElementById('calMonthTitle').textContent = monthName;

  const startDay = d.getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  let html = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">`;
  days.forEach(d => { html += `<div style="text-align:center;font-weight:600;font-size:12px;color:var(--text-secondary);padding:8px 0">${d}</div>`; });

  for (let i=0; i<startDay; i++) html += `<div style="min-height:80px;background:var(--gray-100);border-radius:8px;opacity:0.5"></div>`;

  const todayDate = new Date();
  for (let day=1; day<=daysInMonth; day++) {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayAppts = allAppointments.filter(a => a.date === dateStr);
    const isToday = todayDate.getFullYear()===calYear && todayDate.getMonth()===calMonth && todayDate.getDate()===day;
    html += `<div style="min-height:80px;background:${isToday?'var(--primary-light)':'var(--white)'};border:${isToday?'2px solid var(--primary)':'1px solid var(--gray-200)'};border-radius:8px;padding:6px;cursor:pointer" onclick="filterByDate('${dateStr}')">
      <div style="font-size:13px;font-weight:${isToday?700:500};color:${isToday?'var(--primary)':'var(--text-primary)'};margin-bottom:4px">${day}</div>
      ${dayAppts.slice(0,2).map(a=>`<div style="font-size:10px;padding:2px 5px;border-radius:3px;margin-bottom:2px;background:${a.type==='Emergency'?'#ffebee':a.type==='IPD'?'#e8f5e9':'#e3f2fd'};color:${a.type==='Emergency'?'#c62828':a.type==='IPD'?'#2e7d32':'#1565c0'}">${a.patientName.split(' ')[0]} ${a.time}</div>`).join('')}
      ${dayAppts.length>2?`<div style="font-size:10px;color:var(--text-secondary)">+${dayAppts.length-2} more</div>`:''}
    </div>`;
  }
  html += `</div>`;
  document.getElementById('calendarBody').innerHTML = html;
};

const prevMonth = () => { calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCalendar(); };
const nextMonth = () => { calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCalendar(); };
const goToToday = () => { const d=new Date(); calYear=d.getFullYear(); calMonth=d.getMonth(); renderCalendar(); };

const filterByDate = (dateStr) => {
  switchView('list');
  const el = document.getElementById('filterDate');
  if (el) { el.value=dateStr; renderAppointments(); }
};

// Modal
const openAddApptModal = () => {
  document.getElementById('apptModalTitle').innerHTML = '<i class="fas fa-calendar-plus"></i> New Appointment';
  document.getElementById('apptForm').reset();
  document.getElementById('apptId').value = '';
  document.getElementById('apptDate').value = today();
  populateDropdowns();
  Modal.open('apptModal');
};

const editAppointment = (id) => {
  const a = allAppointments.find(a => a.id===id);
  if (!a) return;
  document.getElementById('apptModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Appointment';
  populateDropdowns();
  setTimeout(() => {
    document.getElementById('apptId').value = a.id;
    document.getElementById('apptPatient').value = a.patientName;
    document.getElementById('apptDoctor').value = a.doctorName;
    document.getElementById('apptDate').value = a.date;
    document.getElementById('apptTime').value = a.time;
    document.getElementById('apptType').value = a.type;
    document.getElementById('apptStatus').value = a.status;
    document.getElementById('apptNotes').value = a.notes || '';
  }, 50);
  Modal.open('apptModal');
};

const saveAppointment = () => {
  const id = document.getElementById('apptId').value;
  const patientEl = document.getElementById('apptPatient');
  const doctorEl = document.getElementById('apptDoctor');
  const patientName = patientEl.value;
  const doctorName = doctorEl.value;
  const date = document.getElementById('apptDate').value;
  const time = document.getElementById('apptTime').value;

  if (!patientName || !doctorName || !date || !time) { Toast.error('Validation Error', 'Fill in all required fields.'); return; }

  const data = {
    patientName, doctorName,
    patientId: patientEl.selectedOptions[0]?.dataset.id || '',
    doctorId: doctorEl.selectedOptions[0]?.dataset.id || '',
    date, time,
    type: document.getElementById('apptType').value,
    status: document.getElementById('apptStatus').value,
    notes: document.getElementById('apptNotes').value.trim(),
    createdAt: new Date().toISOString()
  };

  if (id) {
    const idx = allAppointments.findIndex(a => a.id===id);
    if (idx>-1) { allAppointments[idx]={...allAppointments[idx],...data}; Toast.success('Updated!','Appointment updated.'); }
  } else {
    data.id = generateId('APT', allAppointments);
    allAppointments.unshift(data);
    Toast.success('Scheduled!', `Appointment for ${patientName} booked.`);
  }

  saveAppointments();
  Modal.close('apptModal');
  renderAppointments();
  renderApptStats();
};

const markComplete = (id) => {
  const idx = allAppointments.findIndex(a => a.id===id);
  if (idx>-1 && allAppointments[idx].status==='Scheduled') {
    allAppointments[idx].status = 'Completed';
    saveAppointments();
    renderAppointments();
    renderApptStats();
    Toast.success('Completed!', 'Appointment marked as completed.');
  }
};

const deleteAppointment = (id) => {
  const a = allAppointments.find(a => a.id===id);
  if (!a) return;
  Confirm.show('Delete Appointment?', `Remove appointment for ${a.patientName}?`, () => {
    allAppointments = allAppointments.filter(a => a.id!==id);
    saveAppointments();
    renderAppointments();
    renderApptStats();
    Toast.success('Deleted!', 'Appointment removed.');
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  loadAppointments();
  const d = new Date();
  calYear = d.getFullYear(); calMonth = d.getMonth();
  renderAppointments();
  renderApptStats();
});
