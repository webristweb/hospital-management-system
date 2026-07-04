/* =============================================
   City Care Hospital - Pharmacy JS
   ============================================= */

'use strict';

let allMedicines = [];
let sortKey = 'name';
let sortDir = 'asc';
let currentPage = 1;
const PER_PAGE = 8;

const loadMedicines = () => { allMedicines = Storage.get('hms_medicines') || []; };
const saveMedicines = () => { Storage.set('hms_medicines', allMedicines); };

const autoStatus = (stock) => {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= 10) return 'Low Stock';
  return 'Available';
};

const renderMedStats = () => {
  const container = document.getElementById('medStats');
  if (!container) return;
  const available = allMedicines.filter(m => m.status==='Available').length;
  const lowStock = allMedicines.filter(m => m.status==='Low Stock').length;
  const outStock = allMedicines.filter(m => m.status==='Out of Stock').length;
  const totalVal = allMedicines.reduce((s,m) => s + (m.stock * m.price), 0);

  // Update notification badge
  const badge = document.getElementById('lowStockBadge');
  if (badge) badge.textContent = lowStock + outStock;

  // Low stock alert
  const alert = document.getElementById('lowStockAlert');
  if (alert) {
    const alerts = allMedicines.filter(m => m.status==='Low Stock' || m.status==='Out of Stock');
    if (alerts.length > 0) {
      alert.style.display = '';
      alert.innerHTML = `<div style="background:#fff8e1;border:1px solid #ffe082;border-radius:12px;padding:16px 20px;display:flex;align-items:flex-start;gap:12px">
        <i class="fas fa-exclamation-triangle" style="color:#ff6f00;font-size:20px;margin-top:2px;flex-shrink:0"></i>
        <div>
          <div style="font-weight:700;color:#e65100;margin-bottom:6px">⚠️ Stock Alert — ${alerts.length} item(s) need attention</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${alerts.map(m=>`<span class="badge ${m.status==='Out of Stock'?'badge-danger':'badge-warning'}">${m.name} — ${m.status}</span>`).join('')}
          </div>
        </div>
      </div>`;
    } else { alert.style.display = 'none'; }
  }

  container.innerHTML = `
    <div class="stat-card stat-card-1"><div class="stat-icon"><i class="fas fa-pills"></i></div><div class="stat-info"><h3>${allMedicines.length}</h3><p>Medicines</p></div></div>
    <div class="stat-card stat-card-2"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><h3>${available}</h3><p>Available</p></div></div>
    <div class="stat-card stat-card-3"><div class="stat-icon"><i class="fas fa-exclamation-circle"></i></div><div class="stat-info"><h3>${lowStock}</h3><p>Low Stock</p></div></div>
    <div class="stat-card" style="border-top:4px solid var(--danger)"><div class="stat-icon" style="background:linear-gradient(135deg,#f44336,#b71c1c)"><i class="fas fa-times-circle"></i></div><div class="stat-info"><h3>${outStock}</h3><p>Out of Stock</p></div></div>`;
};

