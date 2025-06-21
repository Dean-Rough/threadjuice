/**
 * Email newsletter integration and management
 * Supports Resend for transactional emails and newsletter management
 */

import { env } from './env';

// Email service configuration
const RESEND_API_URL = 'https://api.resend.com';
const FROM_EMAIL = 'ThreadJuice <hello@threadjuice.com>';
const NEWSLETTER_LIST_ID = 'newsletter';

export interface NewsletterSubscriber {
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionDate: Date;
  preferences: {
    frequency: 'daily' | 'weekly' | 'instant';
    categories: string[];
  };
  isActive: boolean;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private apiKey: string | null;

  constructor() {
    this.apiKey = env.RESEND_API_KEY || null;
  }

  /**
   * Subscribe user to newsletter
   */
  async subscribeToNewsletter(
    email: string,
    preferences?: Partial<NewsletterSubscriber['preferences']>
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.apiKey) {
        // Development mode: Just log the subscription
        // console.log('Newsletter subscription (dev mode):', { email, preferences });
        return {
          success: true,
          message: 'Subscribed successfully (development mode)',
        };
      }

      // Add to Resend audience
      const response = await fetch(
        `${RESEND_API_URL}/audiences/${NEWSLETTER_LIST_ID}/contacts`,
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

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${error}`);
      }

      // Send welcome email
      await this.sendWelcomeEmail(email);

      // Store subscription in database (you would implement this)
      await this.storeSubscription(email, preferences);

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
      if (!this.apiKey) {
        // console.log('Newsletter unsubscription (dev mode):', { email });
        return {
          success: true,
          message: 'Unsubscribed successfully (development mode)',
        };
      }

      const response = await fetch(
        `${RESEND_API_URL}/audiences/${NEWSLETTER_LIST_ID}/contacts/${email}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unsubscribe from Resend');
      }

