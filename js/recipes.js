import { authService } from '../services/authService.js';
import { fridgeService } from '../services/fridgeService.js';
import { recipeService } from '../services/recipeService.js';

let currentUser = null;
let allRecipes = [];
let currentFilter = 'all';

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
    await loadRecipes();
    setupEventListeners();
  } catch (error) {
    console.error('Init error:', error);
    window.location.href = 'signin.html';
  }
}

async function loadRecipes() {
  try {
    const items = await fridgeService.getFridgeItems(currentUser.id);
    
    if (items.length === 0) {
      document.getElementById('recipeGrid').innerHTML = 
        '<p class="empty-state">Add items to your fridge to get recipe suggestions!</p>';
      return;
    }

    const ingredients = items.map(item => item.name);
    allRecipes = await recipeService.getRecipeSuggestions(ingredients);
    
    displayRecipes(allRecipes);
  } catch (error) {
    console.error('Failed to load recipes:', error);
    document.getElementById('recipeGrid').innerHTML = 
      '<p class="empty-state">Failed to load recipes. Please try again.</p>';
  }
}

function displayRecipes(recipes) {
  const container = document.getElementById('recipeGrid');
  
  if (recipes.length === 0) {
    container.innerHTML = '<p class="empty-state">No recipes found.</p>';
    return;
  }

  container.innerHTML = recipes.map(recipe => `
    <div class="recipe-card" onclick="openRecipeModal('${recipe.id}')">
      <img src="${recipe.image || 'https://via.placeholder.com/300x200?text=Recipe'}" 
           alt="${recipe.title}" class="recipe-image">
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.title}</h3>
        <div class="recipe-meta">
          <span>⏱️ ${recipe.readyInMinutes || 30} min</span>
          <span>🍽️ ${recipe.servings || 4} servings</span>
        </div>
        <div class="recipe-ingredients">
          ${(recipe.usedIngredients || []).slice(0, 3).map(ing => 
            `<span class="ingredient-tag matched">${ing.name || ing}</span>`
          ).join('')}
          ${(recipe.missedIngredients || []).length > 0 ? 
            `<span class="ingredient-tag">+${recipe.missedIngredients.length} more</span>` : ''}
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

  // Generate new recipes
  document.getElementById('generateRecipes').addEventListener('click', async () => {
    await loadRecipes();
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  // Modal controls
  document.querySelector('.modal-close').addEventListener('click', closeRecipeModal);
  document.getElementById('closeRecipe').addEventListener('click', closeRecipeModal);
  document.getElementById('saveRecipe').addEventListener('click', saveCurrentRecipe);
}

async function applyFilter() {
  try {
    if (currentFilter === 'all') {
      displayRecipes(allRecipes);
    } else if (currentFilter === 'minimize-waste') {
      const items = await fridgeService.getExpiringItems(currentUser.id, 5);
      const ingredients = items.map(item => item.name);
      const recipes = await recipeService.getRecipeSuggestions(ingredients);
      displayRecipes(recipes);
    } else if (currentFilter === 'saved') {
      const saved = await recipeService.getSavedRecipes(currentUser.id);
      displayRecipes(saved.map(s => s.recipe_data));
    }
  } catch (error) {
    console.error('Filter error:', error);
  }
}

async function openRecipeModal(recipeId) {
  try {
    const recipe = allRecipes.find(r => r.id.toString() === recipeId.toString());
    if (!recipe) return;

    // Get detailed recipe info if not already loaded
    let details = recipe.details;
    if (!details && recipe.id) {
      details = await recipeService.getRecipeDetails(recipe.id);
    }

    // Populate modal
    document.getElementById('recipeTitle').textContent = recipe.title;
    document.getElementById('recipeImage').src = recipe.image || 'https://via.placeholder.com/800x400?text=Recipe';
    
    document.getElementById('recipeTime').textContent = `⏱️ ${recipe.readyInMinutes || details?.readyInMinutes || 30} minutes`;
    document.getElementById('recipeServings').textContent = `🍽️ ${recipe.servings || details?.servings || 4} servings`;

    // Ingredients
    const ingredients = details?.extendedIngredients || recipe.usedIngredients || [];
    document.getElementById('recipeIngredients').innerHTML = ingredients.map(ing => 
      `<li>${ing.original || ing.name || ing}</li>`
    ).join('');

    // Instructions
    const instructions = details?.instructions || details?.summary || recipe.summary || 'No instructions available.';
    document.getElementById('recipeInstructions').innerHTML = instructions;

    document.getElementById('recipeModal').style.display = 'flex';
    
    // Store current recipe for saving
    window.currentRecipeForSaving = recipe;
  } catch (error) {
    console.error('Failed to load recipe details:', error);
    alert('Failed to load recipe details');
  }
}

function closeRecipeModal() {
  document.getElementById('recipeModal').style.display = 'none';
}

async function saveCurrentRecipe() {
  try {
    if (!window.currentRecipeForSaving) return;
    
    await recipeService.saveRecipeSuggestion(
      currentUser.id,
      window.currentRecipeForSaving,
      window.currentRecipeForSaving.usedIngredients || []
    );
    
    alert('Recipe saved!');
  } catch (error) {
    console.error('Failed to save recipe:', error);
    alert('Failed to save recipe');
  }
}

// Global function
window.openRecipeModal = openRecipeModal;
