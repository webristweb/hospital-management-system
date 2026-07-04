/* =============================================
   City Care Hospital - Dashboard JS
   ============================================= */

'use strict';

// ============ Sample Data Initialization ============
const initSampleData = () => {
  if (!Storage.exists('hms_initialized')) {

    const patients = [
      { id: 'HMS-1001', name: 'Arjun Sharma', age: 45, gender: 'Male', blood: 'B+', phone: '9876543210', email: 'arjun.s@email.com', address: '12, MG Road, Delhi', disease: 'Hypertension', doctor: 'Dr. Priya Mehta', docId: 'DOC-1001', admitDate: '2024-11-15', status: 'Active', createdAt: new Date().toISOString() },
      { id: 'HMS-1002', name: 'Priya Patel', age: 32, gender: 'Female', blood: 'A+', phone: '9867543210', email: 'priya.p@email.com', address: '45, Park Street, Mumbai', disease: 'Diabetes Type 2', doctor: 'Dr. Rahul Verma', docId: 'DOC-1002', admitDate: '2024-11-18', status: 'Active', createdAt: new Date().toISOString() },
      { id: 'HMS-1003', name: 'Vikram Singh', age: 58, gender: 'Male', blood: 'O+', phone: '9812345678', email: 'vikram.s@email.com', address: '78, Lal Bagh, Bangalore', disease: 'Coronary Artery Disease', doctor: 'Dr. Priya Mehta', docId: 'DOC-1001', admitDate: '2024-11-10', status: 'Critical', createdAt: new Date().toISOString() },
      { id: 'HMS-1004', name: 'Sunita Desai', age: 27, gender: 'Female', blood: 'AB+', phone: '9898765432', email: 'sunita.d@email.com', address: '23, Civil Lines, Pune', disease: 'Appendicitis', doctor: 'Dr. Kavitha Rao', docId: 'DOC-1003', admitDate: '2024-11-20', status: 'Active', createdAt: new Date().toISOString() },
      { id: 'HMS-1005', name: 'Rajesh Kumar', age: 50, gender: 'Male', blood: 'A-', phone: '9765432109', email: 'rajesh.k@email.com', address: '56, Salt Lake, Kolkata', disease: 'Pneumonia', doctor: 'Dr. Anil Joshi', docId: 'DOC-1004', admitDate: '2024-11-05', status: 'Discharged', createdAt: new Date().toISOString() },
      { id: 'HMS-1006', name: 'Meena Iyer', age: 38, gender: 'Female', blood: 'O-', phone: '9654321098', email: 'meena.i@email.com', address: '34, Anna Nagar, Chennai', disease: 'Migraine', doctor: 'Dr. Suresh Nair', docId: 'DOC-1005', admitDate: '2024-11-22', status: 'Active', createdAt: new Date().toISOString() },
      { id: 'HMS-1007', name: 'Amit Gupta', age: 63, gender: 'Male', blood: 'B-', phone: '9543210987', email: 'amit.g@email.com', address: '89, Gandhi Nagar, Jaipur', disease: 'Osteoarthritis', doctor: 'Dr. Deepa Krishnan', docId: 'DOC-1006', admitDate: '2024-11-12', status: 'Discharged', createdAt: new Date().toISOString() },
      { id: 'HMS-1008', name: 'Lakshmi Reddy', age: 41, gender: 'Female', blood: 'B+', phone: '9432109876', email: 'lakshmi.r@email.com', address: '67, Jubilee Hills, Hyderabad', disease: 'Thyroid Disorder', doctor: 'Dr. Rahul Verma', docId: 'DOC-1002', admitDate: '2024-11-25', status: 'Active', createdAt: new Date().toISOString() },
      { id: 'HMS-1009', name: 'Suresh Nambiar', age: 55, gender: 'Male', blood: 'A+', phone: '9321098765', email: 'suresh.n@email.com', address: '12, Marine Drive, Kochi', disease: 'Liver Cirrhosis', doctor: 'Dr. Anil Joshi', docId: 'DOC-1004', admitDate: '2024-11-08', status: 'Critical', createdAt: new Date().toISOString() },
      { id: 'HMS-1010', name: 'Kavya Menon', age: 22, gender: 'Female', blood: 'O+', phone: '9210987654', email: 'kavya.m@email.com', address: '45, Besant Nagar, Chennai', disease: 'Anemia', doctor: 'Dr. Kavitha Rao', docId: 'DOC-1003', admitDate: '2024-11-28', status: 'Active', createdAt: new Date().toISOString() }
    ];

    const doctors = [
      { id: 'DOC-1001', name: 'Dr. Priya Mehta', specialization: 'Cardiology', phone: '9111111111', email: 'priya.mehta@citycare.com', schedule: 'Mon-Fri 09:00-17:00', experience: '15 years', status: 'Available', patients: 18, createdAt: new Date().toISOString() },
      { id: 'DOC-1002', name: 'Dr. Rahul Verma', specialization: 'Endocrinology', phone: '9222222222', email: 'rahul.verma@citycare.com', schedule: 'Mon-Sat 10:00-18:00', experience: '12 years', status: 'Available', patients: 15, createdAt: new Date().toISOString() },
      { id: 'DOC-1003', name: 'Dr. Kavitha Rao', specialization: 'General Surgery', phone: '9333333333', email: 'kavitha.rao@citycare.com', schedule: 'Tue-Sat 08:00-16:00', experience: '20 years', status: 'Available', patients: 12, createdAt: new Date().toISOString() },
      { id: 'DOC-1004', name: 'Dr. Anil Joshi', specialization: 'Pulmonology', phone: '9444444444', email: 'anil.joshi@citycare.com', schedule: 'Mon-Fri 09:00-17:00', experience: '18 years', status: 'On Leave', patients: 10, createdAt: new Date().toISOString() },
      { id: 'DOC-1005', name: 'Dr. Suresh Nair', specialization: 'Neurology', phone: '9555555555', email: 'suresh.nair@citycare.com', schedule: 'Mon-Thu 10:00-18:00', experience: '22 years', status: 'Available', patients: 20, createdAt: new Date().toISOString() },
      { id: 'DOC-1006', name: 'Dr. Deepa Krishnan', specialization: 'Orthopedics', phone: '9666666666', email: 'deepa.k@citycare.com', schedule: 'Wed-Sun 09:00-17:00', experience: '14 years', status: 'Available', patients: 14, createdAt: new Date().toISOString() },
      { id: 'DOC-1007', name: 'Dr. Manish Agarwal', specialization: 'Pediatrics', phone: '9777777777', email: 'manish.a@citycare.com', schedule: 'Mon-Fri 08:00-16:00', experience: '10 years', status: 'Available', patients: 25, createdAt: new Date().toISOString() },
      { id: 'DOC-1008', name: 'Dr. Rekha Pillai', specialization: 'Dermatology', phone: '9888888888', email: 'rekha.p@citycare.com', schedule: 'Tue-Sat 11:00-19:00', experience: '8 years', status: 'Available', patients: 30, createdAt: new Date().toISOString() }
    ];

    const appointments = [
      { id: 'APT-1001', patientId: 'HMS-1001', patientName: 'Arjun Sharma', doctorId: 'DOC-1001', doctorName: 'Dr. Priya Mehta', date: today(), time: '09:30', type: 'OPD', notes: 'Follow-up for hypertension', status: 'Scheduled', createdAt: new Date().toISOString() },
      { id: 'APT-1002', patientId: 'HMS-1002', patientName: 'Priya Patel', doctorId: 'DOC-1002', doctorName: 'Dr. Rahul Verma', date: today(), time: '10:00', type: 'OPD', notes: 'Regular diabetes check-up', status: 'Completed', createdAt: new Date().toISOString() },
      { id: 'APT-1003', patientId: 'HMS-1003', patientName: 'Vikram Singh', doctorId: 'DOC-1001', doctorName: 'Dr. Priya Mehta', date: today(), time: '11:30', type: 'IPD', notes: 'Post-op cardiology review', status: 'Scheduled', createdAt: new Date().toISOString() },
      { id: 'APT-1004', patientId: 'HMS-1004', patientName: 'Sunita Desai', doctorId: 'DOC-1003', doctorName: 'Dr. Kavitha Rao', date: today(), time: '14:00', type: 'OPD', notes: 'Pre-surgery consultation', status: 'Scheduled', createdAt: new Date().toISOString() },
      { id: 'APT-1005', patientId: 'HMS-1006', patientName: 'Meena Iyer', doctorId: 'DOC-1005', doctorName: 'Dr. Suresh Nair', date: today(), time: '15:30', type: 'OPD', notes: 'Neurological assessment for migraines', status: 'Scheduled', createdAt: new Date().toISOString() },
      { id: 'APT-1006', patientId: 'HMS-1009', patientName: 'Suresh Nambiar', doctorId: 'DOC-1004', doctorName: 'Dr. Anil Joshi', date: today(), time: '16:00', type: 'Emergency', notes: 'Urgent respiratory review', status: 'Cancelled', createdAt: new Date().toISOString() },
      { id: 'APT-1007', patientId: 'HMS-1007', patientName: 'Amit Gupta', doctorId: 'DOC-1006', doctorName: 'Dr. Deepa Krishnan', date: '2024-12-15', time: '10:30', type: 'OPD', notes: 'Physiotherapy follow-up', status: 'Scheduled', createdAt: new Date().toISOString() },
      { id: 'APT-1008', patientId: 'HMS-1008', patientName: 'Lakshmi Reddy', doctorId: 'DOC-1002', doctorName: 'Dr. Rahul Verma', date: '2024-12-16', time: '11:00', type: 'OPD', notes: 'Thyroid medication review', status: 'Scheduled', createdAt: new Date().toISOString() },
      { id: 'APT-1009', patientId: 'HMS-1010', patientName: 'Kavya Menon', doctorId: 'DOC-1003', doctorName: 'Dr. Kavitha Rao', date: '2024-12-17', time: '09:00', type: 'OPD', notes: 'Hemoglobin test review', status: 'Scheduled', createdAt: new Date().toISOString() },
      { id: 'APT-1010', patientId: 'HMS-1005', patientName: 'Rajesh Kumar', doctorId: 'DOC-1004', doctorName: 'Dr. Anil Joshi', date: '2024-12-18', time: '14:30', type: 'OPD', notes: 'Discharge follow-up', status: 'Scheduled', createdAt: new Date().toISOString() }
    ];

    const medicines = [
      { id: 'MED-1001', name: 'Metformin 500mg', category: 'Antidiabetic', stock: 250, price: 45, expiry: '2025-12-01', manufacturer: 'Sun Pharma', status: 'Available' },
      { id: 'MED-1002', name: 'Amlodipine 5mg', category: 'Antihypertensive', stock: 180, price: 32, expiry: '2025-08-15', manufacturer: 'Cipla', status: 'Available' },
      { id: 'MED-1003', name: 'Atorvastatin 10mg', category: 'Cardiovascular', stock: 12, price: 85, expiry: '2025-06-30', manufacturer: 'Ranbaxy', status: 'Low Stock' },
      { id: 'MED-1004', name: 'Pantoprazole 40mg', category: 'Antacid', stock: 320, price: 28, expiry: '2026-01-20', manufacturer: 'Dr. Reddy\'s', status: 'Available' },
      { id: 'MED-1005', name: 'Cetirizine 10mg', category: 'Antihistamine', stock: 0, price: 15, expiry: '2025-03-10', manufacturer: 'Alkem', status: 'Out of Stock' },
      { id: 'MED-1006', name: 'Paracetamol 650mg', category: 'Analgesic', stock: 500, price: 10, expiry: '2026-05-25', manufacturer: 'GSK', status: 'Available' },
      { id: 'MED-1007', name: 'Azithromycin 500mg', category: 'Antibiotic', stock: 8, price: 120, expiry: '2025-04-15', manufacturer: 'Abbott', status: 'Low Stock' },
      { id: 'MED-1008', name: 'Omeprazole 20mg', category: 'Antacid', stock: 145, price: 38, expiry: '2025-11-30', manufacturer: 'Pfizer', status: 'Available' },
      { id: 'MED-1009', name: 'Levothyroxine 50mcg', category: 'Thyroid', stock: 95, price: 55, expiry: '2025-09-20', manufacturer: 'Merck', status: 'Available' },
      { id: 'MED-1010', name: 'Aspirin 75mg', category: 'Antiplatelet', stock: 400, price: 18, expiry: '2026-03-15', manufacturer: 'Bayer', status: 'Available' },
      { id: 'MED-1011', name: 'Insulin Glargine', category: 'Antidiabetic', stock: 5, price: 850, expiry: '2025-02-28', manufacturer: 'Sanofi', status: 'Low Stock' },
      { id: 'MED-1012', name: 'Warfarin 5mg', category: 'Anticoagulant', stock: 60, price: 42, expiry: '2025-10-10', manufacturer: 'Cipla', status: 'Available' },
      { id: 'MED-1013', name: 'Salbutamol Inhaler', category: 'Bronchodilator', stock: 25, price: 165, expiry: '2025-07-20', manufacturer: 'GSK', status: 'Available' },
      { id: 'MED-1014', name: 'Clopidogrel 75mg', category: 'Cardiovascular', stock: 0, price: 95, expiry: '2025-01-15', manufacturer: 'Sun Pharma', status: 'Out of Stock' },
      { id: 'MED-1015', name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 200, price: 35, expiry: '2025-12-31', manufacturer: 'Ranbaxy', status: 'Available' }
    ];

    const invoices = [
      { id: 'INV-1001', patientId: 'HMS-1001', patientName: 'Arjun Sharma', doctorName: 'Dr. Priya Mehta', consultFee: 800, medicineFee: 450, roomFee: 3000, labFee: 1200, date: '2024-11-15', status: 'Paid', paymentMethod: 'Card' },
      { id: 'INV-1002', patientId: 'HMS-1002', patientName: 'Priya Patel', doctorName: 'Dr. Rahul Verma', consultFee: 600, medicineFee: 320, roomFee: 0, labFee: 800, date: '2024-11-18', status: 'Paid', paymentMethod: 'UPI' },
      { id: 'INV-1003', patientId: 'HMS-1003', patientName: 'Vikram Singh', doctorName: 'Dr. Priya Mehta', consultFee: 1200, medicineFee: 2800, roomFee: 8000, labFee: 3500, date: '2024-11-10', status: 'Partial', paymentMethod: 'Cash' },
      { id: 'INV-1004', patientId: 'HMS-1004', patientName: 'Sunita Desai', doctorName: 'Dr. Kavitha Rao', consultFee: 1000, medicineFee: 900, roomFee: 5000, labFee: 2000, date: '2024-11-20', status: 'Pending', paymentMethod: '-' },
      { id: 'INV-1005', patientId: 'HMS-1005', patientName: 'Rajesh Kumar', doctorName: 'Dr. Anil Joshi', consultFee: 700, medicineFee: 1100, roomFee: 4000, labFee: 1500, date: '2024-11-05', status: 'Paid', paymentMethod: 'Cash' }
    ];

    Storage.set('hms_patients', patients);
    Storage.set('hms_doctors', doctors);
    Storage.set('hms_appointments', appointments);
    Storage.set('hms_medicines', medicines);
    Storage.set('hms_invoices', invoices);
    Storage.set('hms_initialized', true);
  }
};

