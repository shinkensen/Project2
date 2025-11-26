import { authService } from '../services/authService.js';
import { supabase } from '../config/supabase.js';

let currentUser = null;
let currentProfile = null;

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
    await loadProfile();
    setupEventListeners();
  } catch (error) {
    console.error('Init error:', error);
    window.location.href = 'signin.html';
  }
}

async function loadProfile() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) throw error;
    
    currentProfile = data;
    
    // Populate form fields
    document.getElementById('fullName').value = data.full_name || '';
    document.getElementById('email').value = data.email;
    document.getElementById('notificationsEnabled').checked = data.notification_enabled;
    document.getElementById('notificationDays').value = data.notification_days_before || 2;
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}

function setupEventListeners() {
  // Sign out
  document.getElementById('signoutBtn').addEventListener('click', async () => {
    await authService.signOut();
    window.location.href = 'signin.html';
  });

  // Profile form
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateProfile();
  });

  // Notification form
  document.getElementById('notificationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateNotificationSettings();
  });

  // Password form
  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await updatePassword();
  });

  // Delete account
  document.getElementById('deleteAccount').addEventListener('click', deleteAccount);
}

async function updateProfile() {
  try {
    const fullName = document.getElementById('fullName').value;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', currentUser.id);

    if (error) throw error;

    showMessage('Profile updated successfully!', 'success');
  } catch (error) {
    console.error('Update profile error:', error);
    showMessage('Failed to update profile', 'error');
  }
}

async function updateNotificationSettings() {
  try {
    const enabled = document.getElementById('notificationsEnabled').checked;
    const days = parseInt(document.getElementById('notificationDays').value);

    const { error } = await supabase
      .from('profiles')
      .update({
        notification_enabled: enabled,
        notification_days_before: days
      })
      .eq('id', currentUser.id);

    if (error) throw error;

    showMessage('Notification settings updated!', 'success');
  } catch (error) {
    console.error('Update notifications error:', error);
    showMessage('Failed to update notification settings', 'error');
  }
}

async function updatePassword() {
  try {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    await authService.updatePassword(newPassword);
    
    showMessage('Password updated successfully!', 'success');
    
    // Clear form
    document.getElementById('passwordForm').reset();
  } catch (error) {
    console.error('Update password error:', error);
    showMessage('Failed to update password', 'error');
  }
}

async function deleteAccount() {
  const confirmed = confirm(
    'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
  );

  if (!confirmed) return;

  const doubleCheck = prompt('Type "DELETE" to confirm account deletion:');
  
  if (doubleCheck !== 'DELETE') {
    showMessage('Account deletion cancelled', 'error');
    return;
  }

  try {
    // Delete user's data first
    await supabase
      .from('fridge_items')
      .delete()
      .eq('user_id', currentUser.id);

    await supabase
      .from('detected_ingredients')
      .delete()
      .eq('user_id', currentUser.id);

    await supabase
      .from('recipe_suggestions')
      .delete()
      .eq('user_id', currentUser.id);

    await supabase
      .from('notification_log')
      .delete()
      .eq('user_id', currentUser.id);

    // Note: Actual user deletion requires admin API or Edge Function
    // For now, just sign out
    await authService.signOut();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Delete account error:', error);
    showMessage('Failed to delete account', 'error');
  }
}

function showMessage(message, type) {
  const messageBox = document.getElementById('messageBox');
  messageBox.textContent = message;
  messageBox.className = `message-box ${type === 'success' ? 'success-message' : 'error-message'}`;
  messageBox.style.display = 'block';

  setTimeout(() => {
    messageBox.style.display = 'none';
  }, 3000);
}
