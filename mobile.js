/* =============================================
   City Care Hospital - Mobile JS
   Bottom Nav, Card Views, Touch Interactions
   ============================================= */

'use strict';

/* ============ Bottom Nav & More Drawer ============ */
const initBottomNav = () => {
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const moreDrawer = document.querySelector('.more-drawer');

  if (!drawerOverlay || !moreDrawer) return;

  drawerOverlay.addEventListener('click', () => {
    moreDrawer.classList.remove('show');
    drawerOverlay.classList.remove('show');
  });
};

const toggleMoreDrawer = () => {
  const moreDrawer = document.querySelector('.more-drawer');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  if (!moreDrawer) return;
  const isOpen = moreDrawer.classList.contains('show');
  moreDrawer.classList.toggle('show', !isOpen);
  drawerOverlay && drawerOverlay.classList.toggle('show', !isOpen);
};

/* ============ Mobile Card Renderer ============ */
// Converts table data into card-based list for mobile

const renderMobileCards = (containerId, cards) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!cards || cards.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>No records found</h3>
        <p>Try adjusting your filters</p>
      </div>`;
    return;
  }
  container.innerHTML = cards.map(c => c).join('');
};

/* ============ Patient Mobile Card ============ */
const buildPatientCard = (p) => {
  const color = getAvatarColor(p.name);
  const statusMap = { 'Active': 'badge-success', 'Discharged': 'badge-secondary', 'Critical': 'badge-danger' };
  return `
    <div class="mobile-card">
      <div class="mobile-card-header">
        <div class="mobile-card-avatar" style="background:${color}">${getInitials(p.name)}</div>
        <div class="mobile-card-title">
          <h4>${p.name}</h4>
          <p>${p.id} &bull; ${p.disease}</p>
        </div>
        <div class="mobile-card-badge">
          <span class="badge ${statusMap[p.status] || 'badge-secondary'}">${p.status}</span>
        </div>
      </div>
      <div class="mobile-card-body">
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Age / Gender</span>
          <span class="mobile-card-field-value">${p.age} yrs / ${p.gender}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Blood Group</span>
          <span class="mobile-card-field-value"><span class="badge badge-danger">${p.blood}</span></span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Phone</span>
          <span class="mobile-card-field-value">${p.phone}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Doctor</span>
          <span class="mobile-card-field-value" style="font-size:12px">${p.doctor}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Admit Date</span>
          <span class="mobile-card-field-value">${formatDate(p.admitDate)}</span>
        </div>
      </div>
      <div class="mobile-card-actions">
        <button class="btn btn-light btn-sm" onclick="viewPatient('${p.id}')"><i class="fas fa-eye"></i> View</button>
        <button class="btn btn-outline btn-sm" onclick="editPatient('${p.id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deletePatient('${p.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
};

/* ============ Doctor Mobile Card ============ */
const buildDoctorCard = (d) => {
  const color = getAvatarColor(d.name);
  const statusMap = { 'Available': 'badge-success', 'On Leave': 'badge-warning', 'Inactive': 'badge-secondary' };
  const specColors = {
    'Cardiology': '#f44336', 'Neurology': '#9c27b0', 'Orthopedics': '#ff9800',
    'Pediatrics': '#4caf50', 'Dermatology': '#e91e63', 'Endocrinology': '#00bcd4',
    'General Surgery': '#1a73e8', 'Pulmonology': '#607d8b', 'Oncology': '#ff5722'
  };
  const specColor = specColors[d.specialization] || '#1a73e8';
  return `
    <div class="mobile-card" style="--card-accent:${specColor}">
      <div class="mobile-card-header">
        <div class="mobile-card-avatar" style="background:${color}">${getInitials(d.name)}</div>
        <div class="mobile-card-title">
          <h4>${d.name}</h4>
          <p style="color:${specColor};font-weight:600">${d.specialization}</p>
        </div>
        <div class="mobile-card-badge">
          <span class="badge ${statusMap[d.status] || 'badge-secondary'}">${d.status}</span>
        </div>
      </div>
      <div class="mobile-card-body">
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Phone</span>
          <span class="mobile-card-field-value">${d.phone}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Experience</span>
          <span class="mobile-card-field-value">${d.experience || '-'}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Patients</span>
          <span class="mobile-card-field-value">${d.patients || 0}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Schedule</span>
          <span class="mobile-card-field-value" style="font-size:11px">${d.schedule || '-'}</span>
        </div>
      </div>
      <div class="mobile-card-actions">
        <button class="btn btn-outline btn-sm" onclick="editDoctor('${d.id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteDoctor('${d.id}')"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`;
};

