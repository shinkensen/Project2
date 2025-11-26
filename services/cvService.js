import axios from 'axios';

export const cvService = {
  // Note: CV detection runs in the browser using TensorFlow.js
  // This service provides helper functions for the backend
  
  // Mock detection for server-side (not used in production)
  async detectIngredients(imageElement) {
    // This is called from browser, TensorFlow.js loads there
    // This backend version is just a placeholder
    console.log('CV detection should run in browser');
    return [];
  },

  // Enhanced detection using Clarifai API (optional, requires API key)
  async detectWithClarifai(imageUrl, apiKey) {
    try {
      const response = await axios.post(
        'https://api.clarifai.com/v2/models/food-item-recognition/outputs',
        {
          inputs: [{ data: { image: { url: imageUrl } } }]
        },
        {
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.outputs[0].data.concepts.map(concept => ({
        name: concept.name,
        confidence: concept.value
      }));
    } catch (error) {
      console.error('Clarifai API error:', error);
      throw error;
    }
  },

  // Get nutritional info and shelf life from Open Food Facts API
  async getFoodInfo(foodName) {
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&json=true`
      );

      if (response.data.products && response.data.products.length > 0) {
        const product = response.data.products[0];
        return {
          name: product.product_name || foodName,
          category: product.categories || 'Unknown',
          shelfLife: this.estimateShelfLife(product.categories),
          nutrition: product.nutriments
        };
      }
    } catch (error) {
      console.error('Food info API error:', error);
    }

    // Return default shelf life estimates
    return {
      name: foodName,
      category: 'Unknown',
      shelfLife: this.estimateShelfLife(foodName)
    };
  },

  // Estimate shelf life based on food category
  estimateShelfLife(categoryOrName) {
    const shelfLifeMap = {
      'dairy': 7,
      'milk': 7,
      'cheese': 14,
      'meat': 3,
      'chicken': 2,
      'beef': 3,
      'fish': 2,
      'seafood': 2,
      'vegetables': 7,
      'leafy greens': 5,
      'fruits': 7,
      'berries': 5,
      'bread': 5,
      'eggs': 21,
      'leftovers': 3,
      'cooked food': 3
    };

    const lowerText = (categoryOrName || '').toLowerCase();
    
    for (const [key, days] of Object.entries(shelfLifeMap)) {
      if (lowerText.includes(key)) {
        return days;
      }
    }

    return 7; // Default 1 week
  }
};