const renderMedicines = () => {
  const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const filterCat = document.getElementById('filterCategory')?.value || '';
  const filterSt = document.getElementById('filterStatus')?.value || '';

  let filtered = allMedicines.filter(m => {
    const mq = !query || ['name','category','manufacturer','id'].some(f => String(m[f]||'').toLowerCase().includes(query));
    const mc = !filterCat || m.category===filterCat;
    const ms = !filterSt || m.status===filterSt;
    return mq && mc && ms;
  });

  filtered = sortTable(filtered, sortKey, sortDir);
  const { items, total, totalPages, page } = paginate(filtered, currentPage, PER_PAGE);

  const countEl = document.getElementById('medCount');
  if (countEl) countEl.textContent = `Showing ${filtered.length} of ${allMedicines.length} medicines`;

  const tbody = document.getElementById('medTableBody');
  if (!tbody) return;

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><i class="fas fa-pills"></i><h3>No medicines found</h3><p>Try adjusting your search</p></div></td></tr>`;
  } else {
    tbody.innerHTML = items.map(m => {
      const pct = Math.min(100, Math.round((m.stock / 300) * 100));
      const stockClass = m.status==='Available' ? 'stock-high' : m.status==='Low Stock' ? 'stock-medium' : 'stock-low';
      const isExpiringSoon = new Date(m.expiry) < new Date(Date.now() + 60*24*60*60*1000);
      return `<tr>
        <td><span class="badge badge-primary" style="font-size:11px">${m.id}</span></td>
        <td><div class="table-name">${m.name}</div></td>
        <td><span class="badge badge-purple">${m.category}</span></td>
        <td><strong>${m.stock}</strong> units</td>
        <td><strong>₹${m.price}</strong></td>
        <td><span style="font-size:12px">${m.manufacturer||'—'}</span></td>
        <td><span style="color:${isExpiringSoon?'var(--danger)':'var(--text-primary)'};font-size:12px;font-weight:${isExpiringSoon?600:400}">${formatDate(m.expiry)}${isExpiringSoon?' ⚠️':''}</span></td>
        <td>
          <div class="${stockClass}">
            <div style="font-size:11px;margin-bottom:3px">${pct}%</div>
            <div class="stock-bar"><div class="stock-bar-fill" style="width:${pct}%"></div></div>
          </div>
        </td>
        <td>${getStatusBadge(m.status)}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="action-btn action-btn-view" title="Restock" onclick="openRestockModal('${m.id}')"><i class="fas fa-plus-circle"></i></button>
            <button class="action-btn action-btn-edit" title="Edit" onclick="editMedicine('${m.id}')"><i class="fas fa-edit"></i></button>
            <button class="action-btn action-btn-delete" title="Delete" onclick="deleteMedicine('${m.id}')"><i class="fas fa-trash"></i></button>
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
      mobileList.innerHTML = `<div class="empty-state"><i class="fas fa-pills"></i><h3>No medicines found</h3><p>Try adjusting your search</p></div>`;
    } else {
      const statusMap = { 'Available': 'badge-success', 'Low Stock': 'badge-warning', 'Out of Stock': 'badge-danger' };
      mobileList.innerHTML = items.map(m => {
        const pct = Math.min((m.stock / 300) * 100, 100);
        const barClass = m.status === 'Available' ? 'stock-high' : m.status === 'Low Stock' ? 'stock-medium' : 'stock-low';
        return `<div class="mobile-card">
          <div class="mobile-card-header">
            <div class="mobile-card-avatar" style="background:linear-gradient(135deg,#7c4dff,#4527a0)"><i class="fas fa-pills"></i></div>
            <div class="mobile-card-title"><h4>${m.name}</h4><p>${m.id} &bull; ${m.category}</p></div>
            <span class="badge ${statusMap[m.status] || 'badge-secondary'}">${m.status}</span>
          </div>
          <div class="mobile-card-body">
            <div class="mobile-card-field"><span class="mobile-card-field-label">Stock</span><span class="mobile-card-field-value">${m.stock} units</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Price</span><span class="mobile-card-field-value" style="color:var(--primary);font-weight:700">₹${m.price}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Manufacturer</span><span class="mobile-card-field-value" style="font-size:12px">${m.manufacturer || '—'}</span></div>
            <div class="mobile-card-field"><span class="mobile-card-field-label">Expiry</span><span class="mobile-card-field-value">${formatDate(m.expiry)}</span></div>
          </div>
          <div class="${barClass}" style="margin-bottom:12px">
            <div class="stock-bar"><div class="stock-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="mobile-card-actions">
            <button class="btn btn-success btn-sm" onclick="openRestockModal('${m.id}')"><i class="fas fa-plus"></i> Restock</button>
            <button class="btn btn-outline btn-sm" onclick="editMedicine('${m.id}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteMedicine('${m.id}')"><i class="fas fa-trash"></i></button>
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

const changePage = (p) => { currentPage=p; renderMedicines(); };
const sortBy = (k) => { if(sortKey===k) sortDir=sortDir==='asc'?'desc':'asc'; else{sortKey=k;sortDir='asc';} renderMedicines(); };
const clearFilters = () => { ['searchInput','filterCategory','filterStatus'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';}); currentPage=1; renderMedicines(); };

const openAddMedModal = () => {
  document.getElementById('medModalTitle').innerHTML = '<i class="fas fa-pills"></i> Add Medicine';
  document.getElementById('medForm').reset();
  document.getElementById('medId').value = '';
  Modal.open('medModal');
};

const editMedicine = (id) => {
  const m = allMedicines.find(m => m.id===id);
  if (!m) return;
  document.getElementById('medModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Medicine';
  setTimeout(() => {
    document.getElementById('medId').value = m.id;
    document.getElementById('medName').value = m.name;
    document.getElementById('medCategory').value = m.category;
    document.getElementById('medStock').value = m.stock;
    document.getElementById('medPrice').value = m.price;
    document.getElementById('medExpiry').value = m.expiry;
    document.getElementById('medManufacturer').value = m.manufacturer||'';
    document.getElementById('medStatus').value = m.status;
  }, 50);
  Modal.open('medModal');
};

const saveMedicine = () => {
  const id = document.getElementById('medId').value;
  const name = document.getElementById('medName').value.trim();
  const category = document.getElementById('medCategory').value;
  const stock = parseInt(document.getElementById('medStock').value);
  const price = parseFloat(document.getElementById('medPrice').value);
  const expiry = document.getElementById('medExpiry').value;

  if (!name || !category || isNaN(stock) || isNaN(price) || !expiry) { Toast.error('Validation Error', 'Fill in all required fields.'); return; }

  const computedStatus = autoStatus(stock);
  const data = { name, category, stock, price, expiry, manufacturer: document.getElementById('medManufacturer').value.trim(), status: computedStatus };

  if (id) {
    const idx = allMedicines.findIndex(m => m.id===id);
    if (idx>-1) { allMedicines[idx]={...allMedicines[idx],...data}; Toast.success('Updated!',`${name} updated.`); }
  } else {
    data.id = generateId('MED', allMedicines);
    allMedicines.unshift(data);
    Toast.success('Added!', `${name} added to inventory.`);
  }

  saveMedicines();
  Modal.close('medModal');
  renderMedicines();
  renderMedStats();
};

const openRestockModal = (id) => {
  const m = allMedicines.find(m => m.id===id);
  if (!m) return;
  document.getElementById('restockId').value = id;
  document.getElementById('restockName').textContent = `${m.name} (Current: ${m.stock} units)`;
  document.getElementById('restockQty').value = '';
  Modal.open('restockModal');
};

const doRestock = () => {
  const id = document.getElementById('restockId').value;
  const qty = parseInt(document.getElementById('restockQty').value);
  if (!qty || qty <= 0) { Toast.error('Invalid', 'Enter a valid quantity.'); return; }
  const idx = allMedicines.findIndex(m => m.id===id);
  if (idx > -1) {
    allMedicines[idx].stock += qty;
    allMedicines[idx].status = autoStatus(allMedicines[idx].stock);
    saveMedicines();
    Modal.close('restockModal');
    renderMedicines();
    renderMedStats();
    Toast.success('Restocked!', `Added ${qty} units.`);
  }
};

const deleteMedicine = (id) => {
  const m = allMedicines.find(m => m.id===id);
  if (!m) return;
  Confirm.show('Delete Medicine?', `Remove ${m.name} from inventory?`, () => {
    allMedicines = allMedicines.filter(m => m.id!==id);
    saveMedicines();
    renderMedicines();
    renderMedStats();
    Toast.success('Deleted!', 'Medicine removed from inventory.');
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  loadMedicines();
  renderMedicines();
  renderMedStats();
});
