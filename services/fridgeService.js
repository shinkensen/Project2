import { supabase } from '../config/supabase.js';

export const fridgeService = {
  // Get all fridge items for current user
  async getFridgeItems(userId) {
    const { data, error } = await supabase
      .from('fridge_items')
      .select('*')
      .eq('user_id', userId)
      .eq('is_consumed', false)
      .order('expiration_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get items expiring soon
  async getExpiringItems(userId, daysThreshold = 3) {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    const { data, error } = await supabase
      .from('fridge_items')
      .select('*')
      .eq('user_id', userId)
      .eq('is_consumed', false)
      .lte('expiration_date', thresholdDate.toISOString().split('T')[0])
      .gte('expiration_date', today.toISOString().split('T')[0])
      .order('expiration_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Add new fridge item
  async addFridgeItem(itemData) {
    const { data, error } = await supabase
      .from('fridge_items')
      .insert([itemData])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Update fridge item
  async updateFridgeItem(itemId, updates) {
    const { data, error } = await supabase
      .from('fridge_items')
      .update(updates)
      .eq('id', itemId)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Mark item as consumed
  async markAsConsumed(itemId) {
    const { data, error } = await supabase
      .from('fridge_items')
      .update({ 
        is_consumed: true, 
        consumed_date: new Date().toISOString() 
      })
      .eq('id', itemId)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Delete fridge item
  async deleteFridgeItem(itemId) {
    const { error } = await supabase
      .from('fridge_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  // Save detected ingredients
  async saveDetectedIngredients(userId, imageUrl, detectedItems) {
    const { data, error } = await supabase
      .from('detected_ingredients')
      .insert([{
        user_id: userId,
        image_url: imageUrl,
        detected_items: detectedItems
      }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Get detected ingredients pending confirmation
  async getPendingDetections(userId) {
    const { data, error } = await supabase
      .from('detected_ingredients')
      .select('*')
      .eq('user_id', userId)
      .eq('confirmed', false)
      .order('processed_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Confirm detected ingredients and add to fridge
  async confirmDetectedIngredients(detectionId, confirmedItems) {
    // Mark detection as confirmed
    await supabase
      .from('detected_ingredients')
      .update({ confirmed: true })
      .eq('id', detectionId);

    // Add confirmed items to fridge
    if (confirmedItems && confirmedItems.length > 0) {
      const { data, error } = await supabase
        .from('fridge_items')
        .insert(confirmedItems)
        .select();

      if (error) throw error;
      return data;
    }
  },

  // Get consumption statistics
  async getConsumptionStats(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('fridge_items')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;
    return data;
  }
};
