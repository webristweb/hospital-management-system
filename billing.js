/* =============================================
   City Care Hospital - Billing JS
   ============================================= */

'use strict';

let allInvoices = [];
let sortKey = 'date';
let sortDir = 'desc';
let currentPage = 1;
const PER_PAGE = 8;

const loadInvoices = () => { allInvoices = Storage.get('hms_invoices') || []; };
const saveInvoices = () => { Storage.set('hms_invoices', allInvoices); };

const calcSubTotal = () => {
  const consult = parseFloat(document.getElementById('billConsult')?.value) || 0;
  const med = parseFloat(document.getElementById('billMedicine')?.value) || 0;
  const room = parseFloat(document.getElementById('billRoom')?.value) || 0;
  const lab = parseFloat(document.getElementById('billLab')?.value) || 0;
  const other = parseFloat(document.getElementById('billOther')?.value) || 0;
  return consult + med + room + lab + other;
};

const calcTotal = () => {
  const sub = calcSubTotal();
  const discount = parseFloat(document.getElementById('billDiscount')?.value) || 0;
  const afterDisc = Math.max(0, sub - discount);
  const gst = Math.round(afterDisc * 0.18);
  const grand = afterDisc + gst;
  if (document.getElementById('sumSubTotal')) document.getElementById('sumSubTotal').textContent = `₹${formatNumber(sub)}`;
  if (document.getElementById('sumDiscount')) document.getElementById('sumDiscount').textContent = `-₹${formatNumber(discount)}`;
  if (document.getElementById('sumGst')) document.getElementById('sumGst').textContent = `₹${formatNumber(gst)}`;
  if (document.getElementById('sumTotal')) document.getElementById('sumTotal').textContent = `₹${formatNumber(grand)}`;
  return { sub, discount, gst, grand };
};

const renderBillStats = () => {
  const container = document.getElementById('billStats');
  if (!container) return;
  const paid = allInvoices.filter(i => i.status==='Paid').length;
  const pending = allInvoices.filter(i => i.status==='Pending').length;
  const partial = allInvoices.filter(i => i.status==='Partial').length;
  const totalRevenue = allInvoices.filter(i => i.status==='Paid').reduce((s,i) => {
    const sub = i.consultFee + i.medicineFee + i.roomFee + i.labFee + (i.otherFee||0) - (i.discount||0);
    return s + sub + Math.round(sub * 0.18);
  }, 0);
  container.innerHTML = `
    <div class="stat-card stat-card-1"><div class="stat-icon"><i class="fas fa-file-invoice"></i></div><div class="stat-info"><h3>${allInvoices.length}</h3><p>Invoices</p></div></div>
    <div class="stat-card stat-card-2"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><h3>${paid}</h3><p>Paid</p></div></div>
    <div class="stat-card stat-card-3"><div class="stat-icon"><i class="fas fa-clock"></i></div><div class="stat-info"><h3>${pending}</h3><p>Pending</p></div></div>
    <div class="stat-card stat-card-4"><div class="stat-icon"><i class="fas fa-rupee-sign"></i></div><div class="stat-info"><h3>₹${formatNumber(totalRevenue)}</h3><p>Collected</p></div></div>`;
};

