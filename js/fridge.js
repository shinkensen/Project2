import { authService } from '../services/authService.js';
import { fridgeService } from '../services/fridgeService.js';

let currentUser = null;
let allItems = [];

// Initialize
init();

async function init() {
  try {
    currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      window.location.href = 'signin.html';
      return;
    }

    document.getElementById('userEmail').textContent = currentUser.email;
    await loadFridgeItems();
    setupEventListeners();
  } catch (error) {
    console.error('Init error:', error);
    window.location.href = 'signin.html';
  }
}

async function loadFridgeItems() {
  try {
    allItems = await fridgeService.getFridgeItems(currentUser.id);
    displayItems(allItems);
  } catch (error) {
    console.error('Failed to load items:', error);
  }
}

function displayItems(items) {
  const container = document.getElementById('fridgeGrid');
  
  if (items.length === 0) {
    container.innerHTML = '<p class="empty-state">No items in your fridge yet. Start by uploading a photo!</p>';
    return;
  }

  container.innerHTML = items.map(item => {
    const expirationDate = new Date(item.expiration_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
    
    let badgeClass = 'fresh';
    let badgeText = 'Fresh';
    
    if (daysUntilExpiry < 0) {
      badgeClass = 'expired';
      badgeText = 'Expired';
    } else if (daysUntilExpiry <= 3) {
      badgeClass = 'soon';
      badgeText = `${daysUntilExpiry} days left`;
    }

    return `
      <div class="fridge-item-card">
        ${item.image_url ? `<img src="${item.image_url}" class="fridge-item-image" alt="${item.name}">` : '<div class="fridge-item-image"></div>'}
        <div class="fridge-item-content">
          <div class="fridge-item-header">
            <h3 class="fridge-item-title">${item.name}</h3>
            <span class="expiration-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="fridge-item-meta">
            <div>📦 ${item.quantity || ''} ${item.unit || ''}</div>
            <div>📅 Expires: ${expirationDate.toLocaleDateString()}</div>
            <div>📍 ${item.storage_location || 'Fridge'}</div>
          </div>
          <div class="fridge-item-actions">
            <button class="btn-small btn-secondary" onclick="editItem('${item.id}')">Edit</button>
            <button class="btn-small btn-primary" onclick="markConsumed('${item.id}')">Used</button>
            <button class="btn-small btn-danger" onclick="deleteItem('${item.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setupEventListeners() {
  // Sign out
  document.getElementById('signoutBtn').addEventListener('click', async () => {
    await authService.signOut();
    window.location.href = 'signin.html';
  });

  // Add manual button
  document.getElementById('addManualBtn').addEventListener('click', openAddModal);

  // Upload button
  document.getElementById('uploadBtn').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

  // Modal controls
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  document.getElementById('cancelItem').addEventListener('click', closeModal);
  document.getElementById('saveItem').addEventListener('click', saveItem);

  // Filters
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('categoryFilter').addEventListener('change', applyFilters);
  document.getElementById('sortBy').addEventListener('change', applyFilters);

  // Set today as default purchase date
  document.getElementById('purchaseDate').valueAsDate = new Date();
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Item';
  document.getElementById('itemForm').reset();
  document.getElementById('itemId').value = '';
  document.getElementById('purchaseDate').valueAsDate = new Date();
  document.getElementById('itemModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('itemModal').style.display = 'none';
}

async function saveItem() {
  try {
    const itemId = document.getElementById('itemId').value;
    const itemData = {
      user_id: currentUser.id,
      name: document.getElementById('itemName').value,
      quantity: parseFloat(document.getElementById('itemQuantity').value) || null,
      unit: document.getElementById('itemUnit').value || null,
      category: document.getElementById('itemCategory').value,
      purchase_date: document.getElementById('purchaseDate').value || null,
      expiration_date: document.getElementById('expirationDate').value,
      storage_location: document.getElementById('storageLocation').value,
      notes: document.getElementById('itemNotes').value || null
    };

    if (itemId) {
      await fridgeService.updateFridgeItem(itemId, itemData);
    } else {
      await fridgeService.addFridgeItem(itemData);
    }

    closeModal();
    await loadFridgeItems();
  } catch (error) {
    console.error('Failed to save item:', error);
    alert('Failed to save item. Please try again.');
  }
}

function applyFilters() {
  let filtered = [...allItems];

  // Search filter
  const search = document.getElementById('searchInput').value.toLowerCase();
  if (search) {
    filtered = filtered.filter(item => item.name.toLowerCase().includes(search));
  }

  // Category filter
  const category = document.getElementById('categoryFilter').value;
  if (category) {
    filtered = filtered.filter(item => item.category === category);
  }

  // Sort
  const sortBy = document.getElementById('sortBy').value;
  if (sortBy === 'expiration') {
    filtered.sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'date_added') {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  displayItems(filtered);
}

// Global functions
window.editItem = async function(itemId) {
  const item = allItems.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('modalTitle').textContent = 'Edit Item';
  document.getElementById('itemId').value = item.id;
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemQuantity').value = item.quantity || '';
  document.getElementById('itemUnit').value = item.unit || '';
  document.getElementById('itemCategory').value = item.category || 'other';
  document.getElementById('purchaseDate').value = item.purchase_date || '';
  document.getElementById('expirationDate').value = item.expiration_date;
  document.getElementById('storageLocation').value = item.storage_location || 'fridge';
  document.getElementById('itemNotes').value = item.notes || '';
  
  document.getElementById('itemModal').style.display = 'flex';
};

window.markConsumed = async function(itemId) {
  if (confirm('Mark this item as used?')) {
    try {
      await fridgeService.markAsConsumed(itemId);
      await loadFridgeItems();
    } catch (error) {
      console.error('Failed to mark as consumed:', error);
    }
  }
};

window.deleteItem = async function(itemId) {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await fridgeService.deleteFridgeItem(itemId);
      await loadFridgeItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  }
};