/* ============ Appointment Mobile Card ============ */
const buildApptCard = (a) => {
  const typeColors = { 'OPD': 'badge-info', 'IPD': 'badge-success', 'Emergency': 'badge-danger' };
  const statusMap = { 'Scheduled': 'badge-info', 'Completed': 'badge-success', 'Cancelled': 'badge-danger' };
  const patColor = getAvatarColor(a.patientName);
  return `
    <div class="mobile-card">
      <div class="mobile-card-header">
        <div class="mobile-card-avatar" style="background:${patColor}">${getInitials(a.patientName)}</div>
        <div class="mobile-card-title">
          <h4>${a.patientName}</h4>
          <p>${a.id}</p>
        </div>
        <div class="mobile-card-badge">
          <span class="badge ${statusMap[a.status] || 'badge-secondary'}">${a.status}</span>
        </div>
      </div>
      <div class="mobile-card-body">
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Doctor</span>
          <span class="mobile-card-field-value" style="font-size:12px">${a.doctorName}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Type</span>
          <span class="mobile-card-field-value"><span class="badge ${typeColors[a.type] || 'badge-secondary'}">${a.type}</span></span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Date</span>
          <span class="mobile-card-field-value">${formatDate(a.date)}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Time</span>
          <span class="mobile-card-field-value"><i class="fas fa-clock" style="color:var(--primary);font-size:11px"></i> ${a.time}</span>
        </div>
      </div>
      ${a.notes ? `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;padding:8px;background:var(--light);border-radius:8px"><i class="fas fa-sticky-note"></i> ${a.notes}</div>` : ''}
      <div class="mobile-card-actions">
        <button class="btn btn-success btn-sm" onclick="markComplete('${a.id}')"><i class="fas fa-check"></i> Complete</button>
        <button class="btn btn-outline btn-sm" onclick="editAppt('${a.id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAppt('${a.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
};