// ============ Counter Animation ============
const animateCounter = (el, target, prefix = '', suffix = '') => {
  const duration = 1800;
  const start = performance.now();
  const startVal = 0;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const current = Math.floor(easeOut(progress) * target);
    el.textContent = prefix + formatNumber(current) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + formatNumber(target) + suffix;
  };
  requestAnimationFrame(update);
};

// ============ Dashboard Stats ============
const loadDashboardStats = () => {
  const patients = Storage.get('hms_patients') || [];
  const doctors = Storage.get('hms_doctors') || [];
  const appointments = Storage.get('hms_appointments') || [];
  const invoices = Storage.get('hms_invoices') || [];
  const todayStr = today();
  const todayAppts = appointments.filter(a => a.date === todayStr).length;
  const totalRevenue = invoices.reduce((sum, inv) => {
    const sub = inv.consultFee + inv.medicineFee + inv.roomFee + inv.labFee;
    return sum + sub + Math.round(sub * 0.18);
  }, 0);

  const statPatients = document.getElementById('statPatients');
  const statDoctors = document.getElementById('statDoctors');
  const statAppointments = document.getElementById('statAppointments');
  const statRevenue = document.getElementById('statRevenue');

  if (statPatients) animateCounter(statPatients, patients.length || 1248);
  if (statDoctors) animateCounter(statDoctors, doctors.length || 89);
  if (statAppointments) animateCounter(statAppointments, todayAppts || 47);
  if (statRevenue) animateCounter(statRevenue, totalRevenue || 482500, '₹');
};