const renderInvoices = () => {
  const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const filterSt = document.getElementById('filterStatus')?.value || '';

  let filtered = allInvoices.filter(i => {
    const mq = !query || ['patientName','id','doctorName'].some(f => String(i[f]||'').toLowerCase().includes(query));
    const ms = !filterSt || i.status===filterSt;
    return mq && ms;
  });

  filtered = sortTable(filtered, sortKey, sortDir);
  const { items, total, totalPages, page } = paginate(filtered, currentPage, PER_PAGE);

  const countEl = document.getElementById('billCount');
  if (countEl) countEl.textContent = `${filtered.length} of ${allInvoices.length} invoices`;

  const tbody = document.getElementById('billTableBody');
  if (!tbody) return;

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><i class="fas fa-file-invoice"></i><h3>No invoices found</h3><p>Generate a new invoice to get started</p></div></td></tr>`;
  } else {
    tbody.innerHTML = items.map(inv => {
      const sub = inv.consultFee + inv.medicineFee + inv.roomFee + inv.labFee + (inv.otherFee||0) - (inv.discount||0);
      const gst = Math.round(sub * 0.18);
      const grand = sub + gst;
      return `<tr>
        <td><span class="badge badge-primary" style="font-size:11px">${inv.id}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="table-avatar" style="background:${getAvatarColor(inv.patientName)}">${getInitials(inv.patientName)}</div>
            <div class="table-name">${inv.patientName}</div>
          </div>
        </td>
        <td><span style="font-size:12px">${inv.doctorName||'—'}</span></td>
        <td>
          <div style="font-size:11px;color:var(--text-secondary)">
            ${inv.consultFee?`<span>Consult: ₹${inv.consultFee}</span><br>`:''}
            ${inv.medicineFee?`<span>Medicine: ₹${inv.medicineFee}</span><br>`:''}
            ${inv.roomFee?`<span>Room: ₹${inv.roomFee}</span>`:''}
          </div>
        </td>
        <td>${formatDate(inv.date)}</td>
        <td><strong>₹${formatNumber(sub)}</strong></td>
        <td style="color:var(--text-secondary)">₹${formatNumber(gst)}</td>
        <td><strong style="color:var(--primary);font-size:15px">₹${formatNumber(grand)}</strong></td>
        <td><span class="badge badge-secondary">${inv.paymentMethod||'—'}</span></td>
        <td>${getStatusBadge(inv.status)}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="action-btn action-btn-view" title="View & Print" onclick="viewInvoice('${inv.id}')"><i class="fas fa-eye"></i></button>
            <button class="action-btn action-btn-print" title="Print" onclick="printInvoice('${inv.id}')"><i class="fas fa-print"></i></button>
            <button class="action-btn action-btn-edit" title="Edit" onclick="editInvoice('${inv.id}')"><i class="fas fa-edit"></i></button>
            <button class="action-btn action-btn-delete" title="Delete" onclick="deleteInvoice('${inv.id}')"><i class="fas fa-trash"></i></button>
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
      mobileList.innerHTML = `<div class="empty-state"><i class="fas fa-file-invoice"></i><h3>No invoices found</h3><p>Generate a new invoice to get started</p></div>`;
    } else {
      const statusMap = { 'Paid': 'badge-success', 'Pending': 'badge-warning', 'Partial': 'badge-info' };
      mobileList.innerHTML = items.map(inv => {
        const sub = inv.consultFee + inv.medicineFee + inv.roomFee + inv.labFee + (inv.otherFee||0) - (inv.discount||0);
        const gst = Math.round(sub * 0.18);
        const total = sub + gst;
        const patColor = getAvatarColor(inv.patientName);
        return `<div class="mobile-card">
          <div class="mobile-card-header">
            <div class="mobile-card-avatar" style="background:${patColor}">${getInitials(inv.patientName)}</div>
            <div class="mobile-card-title"><h4>${inv.patientName}</h4><p>${inv.id}</p></div>
            <span class="badge ${statusMap[inv.status] || 'badge-secondary'}">${inv.status}</span>
          </div>
          <div class="mobile-card-body">
            <div class="mobile-card-field"><span class="mobile-card-field-label">Doctor</span><span class="mobile-card-field-value" style="font-size:12px">${inv.doctorName || '—'}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Date</span><span class="mobile-card-field-value">${formatDate(inv.date)}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Sub Total</span><span class="mobile-card-field-value">₹${formatNumber(sub)}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Grand Total</span><span class="mobile-card-field-value" style="color:var(--primary);font-weight:700">₹${formatNumber(total)}</span></div>
          </div>
          <div class="mobile-card-actions">
            <button class="btn btn-warning btn-sm" onclick="viewInvoice('${inv.id}')"><i class="fas fa-eye"></i> View</button>
            <button class="btn btn-outline btn-sm" onclick="editInvoice('${inv.id}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteInvoice('${inv.id}')"><i class="fas fa-trash"></i></button>
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

const changePage = (p) => { currentPage=p; renderInvoices(); };
const sortBy = (k) => { if(sortKey===k) sortDir=sortDir==='asc'?'desc':'asc'; else{sortKey=k;sortDir='asc';} renderInvoices(); };
const clearFilters = () => { ['searchInput','filterStatus'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';}); currentPage=1; renderInvoices(); };

// Populate patient dropdown
const populatePatients = () => {
  const patients = Storage.get('hms_patients') || [];
  const sel = document.getElementById('billPatient');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select Patient</option>' + patients.map(p => `<option value="${p.name}" data-doctor="${p.doctor}" data-id="${p.id}">${p.name} (${p.id})</option>`).join('');
};

const autoFillDoctor = () => {
  const sel = document.getElementById('billPatient');
  const docInput = document.getElementById('billDoctor');
  if (!sel || !docInput) return;
  const opt = sel.selectedOptions[0];
  docInput.value = opt?.dataset.doctor || '';
};

const openAddBillModal = () => {
  document.getElementById('billModalTitle').innerHTML = '<i class="fas fa-file-invoice"></i> Generate Invoice';
  document.getElementById('billForm').reset();
  document.getElementById('billId').value = '';
  document.getElementById('billDate').value = today();
  ['billConsult','billMedicine','billRoom','billLab','billOther','billDiscount'].forEach(id => { const e=document.getElementById(id); if(e) e.value=0; });
  calcTotal();
  populatePatients();
  Modal.open('billModal');
};

const editInvoice = (id) => {
  const inv = allInvoices.find(i => i.id===id);
  if (!inv) return;
  document.getElementById('billModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Invoice';
  populatePatients();
  setTimeout(() => {
    document.getElementById('billId').value = inv.id;
    document.getElementById('billPatient').value = inv.patientName;
    document.getElementById('billDoctor').value = inv.doctorName||'';
    document.getElementById('billDate').value = inv.date;
    document.getElementById('billConsult').value = inv.consultFee||0;
    document.getElementById('billMedicine').value = inv.medicineFee||0;
    document.getElementById('billRoom').value = inv.roomFee||0;
    document.getElementById('billLab').value = inv.labFee||0;
    document.getElementById('billOther').value = inv.otherFee||0;
    document.getElementById('billDiscount').value = inv.discount||0;
    document.getElementById('billStatus').value = inv.status;
    document.getElementById('billPayMethod').value = inv.paymentMethod||'Cash';
    calcTotal();
  }, 50);
  Modal.open('billModal');
};

const saveInvoice = () => {
  const id = document.getElementById('billId').value;
  const patientEl = document.getElementById('billPatient');
  const patientName = patientEl.value;
  const date = document.getElementById('billDate').value;

  if (!patientName || !date) { Toast.error('Validation Error','Select patient and date.'); return; }

  const totals = calcTotal();
  const data = {
    patientName,
    patientId: patientEl.selectedOptions[0]?.dataset.id || '',
    doctorName: document.getElementById('billDoctor').value,
    date,
    consultFee: parseFloat(document.getElementById('billConsult').value)||0,
    medicineFee: parseFloat(document.getElementById('billMedicine').value)||0,
    roomFee: parseFloat(document.getElementById('billRoom').value)||0,
    labFee: parseFloat(document.getElementById('billLab').value)||0,
    otherFee: parseFloat(document.getElementById('billOther').value)||0,
    discount: parseFloat(document.getElementById('billDiscount').value)||0,
    status: document.getElementById('billStatus').value,
    paymentMethod: document.getElementById('billPayMethod').value,
    gst: totals.gst,
    grandTotal: totals.grand
  };

  if (id) {
    const idx = allInvoices.findIndex(i => i.id===id);
    if (idx>-1) { allInvoices[idx]={...allInvoices[idx],...data}; Toast.success('Updated!','Invoice updated.'); }
  } else {
    data.id = generateId('INV', allInvoices);
    allInvoices.unshift(data);
    Toast.success('Invoice Generated!', `Invoice ${data.id} created for ${patientName}.`);
  }

  saveInvoices();
  Modal.close('billModal');
  renderInvoices();
  renderBillStats();
};

const generateInvoiceHTML = (inv) => {
  const sub = inv.consultFee + inv.medicineFee + inv.roomFee + inv.labFee + (inv.otherFee||0) - (inv.discount||0);
  const gst = Math.round(sub * 0.18);
  const grand = sub + gst;
  const services = [
    { label:'Consultation Fee', amount: inv.consultFee },
    { label:'Medicine Charges', amount: inv.medicineFee },
    { label:'Room / Bed Charges', amount: inv.roomFee },
    { label:'Lab / Test Charges', amount: inv.labFee },
    { label:'Other Charges', amount: inv.otherFee||0 }
  ].filter(s => s.amount > 0);
  const statusColors = { Paid:'#00c853', Pending:'#ffab00', Partial:'#2196f3' };

  return `
  <div style="font-family:'Poppins',sans-serif">
    <!-- Invoice Header -->
    <div style="background:linear-gradient(135deg,#0d47a1,#1a73e8);padding:28px;border-radius:12px 12px 0 0;color:white;display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <div style="width:44px;height:44px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px">🏥</div>
          <div><h1 style="font-size:22px;font-weight:800;margin:0">City Care Hospital</h1><p style="font-size:11px;opacity:0.8;margin:0">Excellence in Healthcare</p></div>
        </div>
        <p style="font-size:11px;opacity:0.8;margin:0">123 Medical Street, Health City, IN - 400001</p>
        <p style="font-size:11px;opacity:0.8;margin:0">📞 +91-22-12345678 | ✉ info@citycare.hospital</p>
      </div>
      <div style="text-align:right">
        <div style="font-size:24px;font-weight:700;letter-spacing:1px">INVOICE</div>
        <div style="font-size:16px;font-weight:600;opacity:0.9">${inv.id}</div>
        <div style="font-size:12px;opacity:0.8">Date: ${formatDate(inv.date)}</div>
        <div style="margin-top:8px;padding:4px 12px;background:${statusColors[inv.status]||'#fff'};border-radius:20px;font-size:12px;font-weight:700;color:${inv.status==='Paid'?'#fff':inv.status==='Pending'?'#000':'#fff'};display:inline-block">${inv.status}</div>
      </div>
    </div>

    <!-- Patient Info -->
    <div style="padding:20px 28px;border-bottom:1px solid #e0e0e0;display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div>
        <div style="font-size:11px;font-weight:600;color:#9e9e9e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Bill To</div>
        <div style="font-size:16px;font-weight:700;color:#1a1a2e">${inv.patientName}</div>
        <div style="font-size:12px;color:#5a6a7e">Patient ID: ${inv.patientId||'—'}</div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:600;color:#9e9e9e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Attending Physician</div>
        <div style="font-size:14px;font-weight:600;color:#1a1a2e">${inv.doctorName||'—'}</div>
        <div style="font-size:12px;color:#5a6a7e">Payment: ${inv.paymentMethod||'—'}</div>
      </div>
    </div>

    <!-- Services Table -->
    <div style="padding:20px 28px">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#e3f2fd">
            <th style="padding:10px 14px;font-size:12px;font-weight:600;color:#0d47a1;text-align:left">#</th>
            <th style="padding:10px 14px;font-size:12px;font-weight:600;color:#0d47a1;text-align:left">Service Description</th>
            <th style="padding:10px 14px;font-size:12px;font-weight:600;color:#0d47a1;text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${services.map((s,i)=>`
          <tr style="border-bottom:1px solid #f5f5f5">
            <td style="padding:12px 14px;font-size:13px;color:#9e9e9e">${i+1}</td>
            <td style="padding:12px 14px;font-size:13px;font-weight:500">${s.label}</td>
            <td style="padding:12px 14px;font-size:13px;text-align:right">₹${formatNumber(s.amount)}</td>
          </tr>`).join('')}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="display:flex;justify-content:flex-end;margin-top:16px">
        <div style="width:280px">
          ${inv.discount>0?`<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #f5f5f5"><span>Discount</span><span style="color:#00c853;font-weight:600">-₹${formatNumber(inv.discount)}</span></div>`:''}
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #f5f5f5"><span>Sub Total</span><span style="font-weight:600">₹${formatNumber(sub)}</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #e0e0e0"><span>GST (18%)</span><span style="font-weight:600">₹${formatNumber(gst)}</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0 0;font-size:18px;font-weight:700;color:#1a73e8;border-top:2px solid #1a73e8"><span>Grand Total</span><span>₹${formatNumber(grand)}</span></div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8faff;padding:16px 28px;border-top:1px solid #e0e0e0;border-radius:0 0 12px 12px;text-align:center">
      <p style="font-size:12px;color:#9e9e9e;margin:0">Thank you for choosing City Care Hospital. For queries, contact: billing@citycare.hospital</p>
      <p style="font-size:11px;color:#bdbdbd;margin:4px 0 0">This is a computer-generated invoice and does not require a physical signature.</p>
    </div>
  </div>`;
};

const viewInvoice = (id) => {
  const inv = allInvoices.find(i => i.id===id);
  if (!inv) return;
  document.getElementById('invoicePrintArea').innerHTML = generateInvoiceHTML(inv);
  Modal.open('viewBillModal');
};

const printInvoice = (id) => {
  const inv = allInvoices.find(i => i.id===id);
  if (!inv) return;
  document.getElementById('invoicePrintArea').innerHTML = generateInvoiceHTML(inv);
  Modal.open('viewBillModal');
  setTimeout(() => window.print(), 300);
};

const deleteInvoice = (id) => {
  const inv = allInvoices.find(i => i.id===id);
  if (!inv) return;
  Confirm.show('Delete Invoice?', `Delete invoice ${inv.id} for ${inv.patientName}?`, () => {
    allInvoices = allInvoices.filter(i => i.id!==id);
    saveInvoices();
    renderInvoices();
    renderBillStats();
    Toast.success('Deleted!', 'Invoice removed.');
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  loadInvoices();
  renderInvoices();
  renderBillStats();
});