      // Update subscription status in database
      await this.updateSubscriptionStatus(email, false);

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
        // console.log('Email send (dev mode):', options);
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
   * Send newsletter to all subscribers
   */
  async sendNewsletter(
    template: EmailTemplate
  ): Promise<{ success: boolean; sent: number }> {
    try {
      const subscribers = await this.getActiveSubscribers();
      let sentCount = 0;

      for (const subscriber of subscribers) {
        const result = await this.sendEmail({
          to: subscriber.email,
          subject: template.subject,
          html: this.personalizeTemplate(template.html, subscriber),
          text: template.text,
        });

        if (result.success) {
          sentCount++;
        }

        // Rate limiting: wait 100ms between emails
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return { success: true, sent: sentCount };
    } catch (error) {
      console.error('Newsletter send failed:', error);
      return { success: false, sent: 0 };
    }
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
            .content { line-height: 1.6; color: #333; }
            .cta { text-align: center; margin: 30px 0; }
            .button { background: #ea580c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: #ea580c;">Welcome to ThreadJuice! 🧃</h1>
            </div>
            
            <div class="content">
              <p>Hey there!</p>
              
              <p>Thanks for joining the ThreadJuice community! You're now part of a growing group of readers who've discovered a better way to consume internet culture.</p>
              
              <p><strong>Here's what you can expect:</strong></p>
              <ul>
                <li>📰 Daily curated stories from trending Reddit threads</li>
                <li>🤖 AI writers with unique personalities bringing stories to life</li>
                <li>🎯 No endless scrolling - just the best content, delivered</li>
                <li>📱 Mobile-friendly format perfect for quick reads</li>
              </ul>
              
              <p>Your first curated story collection will arrive tomorrow morning. In the meantime, why not explore what we've already published?</p>
            </div>
            
            <div class="cta">
              <a href="${env.NEXT_PUBLIC_APP_URL}/blog" class="button">
                Start Reading Stories
              </a>
            </div>
            
            <div class="content">
              <p>Have questions or feedback? Just reply to this email - we read every message!</p>
              
              <p>Welcome aboard! 🚀</p>
              <p><strong>The ThreadJuice Team</strong></p>
            </div>
            
            <div class="footer">
              <p>You're receiving this because you signed up for ThreadJuice updates.</p>
              <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="${env.NEXT_PUBLIC_APP_URL}">threadjuice.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to ThreadJuice! 🧃

Thanks for joining our community! You're now part of a growing group of readers who've discovered a better way to consume internet culture.

Here's what you can expect:
- Daily curated stories from trending Reddit threads
- AI writers with unique personalities bringing stories to life  
- No endless scrolling - just the best content, delivered
- Mobile-friendly format perfect for quick reads

Your first curated story collection will arrive tomorrow morning. In the meantime, explore what we've already published at ${env.NEXT_PUBLIC_APP_URL}/blog

Have questions or feedback? Just reply to this email - we read every message!

Welcome aboard! 🚀
The ThreadJuice Team

You're receiving this because you signed up for ThreadJuice updates.
Unsubscribe: {{unsubscribe_url}} | Visit: ${env.NEXT_PUBLIC_APP_URL}
      `,
    };
  }

  /**
   * Personalize email template with subscriber data
   */
  private personalizeTemplate(
    html: string,
    subscriber: NewsletterSubscriber
  ): string {
    return html
      .replace(/{{email}}/g, subscriber.email)
      .replace(/{{firstName}}/g, subscriber.firstName || 'Reader')
      .replace(
        /{{unsubscribe_url}}/g,
        `${env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
      );
  }

  /**
   * Store subscription in database (placeholder)
   */
  private async storeSubscription(
    email: string,
    preferences?: Partial<NewsletterSubscriber['preferences']>
  ): Promise<void> {
    // In a real implementation, you would store this in your database
    // console.log('Storing subscription:', { email, preferences });
  }

  /**
   * Update subscription status in database (placeholder)
   */
  private async updateSubscriptionStatus(
    email: string,
    isActive: boolean
  ): Promise<void> {
    // In a real implementation, you would update the database
    // console.log('Updating subscription status:', { email, isActive });
  }

  /**
   * Get active subscribers from database (placeholder)
   */
  private async getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    // In a real implementation, you would fetch from your database
    return [];
  }

  /**
   * Create daily digest email template
   */
  createDailyDigestTemplate(posts: any[]): EmailTemplate {
    const topPosts = posts.slice(0, 5);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .post { border-bottom: 1px solid #eee; padding: 20px 0; }
          .post:last-child { border-bottom: none; }
          .post-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
          .post-meta { color: #666; font-size: 14px; margin-bottom: 12px; }
          .post-excerpt { line-height: 1.6; margin-bottom: 12px; }
          .read-more { color: #ea580c; text-decoration: none; font-weight: 500; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #ea580c;">Your Daily ThreadJuice 🧃</h1>
            <p style="color: #666;">The best stories from Reddit, curated and crafted by AI</p>
          </div>
          
          ${topPosts
            .map(
              post => `
            <div class="post">
              <h2 class="post-title">${post.title}</h2>
              <div class="post-meta">
                By ${post.persona?.name || 'ThreadJuice Writer'} • ${new Date(post.created_at).toLocaleDateString()}
              </div>
              <div class="post-excerpt">
                ${post.excerpt || post.content?.substring(0, 200) + '...'}
              </div>
              <a href="${env.NEXT_PUBLIC_APP_URL}/posts/${post.slug}" class="read-more">
                Read Full Story →
              </a>
            </div>
          `
            )
            .join('')}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.NEXT_PUBLIC_APP_URL}/blog" style="background: #ea580c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
              Read More Stories
            </a>
          </div>
          
          <div class="footer">
            <p>You're receiving this daily digest from ThreadJuice.</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="${env.NEXT_PUBLIC_APP_URL}/newsletter/preferences">Update Preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: `Your Daily ThreadJuice - ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
      html,
      text: `
Your Daily ThreadJuice - ${new Date().toLocaleDateString()}

${topPosts
  .map(
    post => `
${post.title}
By ${post.persona?.name || 'ThreadJuice Writer'} • ${new Date(post.created_at).toLocaleDateString()}

${post.excerpt || post.content?.substring(0, 200) + '...'}

Read more: ${env.NEXT_PUBLIC_APP_URL}/posts/${post.slug}
`
  )
  .join('\n---\n')}

Read more stories: ${env.NEXT_PUBLIC_APP_URL}/blog

You're receiving this daily digest from ThreadJuice.
Unsubscribe: {{unsubscribe_url}} | Update preferences: ${env.NEXT_PUBLIC_APP_URL}/newsletter/preferences
      `,
    };
  }
}

export const emailService = new EmailService();

// Utility functions for email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
