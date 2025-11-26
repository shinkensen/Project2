// Browser-side Computer Vision Service using TensorFlow.js
// This runs in the browser, not on the server

export const cvClient = {
  model: null,
  isLoading: false,

  // Initialize the COCO-SSD model (browser only)
  async initialize() {
    if (this.model) return this.model;
    if (this.isLoading) {
      // Wait for existing load to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.model;
    }

    try {
      this.isLoading = true;
      console.log('Loading TensorFlow.js and COCO-SSD model...');
      
      // Load TensorFlow.js from CDN
      if (!window.tf) {
        await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0');
      }
      
      // Load COCO-SSD model from CDN
      if (!window.cocoSsd) {
        await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3');
      }

      // Initialize TensorFlow backend
      await window.tf.ready();
      
      // Load the model
      this.model = await window.cocoSsd.load();
      console.log('✅ COCO-SSD model loaded successfully');
      
      return this.model;
    } catch (error) {
      console.error('Failed to load CV model:', error);
      throw new Error('Failed to initialize computer vision. Please refresh and try again.');
    } finally {
      this.isLoading = false;
    }
  },

  // Helper to load scripts dynamically
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  // Detect objects in image
  async detectIngredients(imageElement) {
    try {
      if (!this.model) {
        await this.initialize();
      }

      console.log('Detecting objects in image...');
      const predictions = await this.model.detect(imageElement);
      console.log('Raw predictions:', predictions);
      
      // Filter for food-related items
      const foodKeywords = [
        'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog',
        'pizza', 'donut', 'cake', 'bottle', 'wine glass', 'cup', 'bowl',
        'dining table', 'refrigerator', 'oven', 'microwave', 'toaster'
      ];

      const foodItems = predictions.filter(pred => 
        foodKeywords.some(keyword => pred.class.toLowerCase().includes(keyword)) &&
        pred.score > 0.3 // Only items with >30% confidence
      );

      console.log(`✅ Detected ${foodItems.length} food-related items`);

      return foodItems.map(item => ({
        name: this.cleanItemName(item.class),
        confidence: item.score,
        boundingBox: item.bbox
      }));
    } catch (error) {
      console.error('Detection error:', error);
      throw error;
    }
  },

  // Clean up item names for better display
  cleanItemName(name) {
    const nameMap = {
      'hot dog': 'Hot Dog',
      'wine glass': 'Wine Glass',
      'dining table': 'Table',
      'potted plant': 'Plant'
    };
    
    return nameMap[name.toLowerCase()] || 
           name.split(' ').map(word => 
             word.charAt(0).toUpperCase() + word.slice(1)
           ).join(' ');
  },

  // Get nutritional info and shelf life from Open Food Facts API
  async getFoodInfo(foodName) {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&json=true`
      );
      
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        const product = data.products[0];
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
      'yogurt': 10,
      'meat': 3,
      'chicken': 2,
      'beef': 3,
      'pork': 3,
      'fish': 2,
      'seafood': 2,
      'vegetables': 7,
      'leafy greens': 5,
      'lettuce': 5,
      'spinach': 5,
      'fruits': 7,
      'berries': 5,
      'apple': 14,
      'banana': 5,
      'orange': 10,
      'bread': 5,
      'eggs': 21,
      'leftovers': 3,
      'cooked food': 3,
      'pizza': 3,
      'sandwich': 2
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
