/* =============================================
   City Care Hospital Management System
   Utility Functions & LocalStorage Helpers
   ============================================= */

'use strict';

// ============ LocalStorage Helpers ============
const Storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(key) { localStorage.removeItem(key); },
  exists(key) { return localStorage.getItem(key) !== null; }
};

// ============ ID Generator ============
const generateId = (prefix, existing = []) => {
  const ids = existing.map(i => parseInt((i.id || '0').replace(/\D/g, '')) || 0);
  const max = ids.length ? Math.max(...ids) : 1000;
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
};

// ============ Date & Time Helpers ============
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const today = () => new Date().toISOString().split('T')[0];

const getRelativeTime = (dateStr) => {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

// ============ Currency Formatter ============
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// ============ Toast Notifications ============
const Toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(title, message = '', type = 'success', duration = 3500) {
    this.init();
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div>
      <div class="toast-content"><h4>${title}</h4>${message ? `<p>${message}</p>` : ''}</div>
      <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-leave');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  success(title, msg) { this.show(title, msg, 'success'); },
  error(title, msg) { this.show(title, msg, 'error'); },
  warning(title, msg) { this.show(title, msg, 'warning'); },
  info(title, msg) { this.show(title, msg, 'info'); }
};

// ============ Modal Manager ============
const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('show'); document.body.style.overflow = 'hidden'; }
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('show'); document.body.style.overflow = ''; }
  },
  closeAll() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
    document.body.style.overflow = '';
  }
};

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) Modal.closeAll();
});

// ============ Form Helpers ============
const getFormData = (formId) => {
  const form = document.getElementById(formId);
  if (!form) return {};
  const data = {};
  new FormData(form).forEach((v, k) => { data[k] = v; });
  return data;
};

const setFormData = (formId, data) => {
  const form = document.getElementById(formId);
  if (!form) return;
  Object.entries(data).forEach(([k, v]) => {
    const el = form.elements[k];
    if (el) el.value = v != null ? v : '';
  });
};

const resetForm = (formId) => {
  const form = document.getElementById(formId);
  if (form) form.reset();
};

const validateForm = (formId, rules) => {
  let valid = true;
  rules.forEach(({ field, message, test }) => {
    const el = document.getElementById(field);
    const errEl = document.getElementById(field + '_err');
    if (!el) return;
    const ok = test ? test(el.value) : el.value.trim() !== '';
    if (!ok) {
      valid = false;
      if (errEl) { errEl.textContent = message; errEl.classList.add('show'); }
      el.style.borderColor = 'var(--danger)';
    } else {
      if (errEl) errEl.classList.remove('show');
      el.style.borderColor = '';
    }
  });
  return valid;
};

// ============ Table Helpers ============
const sortTable = (data, key, dir) => {
  return [...data].sort((a, b) => {
    let av = a[key], bv = b[key];
    if (!isNaN(av) && !isNaN(bv)) { av = +av; bv = +bv; }
    else { av = String(av || '').toLowerCase(); bv = String(bv || '').toLowerCase(); }
    return dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });
};

const filterData = (data, query, fields) => {
  if (!query) return data;
  const q = query.toLowerCase();
  return data.filter(item => fields.some(f => String(item[f] || '').toLowerCase().includes(q)));
};

// ============ Avatar Helpers ============
const getInitials = (name) => {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const avatarColors = ['#1a73e8','#00897b','#e91e63','#9c27b0','#ff5722','#607d8b','#00bcd4','#f44336','#4caf50','#ff9800'];
const getAvatarColor = (name) => avatarColors[(name || '').charCodeAt(0) % avatarColors.length];

// ============ Loader ============
const showLoader = () => {
  const loader = document.getElementById('loaderOverlay');
  if (loader) loader.classList.remove('hidden');
};

const hideLoader = () => {
  const loader = document.getElementById('loaderOverlay');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 800);
    setTimeout(() => { if (loader.parentNode) loader.style.display = 'none'; }, 1400);
  }
};

// ============ Pagination ============
const paginate = (data, page, perPage) => {
  const total = data.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  return { items: data.slice(start, start + perPage), total, totalPages, page, perPage };
};

// ============ Confirm Dialog ============
const Confirm = {
  callback: null,
  show(title, message, cb) {
    this.callback = cb;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    Modal.open('confirmModal');
  },
  confirm() {
    Modal.close('confirmModal');
    if (this.callback) this.callback();
  },
  cancel() { Modal.close('confirmModal'); }
};

// ============ Date of week helper ============
const getDayName = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' });
};

// Update header date
const updateHeaderDate = () => {
  const el = document.querySelector('.header-date');
  if (el) {
    const d = new Date();
    el.textContent = d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
};

// Set active nav item based on current page
const setActiveNav = () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
};

// Toggle mobile sidebar
const toggleSidebar = () => {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
};

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  updateHeaderDate();
  hideLoader();
  // Sidebar overlay click
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) overlay.addEventListener('click', toggleSidebar);
  // Profile dropdown
  const profileBtn = document.querySelector('.profile-btn');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => dropdownMenu.classList.remove('show'));
  }
});
