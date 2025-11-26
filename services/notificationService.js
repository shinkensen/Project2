import nodemailer from 'nodemailer';
import { supabase } from '../config/supabase.js';
import cron from 'node-cron';

export const notificationService = {
  transporter: null,

  // Initialize email transporter
  initialize() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  },

  // Send expiration notification email
  async sendExpirationNotification(userEmail, items) {
    if (!this.transporter) this.initialize();

    const itemsList = items.map(item => 
      `- ${item.name} (expires: ${new Date(item.expiration_date).toLocaleDateString()})`
    ).join('\n');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '🍎 Food Items Expiring Soon - Smart Fridge Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Food Items Expiring Soon!</h2>
          <p>The following items in your fridge are expiring soon:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${items.map(item => `
              <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                <strong>${item.name}</strong><br>
                <span style="color: #dc2626;">Expires: ${new Date(item.expiration_date).toLocaleDateString()}</span><br>
                ${item.quantity ? `Quantity: ${item.quantity} ${item.unit || ''}` : ''}
              </div>
            `).join('')}
          </div>
          <p>Consider using these items soon or check our recipe suggestions to minimize food waste!</p>
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Dashboard
          </a>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Notification sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Email error:', error);
      throw error;
    }
  },

  // Log notification in database
  async logNotification(userId, itemIds, notificationType) {
    const notifications = itemIds.map(itemId => ({
      user_id: userId,
      fridge_item_id: itemId,
      notification_type: notificationType
    }));

    const { error } = await supabase
      .from('notification_log')
      .insert(notifications);

    if (error) console.error('Failed to log notification:', error);
  },

  // Check for expiring items and send notifications
  async checkAndNotify() {
    try {
      // Get all users with notifications enabled
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('notification_enabled', true);

      if (profilesError) throw profilesError;

      for (const profile of profiles) {
        const today = new Date();
        const notifyBefore = profile.notification_days_before || 2;
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + notifyBefore);

        // Get expiring items for this user
        const { data: expiringItems, error: itemsError } = await supabase
          .from('fridge_items')
          .select('*')
          .eq('user_id', profile.id)
          .eq('is_consumed', false)
          .lte('expiration_date', thresholdDate.toISOString().split('T')[0])
          .gte('expiration_date', today.toISOString().split('T')[0]);

        if (itemsError) throw itemsError;

        if (expiringItems && expiringItems.length > 0) {
          // Check if notification already sent today
          const { data: recentNotifications } = await supabase
            .from('notification_log')
            .select('*')
            .eq('user_id', profile.id)
            .eq('notification_type', 'expiration_warning')
            .gte('sent_at', today.toISOString().split('T')[0]);

          if (!recentNotifications || recentNotifications.length === 0) {
            await this.sendExpirationNotification(profile.email, expiringItems);
            await this.logNotification(
              profile.id,
              expiringItems.map(item => item.id),
              'expiration_warning'
            );
          }
        }
      }
    } catch (error) {
      console.error('Notification check failed:', error);
    }
  },

  // Start scheduled notification job (runs daily at 9 AM)
  startScheduler() {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', () => {
      console.log('Running scheduled notification check...');
      this.checkAndNotify();
    });

    console.log('Notification scheduler started');
  }
};
