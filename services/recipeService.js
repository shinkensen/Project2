import axios from 'axios';
import { supabase } from '../config/supabase.js';

export const recipeService = {
  // Get recipe suggestions based on available ingredients
  async getRecipeSuggestions(ingredients, dietaryRestrictions = []) {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    
    try {
      // Use Spoonacular API to find recipes by ingredients
      const response = await axios.get(
        'https://api.spoonacular.com/recipes/findByIngredients',
        {
          params: {
            apiKey,
            ingredients: ingredients.join(','),
            number: 10,
            ranking: 2, // Maximize used ingredients
            ignorePantry: false
          }
        }
      );

      const recipes = response.data;

      // Get detailed information for each recipe
      const detailedRecipes = await Promise.all(
        recipes.slice(0, 5).map(async (recipe) => {
          const details = await this.getRecipeDetails(recipe.id);
          return {
            ...recipe,
            details
          };
        })
      );

      return detailedRecipes;
    } catch (error) {
      console.error('Recipe API error:', error);
      
      // Fallback to EdamamAPI if Spoonacular fails
      return this.getRecipesFromEdamam(ingredients);
    }
  },

  // Get detailed recipe information
  async getRecipeDetails(recipeId) {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    
    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/${recipeId}/information`,
        {
          params: {
            apiKey,
            includeNutrition: true
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Recipe details error:', error);
      return null;
    }
  },

  // Alternative recipe source using Edamam API
  async getRecipesFromEdamam(ingredients) {
    const appId = process.env.EDAMAM_APP_ID;
    const appKey = process.env.EDAMAM_APP_KEY;

    if (!appId || !appKey) {
      return this.getMockRecipes(ingredients);
    }

    try {
      const response = await axios.get(
        'https://api.edamam.com/search',
        {
          params: {
            q: ingredients.join(' '),
            app_id: appId,
            app_key: appKey,
            to: 10
          }
        }
      );

      return response.data.hits.map(hit => ({
        id: hit.recipe.uri,
        title: hit.recipe.label,
        image: hit.recipe.image,
        usedIngredients: ingredients,
        missedIngredients: [],
        url: hit.recipe.url,
        details: hit.recipe
      }));
    } catch (error) {
      console.error('Edamam API error:', error);
      return this.getMockRecipes(ingredients);
    }
  },

  // Save recipe suggestion to database
  async saveRecipeSuggestion(userId, recipe, matchedIngredients) {
    const { data, error } = await supabase
      .from('recipe_suggestions')
      .insert([{
        user_id: userId,
        recipe_id: recipe.id.toString(),
        recipe_name: recipe.title,
        recipe_data: recipe,
        ingredients_matched: matchedIngredients
      }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Get saved recipe suggestions
  async getSavedRecipes(userId) {
    const { data, error } = await supabase
      .from('recipe_suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  },

  // Delete saved recipe
  async deleteRecipeSuggestion(recipeId) {
    const { error } = await supabase
      .from('recipe_suggestions')
      .delete()
      .eq('id', recipeId);

    if (error) throw error;
  },

  // Get waste-minimizing recipes (prioritize expiring ingredients)
  async getWasteMinimizingRecipes(fridgeItems) {
    // Sort items by expiration date
    const sortedItems = [...fridgeItems].sort((a, b) => 
      new Date(a.expiration_date) - new Date(b.expiration_date)
    );

    // Prioritize items expiring soon
    const expiringIngredients = sortedItems
      .slice(0, 5)
      .map(item => item.name);

    return this.getRecipeSuggestions(expiringIngredients);
  },

  // Mock recipes for development/testing
  getMockRecipes(ingredients) {
    return [
      {
        id: 1,
        title: 'Fresh Vegetable Stir Fry',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
        usedIngredients: ingredients.slice(0, 3),
        missedIngredients: ['soy sauce', 'garlic'],
        readyInMinutes: 20,
        servings: 4,
        details: {
          instructions: 'Heat oil, add vegetables, stir fry until tender, season with soy sauce.',
          summary: 'A quick and healthy way to use up fresh vegetables.'
        }
      },
      {
        id: 2,
        title: 'Mixed Salad Bowl',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        usedIngredients: ingredients.slice(0, 2),
        missedIngredients: ['olive oil', 'vinegar'],
        readyInMinutes: 10,
        servings: 2,
        details: {
          instructions: 'Chop vegetables, mix with dressing, serve fresh.',
          summary: 'A simple salad to use fresh produce before it expires.'
        }
      }
    ];
  }
};