// ============ Recent Appointments Table ============
const loadRecentAppointments = () => {
  const appointments = (Storage.get('hms_appointments') || []).slice(0, 5);
  const tbody = document.getElementById('recentAppointments');
  if (!tbody) return;
  if (appointments.length === 0) { tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-calendar-alt"></i><p>No appointments found</p></div></td></tr>`; return; }
  tbody.innerHTML = appointments.map(a => `
    <tr>
      <td><span class="badge badge-primary">${a.id}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="table-avatar" style="background:${getAvatarColor(a.patientName)}">${getInitials(a.patientName)}</div>
          <div><div class="table-name">${a.patientName}</div></div>
        </div>
      </td>
      <td><div class="table-name">${a.doctorName}</div></td>
      <td>${formatDate(a.date)} <span class="time-badge"><i class="fas fa-clock"></i>${a.time}</span></td>
      <td><span class="badge appt-type-${a.type.toLowerCase()}">${a.type}</span></td>
      <td>${getStatusBadge(a.status)}</td>
    </tr>`).join('');
};

// ============ Recent Patients ============
const loadRecentPatients = () => {
  const patients = (Storage.get('hms_patients') || []).slice(0, 5);
  const container = document.getElementById('recentPatients');
  if (!container) return;
  if (patients.length === 0) { container.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><p>No patients found</p></div>`; return; }
  container.innerHTML = patients.map(p => `
    <div class="recent-item">
      <div class="recent-item-icon" style="background:${getAvatarColor(p.name)}20;color:${getAvatarColor(p.name)}">
        ${getInitials(p.name)}
      </div>
      <div class="recent-item-info">
        <h4>${p.name}</h4>
        <p>${p.disease} &bull; ${p.blood} &bull; ${p.age}yrs</p>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        ${getStatusBadge(p.status)}
        <span class="recent-item-time">${formatDate(p.admitDate)}</span>
      </div>
    </div>`).join('');
};

const getStatusBadge = (status) => {
  const map = { 'Active': 'success', 'Discharged': 'secondary', 'Critical': 'danger', 'Scheduled': 'info', 'Completed': 'success', 'Cancelled': 'danger', 'Paid': 'success', 'Pending': 'warning', 'Partial': 'info', 'Available': 'success', 'On Leave': 'warning', 'Inactive': 'secondary' };
  return `<span class="badge badge-${map[status] || 'secondary'}">${status}</span>`;
};

// ============ Charts ============
let deptChart, monthlyChart;

const loadCharts = () => {
  const patients = Storage.get('hms_patients') || [];
  const doctors = Storage.get('hms_doctors') || [];

  // Department distribution (based on doctor specializations)
  const deptCounts = {};
  doctors.forEach(d => { deptCounts[d.specialization] = (deptCounts[d.specialization] || 0) + (d.patients || 0); });

  const deptCtx = document.getElementById('deptChart');
  if (deptCtx) {
    if (deptChart) deptChart.destroy();
    deptChart = new Chart(deptCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(deptCounts),
        datasets: [{ data: Object.values(deptCounts), backgroundColor: ['#1a73e8','#00c853','#ffab00','#f44336','#00bcd4','#9c27b0','#ff5722','#607d8b'], borderWidth: 3, borderColor: '#ffffff', hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 11 }, padding: 12 } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} patients` } }
        },
        animation: { animateRotate: true, duration: 1200 }
      }
    });
  }

  // Monthly patient trends
  const months = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData = [95, 112, 98, 130, 145, 168, patients.length + 20];

  const monthCtx = document.getElementById('monthlyChart');
  if (monthCtx) {
    if (monthlyChart) monthlyChart.destroy();
    monthlyChart = new Chart(monthCtx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'New Patients',
          data: monthlyData,
          backgroundColor: 'rgba(26,115,232,0.8)',
          borderRadius: 6,
          borderSkipped: false
        }, {
          label: 'Discharged',
          data: monthlyData.map(v => Math.floor(v * 0.7)),
          backgroundColor: 'rgba(0,200,83,0.8)',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { family: 'Poppins', size: 11 } } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { family: 'Poppins', size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 11 } } }
        },
        animation: { duration: 1200 }
      }
    });
  }
};

// ============ Init ============
document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  loadDashboardStats();
  loadRecentAppointments();
  loadRecentPatients();
  setTimeout(loadCharts, 400);
});
