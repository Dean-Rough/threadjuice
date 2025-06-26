/**
 * Email newsletter integration with database persistence
 * Supports Resend for transactional emails and Supabase for storage
 */

import supabase from './database';
import { env } from './env';

// Email service configuration
const RESEND_API_URL = 'https://api.resend.com';
const FROM_EMAIL = 'ThreadJuice <hello@threadjuice.com>';
const NEWSLETTER_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || '';

export interface NewsletterSubscriber {
  email: string;
  userId?: string;
  preferences: {
    frequency: 'daily' | 'weekly' | 'instant';
    categories: string[];
  };
  status: 'active' | 'unsubscribed' | 'bounced';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

class EmailServiceWithDB {
  private apiKey: string | null;

  constructor() {
    this.apiKey = env.RESEND_API_KEY || null;
  }

  /**
   * Subscribe user to newsletter
   */
  async subscribeToNewsletter(
    email: string,
    preferences?: Partial<NewsletterSubscriber['preferences']>,
    userId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if already subscribed
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', email)
        .single();

      if (existing && existing.status === 'active') {
        return {
          success: false,
          message: 'Email already subscribed',
        };
      }

      // Store in database
      const { error: dbError } = await supabase
        .from('newsletter_subscribers')
        .upsert({
          email,
          user_id: userId,
          status: 'active',
          preferences: {
            frequency: preferences?.frequency || 'daily',
            categories: preferences?.categories || [],
          },
        });

      if (dbError) {
        throw dbError;
      }

      // Add to Resend if API key exists
      if (this.apiKey && NEWSLETTER_AUDIENCE_ID) {
        try {
          const response = await fetch(
            `${RESEND_API_URL}/audiences/${NEWSLETTER_AUDIENCE_ID}/contacts`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                unsubscribed: false,
              }),
            }
          );

