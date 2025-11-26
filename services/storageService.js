import { supabase } from '../config/supabase.js';

export const storageService = {
  // Upload image to Supabase Storage
  async uploadImage(file, userId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('fridge-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('fridge-images')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: urlData.publicUrl
    };
  },

  // Get signed URL for private access
  async getSignedUrl(path, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from('fridge-images')
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  },

  // Delete image
  async deleteImage(path) {
    const { error } = await supabase.storage
      .from('fridge-images')
      .remove([path]);

    if (error) throw error;
  },

  // List user's images
  async listUserImages(userId) {
    const { data, error } = await supabase.storage
      .from('fridge-images')
      .list(userId);

    if (error) throw error;
    return data;
  }
};