/* ============ Medicine Mobile Card ============ */
const buildMedCard = (m) => {
  const statusMap = { 'Available': 'badge-success', 'Low Stock': 'badge-warning', 'Out of Stock': 'badge-danger' };
  const maxStock = 500;
  const pct = Math.min((m.stock / maxStock) * 100, 100);
  const barClass = m.stock === 0 ? 'stock-low' : m.stock < 20 ? 'stock-medium' : 'stock-high';
  return `
    <div class="mobile-card">
      <div class="mobile-card-header">
        <div class="mobile-card-avatar" style="background:linear-gradient(135deg,#7c4dff,#4527a0)">
          <i class="fas fa-pills"></i>
        </div>
        <div class="mobile-card-title">
          <h4>${m.name}</h4>
          <p>${m.id} &bull; ${m.category}</p>
        </div>
        <div class="mobile-card-badge">
          <span class="badge ${statusMap[m.status] || 'badge-secondary'}">${m.status}</span>
        </div>
      </div>
      <div class="mobile-card-body">
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Stock</span>
          <span class="mobile-card-field-value">${m.stock} units</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Price</span>
          <span class="mobile-card-field-value" style="color:var(--primary);font-weight:700">₹${m.price}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Manufacturer</span>
          <span class="mobile-card-field-value" style="font-size:12px">${m.manufacturer || '-'}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Expiry</span>
          <span class="mobile-card-field-value">${formatDate(m.expiry)}</span>
        </div>
      </div>
      <div class="${barClass}" style="margin-bottom:12px">
        <div class="stock-bar"><div class="stock-bar-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="mobile-card-actions">
        <button class="btn btn-success btn-sm" onclick="openRestockModal('${m.id}')"><i class="fas fa-plus"></i> Restock</button>
        <button class="btn btn-outline btn-sm" onclick="editMed('${m.id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMed('${m.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
};

/* ============ Invoice Mobile Card ============ */
const buildInvoiceCard = (inv) => {
  const sub = inv.consultFee + inv.medicineFee + inv.roomFee + inv.labFee + (inv.otherFee || 0) - (inv.discount || 0);
  const gst = Math.round(sub * 0.18);
  const total = sub + gst;
  const statusMap = { 'Paid': 'badge-success', 'Pending': 'badge-warning', 'Partial': 'badge-info' };
  const patColor = getAvatarColor(inv.patientName);
  return `
    <div class="mobile-card">
      <div class="mobile-card-header">
        <div class="mobile-card-avatar" style="background:${patColor}">${getInitials(inv.patientName)}</div>
        <div class="mobile-card-title">
          <h4>${inv.patientName}</h4>
          <p>${inv.id}</p>
        </div>
        <div class="mobile-card-badge">
          <span class="badge ${statusMap[inv.status] || 'badge-secondary'}">${inv.status}</span>
        </div>
      </div>
      <div class="mobile-card-body">
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Doctor</span>
          <span class="mobile-card-field-value" style="font-size:12px">${inv.doctorName}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Date</span>
          <span class="mobile-card-field-value">${formatDate(inv.date)}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Sub Total</span>
          <span class="mobile-card-field-value">₹${sub.toLocaleString('en-IN')}</span>
        </div>
        <div class="mobile-card-field">
          <span class="mobile-card-field-label">Grand Total</span>
          <span class="mobile-card-field-value" style="color:var(--primary);font-weight:700">₹${total.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div class="mobile-card-actions">
        <button class="btn btn-warning btn-sm" onclick="viewInvoice('${inv.id}')"><i class="fas fa-eye"></i> View</button>
        <button class="btn btn-outline btn-sm" onclick="editInvoice('${inv.id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteInvoice('${inv.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
};

/* ============ Mobile Detection ============ */
const isMobile = () => window.innerWidth <= 768;
const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 992;

/* ============ Handle Resize ============ */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Trigger re-render if needed
    if (typeof renderPatients === 'function') renderPatients();
    if (typeof renderDoctors === 'function') renderDoctors();
    if (typeof renderAppointments === 'function') renderAppointments();
    if (typeof renderMedicines === 'function') renderMedicines();
    if (typeof renderInvoices === 'function') renderInvoices();
  }, 250);
});

/* ============ Body scroll lock ============ */
const lockScroll = () => document.body.classList.add('sidebar-open');
const unlockScroll = () => document.body.classList.remove('sidebar-open');

/* ============ Override toggleSidebar for mobile ============ */
const _originalToggleSidebar = typeof toggleSidebar === 'function' ? toggleSidebar : null;

// Override to add body scroll lock
window.toggleSidebarMobile = () => {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (!sidebar) return;
  const isOpen = sidebar.classList.contains('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay && overlay.classList.toggle('show', !isOpen);
  !isOpen ? lockScroll() : unlockScroll();
};

/* ============ Init ============ */
document.addEventListener('DOMContentLoaded', () => {
  initBottomNav();

  // Override menu toggle to use mobile version
  document.querySelectorAll('[onclick="toggleSidebar()"]').forEach(btn => {
    btn.setAttribute('onclick', 'toggleSidebarMobile()');
  });

  // Sidebar overlay click closes sidebar
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) {
    // Remove any existing listeners by cloning
    const newOverlay = overlay.cloneNode(true);
    overlay.parentNode.replaceChild(newOverlay, overlay);
    newOverlay.addEventListener('click', () => {
      document.querySelector('.sidebar')?.classList.remove('open');
      newOverlay.classList.remove('show');
      unlockScroll();
    });
  }

  // Add swipe to close sidebar on mobile
  if (isMobile()) {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      const sidebar = document.querySelector('.sidebar');

      // Swipe left to close sidebar
      if (diff > 60 && sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        document.querySelector('.sidebar-overlay')?.classList.remove('show');
        unlockScroll();
      }

      // Swipe right from edge to open sidebar
      if (diff < -60 && touchStartX < 30 && sidebar && !sidebar.classList.contains('open')) {
        sidebar.classList.add('open');
        document.querySelector('.sidebar-overlay')?.classList.add('show');
        lockScroll();
      }
    }, { passive: true });
  }
});