          if (!response.ok && response.status !== 409) {
            console.error('Resend API error:', await response.text());
          }
        } catch (resendError) {
          // Log but don't fail - database subscription is more important
          console.error('Resend subscription failed:', resendError);
        }
      }

      // Send welcome email
      await this.sendWelcomeEmail(email);

      return {
        success: true,
        message: 'Successfully subscribed to newsletter',
      };
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      return {
        success: false,
        message: 'Failed to subscribe. Please try again.',
      };
    }
  }

  /**
   * Unsubscribe user from newsletter
   */
  async unsubscribeFromNewsletter(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Update database
      const { error: dbError } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'unsubscribed' })
        .eq('email', email);

      if (dbError) {
        throw dbError;
      }

      // Remove from Resend if API key exists
      if (this.apiKey && NEWSLETTER_AUDIENCE_ID) {
        try {
          const response = await fetch(
            `${RESEND_API_URL}/audiences/${NEWSLETTER_AUDIENCE_ID}/contacts/${email}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${this.apiKey}`,
              },
            }
          );

          if (!response.ok && response.status !== 404) {
            console.error('Resend unsubscribe error:', await response.text());
          }
        } catch (resendError) {
          console.error('Resend unsubscribe failed:', resendError);
        }
      }

      return {
        success: true,
        message: 'Successfully unsubscribed from newsletter',
      };
    } catch (error) {
      console.error('Newsletter unsubscription failed:', error);
      return {
        success: false,
        message: 'Failed to unsubscribe. Please try again.',
      };
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    email: string,
    preferences: Partial<NewsletterSubscriber['preferences']>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ preferences })
        .eq('email', email);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Preferences updated successfully',
      };
    } catch (error) {
      console.error('Preference update failed:', error);
      return {
        success: false,
        message: 'Failed to update preferences',
      };
    }
  }

  /**
   * Send welcome email to new subscriber
   */
  private async sendWelcomeEmail(email: string): Promise<void> {
    const template = this.getWelcomeEmailTemplate();

    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send individual email
   */
  async sendEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    try {
      if (!this.apiKey) {
        console.log('Email would be sent (no API key):', {
          to: options.to,
          subject: options.subject,
        });
        return { success: true, messageId: 'dev-mode-id' };
      }

      const response = await fetch(`${RESEND_API_URL}/emails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: options.from || FROM_EMAIL,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Email send failed: ${error}`);
      }

      const result = await response.json();
      return { success: true, messageId: result.id };
    } catch (error) {
      console.error('Email send failed:', error);
      return { success: false };
    }
  }

  /**
   * Send newsletter to subscribers
   */
  async sendNewsletter(
    template: EmailTemplate,
    frequency?: 'daily' | 'weekly' | 'instant'
  ): Promise<{ success: boolean; sent: number }> {
    try {
      // Get active subscribers
      let query = supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('status', 'active');

      if (frequency) {
        query = query.eq('preferences->frequency', frequency);
      }

      const { data: subscribers, error } = await query;

      if (error) {
        throw error;
      }

      let sentCount = 0;
      const batchSize = 10;

      // Send in batches
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        const emails = batch.map(sub => sub.email);

        const result = await this.sendEmail({
          to: emails,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        if (result.success) {
          sentCount += batch.length;
        }

        // Rate limiting
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return { success: true, sent: sentCount };
    } catch (error) {
      console.error('Newsletter send failed:', error);
      return { success: false, sent: 0 };
    }
  }

  /**
   * Get active subscribers count
   */
  async getSubscriberCount(): Promise<number> {
    const { count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return count || 0;
  }

  /**
   * Get welcome email template
   */
  private getWelcomeEmailTemplate(): EmailTemplate {
    return {
      subject: 'Welcome to ThreadJuice! 🧃',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { width: 150px; height: auto; }
            .content { line-height: 1.6; color: #333; }
            .cta { text-align: center; margin: 30px 0; }
            .button { background: #ea580c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${env.NEXT_PUBLIC_APP_URL}/logotype-white.svg" alt="ThreadJuice" class="logo">
              <h1 style="color: #ea580c; margin-top: 20px;">Welcome to ThreadJuice! 🧃</h1>
            </div>
            
            <div class="content">
              <p>Hey there!</p>
              
              <p>Thanks for joining ThreadJuice! You're now part of a community that gets the best of Reddit without the endless scrolling.</p>
              
              <p><strong>What's coming your way:</strong></p>
              <ul>
                <li>📰 Daily curated stories from viral Reddit threads</li>
                <li>🤖 Multiple AI personalities bringing unique perspectives</li>
                <li>💬 Real Reddit comments preserved for context</li>
                <li>🎯 Just the good stuff - no fluff, no filler</li>
              </ul>
              
              <p>Your first newsletter arrives tomorrow morning. Can't wait? Check out today's stories!</p>
            </div>
            
            <div class="cta">
              <a href="${env.NEXT_PUBLIC_APP_URL}" class="button">
                Start Reading
              </a>
            </div>
            
            <div class="content">
              <p>Questions? Just reply to this email - we actually read them!</p>
              
              <p>Welcome to the juice crew! 🚀</p>
              <p><strong>The ThreadJuice Team</strong></p>
            </div>
            
            <div class="footer">
              <p>You're receiving this because you subscribed to ThreadJuice.</p>
              <p>
                <a href="${env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?email={{email}}">Unsubscribe</a> | 
                <a href="${env.NEXT_PUBLIC_APP_URL}">threadjuice.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `.replace(/{{email}}/g, '{{email}}'), // Prevent replacement here
      text: `
Welcome to ThreadJuice! 🧃

Hey there!

Thanks for joining ThreadJuice! You're now part of a community that gets the best of Reddit without the endless scrolling.

What's coming your way:
- Daily curated stories from viral Reddit threads
- Multiple AI personalities bringing unique perspectives  
- Real Reddit comments preserved for context
- Just the good stuff - no fluff, no filler

Your first newsletter arrives tomorrow morning. Can't wait? Check out today's stories at ${env.NEXT_PUBLIC_APP_URL}

Questions? Just reply to this email - we actually read them!

Welcome to the juice crew! 🚀
The ThreadJuice Team

You're receiving this because you subscribed to ThreadJuice.
Unsubscribe: ${env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?email={{email}}
      `,
    };
  }

  /**
   * Create daily digest email
   */
  async createDailyDigest(): Promise<EmailTemplate | null> {
    try {
      // Get yesterday's top posts
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString())
        .order('trending_score', { ascending: false })
        .limit(5);

      if (!posts || posts.length === 0) {
        return null;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #ea580c; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .post { border-bottom: 1px solid #eee; padding: 20px 0; }
            .post:last-child { border-bottom: none; }
            .post-title { font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #333; text-decoration: none; display: block; }
            .post-meta { color: #666; font-size: 14px; margin-bottom: 12px; }
            .post-excerpt { line-height: 1.6; color: #444; margin-bottom: 12px; }
            .read-more { color: #ea580c; text-decoration: none; font-weight: 600; }
            .cta { background: #f5f5f5; padding: 30px; text-align: center; }
            .button { background: #ea580c; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Your Daily ThreadJuice 🧃</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">The best of Reddit, served fresh</p>
            </div>
            
            <div class="content">
              ${posts.map(post => `
                <div class="post">
                  <a href="${env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}" class="post-title">
                    ${post.title}
                  </a>
                  <div class="post-meta">
                    ${post.category} • ${post.view_count} views • ${post.upvote_count} upvotes
                  </div>
                  <div class="post-excerpt">
                    ${post.excerpt || 'Click to read this amazing story from Reddit...'}
                  </div>
                  <a href="${env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}" class="read-more">
                    Read Full Story →
                  </a>
                </div>
              `).join('')}
            </div>
            
            <div class="cta">
              <p style="margin-bottom: 20px;">Missed something? Check out all recent stories:</p>
              <a href="${env.NEXT_PUBLIC_APP_URL}" class="button">
                Visit ThreadJuice
              </a>
            </div>
            
            <div class="footer">
              <p>You're receiving this because you subscribed to daily updates.</p>
              <p>
                <a href="${env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?email={{email}}" style="color: #666;">Unsubscribe</a> | 
                <a href="${env.NEXT_PUBLIC_APP_URL}/newsletter/preferences" style="color: #666;">Update Preferences</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = posts.map(post => `
${post.title}
${post.category} • ${post.view_count} views
${post.excerpt || 'Click to read this amazing story from Reddit...'}
Read more: ${env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}
`).join('\n---\n');

      return {
        subject: `Your Daily ThreadJuice - ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
        html,
        text: `Your Daily ThreadJuice

${text}

Visit ThreadJuice for more stories: ${env.NEXT_PUBLIC_APP_URL}

Unsubscribe: ${env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?email={{email}}
`,
      };
    } catch (error) {
      console.error('Failed to create daily digest:', error);
      return null;
    }
  }
}

export const emailService = new EmailServiceWithDB();

// Re-export utility functions
export { validateEmail, sanitizeEmail } from './email';