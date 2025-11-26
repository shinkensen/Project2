import { authService } from '../services/authService.js';
import { fridgeService } from '../services/fridgeService.js';
import { recipeService } from '../services/recipeService.js';
import { storageService } from '../services/storageService.js';
import { cvClient } from './cvClient.js';

let currentUser = null;

// Initialize
init();

async function init() {
  try {
    currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      window.location.href = 'signin.html';
      return;
    }

    // Display user email
    document.getElementById('userEmail').textContent = currentUser.email;

    // Load dashboard data
    await loadDashboardData();

    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Init error:', error);
    window.location.href = 'signin.html';
  }
}

async function loadDashboardData() {
  try {
    // Get fridge items
    const items = await fridgeService.getFridgeItems(currentUser.id);
    const expiringItems = await fridgeService.getExpiringItems(currentUser.id, 3);
    
    // Get consumption stats
    const stats = await fridgeService.getConsumptionStats(currentUser.id, 7);
    const consumedCount = stats.filter(item => item.is_consumed).length;

    // Update stats
    document.getElementById('totalItems').textContent = items.length;
    document.getElementById('expiringItems').textContent = expiringItems.length;
    document.getElementById('consumedItems').textContent = consumedCount;

    // Display expiring items
    displayExpiringItems(expiringItems);

    // Get recipe suggestions if we have items
    if (items.length > 0) {
      const ingredients = items.slice(0, 5).map(item => item.name);
      const recipes = await recipeService.getRecipeSuggestions(ingredients);
      displayRecipes(recipes);
      document.getElementById('recipeSuggestions').textContent = recipes.length;
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

function displayExpiringItems(items) {
  const container = document.getElementById('expiringList');
  
  if (items.length === 0) {
    container.innerHTML = '<p class="empty-state">No items expiring soon</p>';
    return;
  }

  container.innerHTML = items.map(item => {
    const daysUntilExpiry = Math.ceil((new Date(item.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
    return `
      <div class="item-card expiring">
        <div>
          <strong>${item.name}</strong>
          <div style="color: #92400e; font-size: 0.875rem;">
            Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}
          </div>
        </div>
        <button class="btn-small btn-primary" onclick="markConsumed('${item.id}')">
          Mark Used
        </button>
      </div>
    `;
  }).join('');
}

function displayRecipes(recipes) {
  const container = document.getElementById('recipeList');
  
  if (recipes.length === 0) {
    container.innerHTML = '<p class="empty-state">Upload items to get recipe suggestions</p>';
    return;
  }

  container.innerHTML = recipes.slice(0, 3).map(recipe => `
    <div class="recipe-card" onclick="viewRecipe('${recipe.id}')">
      <img src="${recipe.image || 'https://via.placeholder.com/300x200'}" 
           alt="${recipe.title}" class="recipe-image">
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.title}</h3>
        <div class="recipe-meta">
          <span>⏱️ ${recipe.readyInMinutes || 30} min</span>
          <span>🍽️ ${recipe.servings || 4} servings</span>
        </div>
      </div>
    </div>
  `).join('');
}

function setupEventListeners() {
  // Sign out
  document.getElementById('signoutBtn').addEventListener('click', async () => {
    await authService.signOut();
    window.location.href = 'signin.html';
  });

  // Upload button
  document.getElementById('uploadBtn').addEventListener('click', () => {
    document.getElementById('uploadModal').style.display = 'flex';
  });

  // Modal close
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  document.getElementById('cancelUpload').addEventListener('click', closeModal);

  // File input
  document.getElementById('uploadArea').addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });

  document.getElementById('fileInput').addEventListener('change', handleFileSelect);
  document.getElementById('processImage').addEventListener('click', processImage);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('previewImage');
      preview.src = e.target.result;
      preview.style.display = 'block';
      document.querySelector('.upload-placeholder').style.display = 'none';
      document.getElementById('processImage').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

async function processImage() {
  try {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) return;

    // Show loading state
    const processBtn = document.getElementById('processImage');
    const originalText = processBtn.textContent;
    processBtn.textContent = 'Processing...';
    processBtn.disabled = true;

    // Upload to Supabase Storage
    const { url, path } = await storageService.uploadImage(file, currentUser.id);

    // Process with CV model (browser-based)
    const img = document.getElementById('previewImage');
    await cvClient.initialize();
    const detectedItems = await cvClient.detectIngredients(img);

    if (detectedItems.length === 0) {
      alert('No food items detected. Try another photo or add items manually.');
      processBtn.textContent = originalText;
      processBtn.disabled = false;
      return;
    }

    // Save detection results
    await fridgeService.saveDetectedIngredients(currentUser.id, url, detectedItems);

    // Display results
    displayDetectedItems(detectedItems);
    
    processBtn.style.display = 'none';
    document.getElementById('confirmItems').style.display = 'block';
  } catch (error) {
    console.error('Processing error:', error);
    alert('Failed to process image: ' + error.message);
    document.getElementById('processImage').disabled = false;
    document.getElementById('processImage').textContent = 'Process Image';
  }
}

function displayDetectedItems(items) {
  const container = document.getElementById('detectedItemsList');
  const resultsDiv = document.getElementById('detectionResults');
  
  resultsDiv.style.display = 'block';
  container.innerHTML = items.map((item, index) => `
    <div style="padding: 0.5rem; margin: 0.5rem 0; background: #f3f4f6; border-radius: 4px;">
      <input type="checkbox" id="item-${index}" checked>
      <label for="item-${index}">${item.name} (${Math.round(item.confidence * 100)}%)</label>
    </div>
  `).join('');
}

function closeModal() {
  document.getElementById('uploadModal').style.display = 'none';
  // Reset modal
  document.getElementById('fileInput').value = '';
  document.getElementById('previewImage').style.display = 'none';
  document.querySelector('.upload-placeholder').style.display = 'block';
  document.getElementById('detectionResults').style.display = 'none';
  document.getElementById('processImage').style.display = 'none';
  document.getElementById('confirmItems').style.display = 'none';
}

// Global functions
window.markConsumed = async function(itemId) {
  try {
    await fridgeService.markAsConsumed(itemId);
    await loadDashboardData();
  } catch (error) {
    console.error('Failed to mark as consumed:', error);
  }
};

window.viewRecipe = function(recipeId) {
  window.location.href = `recipes.html?id=${recipeId}`;
};
