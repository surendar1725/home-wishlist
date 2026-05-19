const SECTIONS = [
  { id: 'hall',       name: 'Hall',               icon: '🛋️' },
  { id: 'kitchen',    name: 'Kitchen',             icon: '🍳' },
  { id: 'bedroom',    name: 'Bedroom',             icon: '🛏️' },
  { id: 'bathroom',   name: 'Bathroom',            icon: '🚿' },
  { id: 'essentials', name: 'Basic Necessities',   icon: '🧺' },
];

let data = {};

function load() {
  try { data = JSON.parse(localStorage.getItem('wishlist') || '{}'); } catch (_) {}
  SECTIONS.forEach(s => { if (!data[s.id]) data[s.id] = []; });
}

function save() {
  localStorage.setItem('wishlist', JSON.stringify(data));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Render ────────────────────────────────────────────────────────────────────

function render() {
  const app = document.getElementById('app');
  app.innerHTML = SECTIONS.map((s, i) => `
    <div class="section-block" id="sec-${s.id}">
      <div class="section-header">
        <div class="section-title">
          <div class="section-icon">${s.icon}</div>
          ${s.name}
        </div>
        <button class="add-btn" onclick="openModal('${s.id}')" title="Add item">+</button>
      </div>

      <div class="items-grid" id="grid-${s.id}">
        ${renderGrid(s.id)}
      </div>
    </div>
    ${i < SECTIONS.length - 1 ? '<hr class="divider" />' : ''}
  `).join('');
}

function renderGrid(id) {
  const items = data[id] || [];
  if (!items.length) {
    return `<div class="empty-state">No items yet — hit <strong>+</strong> to add one!</div>`;
  }
  return items.map(item => `
    <div class="item-card" id="card-${item.id}">
      <div class="item-name">${esc(item.name)}</div>
      ${item.price ? `<div class="item-price">${esc(item.price)}</div>` : ''}
      <div class="card-actions">
        ${item.link
          ? `<a href="${esc(item.link)}" target="_blank" rel="noopener" class="btn-view">🛒 View</a>`
          : `<span class="btn-view disabled">No Link</span>`}
        <button class="btn-edit"   onclick="openEdit('${id}','${item.id}')" title="Edit">✏️</button>
        <button class="btn-delete" onclick="deleteItem('${id}','${item.id}')" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');
}

function refreshGrid(id) {
  const grid = document.getElementById(`grid-${id}`);
  if (grid) grid.innerHTML = renderGrid(id);
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function openModal(sectionId) {
  document.getElementById('modal-title').textContent = 'Add Item';
  document.getElementById('item-form').reset();
  document.getElementById('current-section').value = sectionId;
  document.getElementById('edit-id').value = '';
  document.getElementById('overlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('f-name').focus(), 80);
}

function openEdit(sectionId, itemId) {
  const item = (data[sectionId] || []).find(i => i.id === itemId);
  if (!item) return;
  document.getElementById('modal-title').textContent = 'Edit Item';
  document.getElementById('current-section').value = sectionId;
  document.getElementById('edit-id').value = itemId;
  document.getElementById('f-name').value  = item.name  || '';
  document.getElementById('f-price').value = item.price || '';
  document.getElementById('f-link').value  = item.link  || '';
  document.getElementById('overlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('f-name').focus(), 80);
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('overlay')) return;
  document.getElementById('overlay').classList.add('hidden');
}

function saveItem(e) {
  e.preventDefault();
  const sectionId = document.getElementById('current-section').value;
  const editId    = document.getElementById('edit-id').value;
  const name      = document.getElementById('f-name').value.trim();
  const price     = document.getElementById('f-price').value.trim();
  const link      = document.getElementById('f-link').value.trim();

  if (editId) {
    const idx = (data[sectionId] || []).findIndex(i => i.id === editId);
    if (idx !== -1) data[sectionId][idx] = { ...data[sectionId][idx], name, price, link };
  } else {
    data[sectionId].push({ id: uid(), name, price, link });
  }

  save();
  document.getElementById('overlay').classList.add('hidden');
  refreshGrid(sectionId);
}

function deleteItem(sectionId, itemId) {
  data[sectionId] = (data[sectionId] || []).filter(i => i.id !== itemId);
  save();
  refreshGrid(sectionId);
}

// ── Escape HTML ───────────────────────────────────────────────────────────────

function esc(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Keyboard close ────────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('overlay').classList.add('hidden');
});

// ── Init ──────────────────────────────────────────────────────────────────────

load();
render();
