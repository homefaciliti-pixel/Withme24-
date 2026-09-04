import { Notification, NotificationPreference, NotificationTemplate, User } from '../models';

export interface SendNotificationOptions {
  userId: number;
  templateKey: string;
  variables: Record<string, string>;
}

export class NotificationService {
  /**
   * Resolve template string by replacing placeholders with actual values.
   */
  private static resolveTemplate(templateStr: string, variables: Record<string, string>): string {
    let resolved = templateStr;
    Object.entries(variables).forEach(([key, val]) => {
      resolved = resolved.replace(new RegExp(`{{${key}}}`, 'g'), val);
    });
    return resolved;
  }

  /**
   * Sends a notification to a specific user using template keys.
   */
  public static async sendNotification(options: SendNotificationOptions): Promise<boolean> {
    const { userId, templateKey, variables } = options;

    try {
      // Find template
      const template = await NotificationTemplate.findOne({
        where: { template_key: templateKey, status: 'ACTIVE' },
      });

      if (!template) {
        console.warn(`[NotificationService] Active template not found for key: ${templateKey}`);
        return false;
      }

      // Check user preferences
      const preference = await NotificationPreference.findOne({
        where: { user_id: userId, channel: template.channel },
      });

      // If user disabled this channel, skip (default to true if no preference row exists)
      if (preference && !preference.enabled) {
        return false;
      }

      // Resolve content
      const title = this.resolveTemplate(template.title, variables);
      const message = this.resolveTemplate(template.message, variables);

      // Perform channel-specific actions
      if (template.channel === 'IN_APP') {
        await Notification.create({
          user_id: userId,
          title,
          message,
          channel: 'IN_APP',
          status: 'UNREAD',
        });
      } else if (template.channel === 'SMS') {
        const user = await User.findByPk(userId);
        if (user && user.mobile) {
          await this.sendSmsGateway(user.mobile, message, variables.otp);
        }
      } else if (template.channel === 'EMAIL') {
        const user = await User.findByPk(userId);
        if (user && user.email) {
          await this.sendEmailGateway(user.email, title, message);
        }
      } else if (template.channel === 'PUSH') {
        await this.sendPushGateway(userId, title, message);
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Error sending notification:', error);
      return false;
    }
  }

  /**
   * Integration point for SMS Providers (e.g. DLT, Fast2SMS, MSG91, Twilio)
   */
  public static async sendSmsGateway(mobile: string, message: string, otpCode?: string): Promise<boolean> {
    const provider = process.env.SMS_PROVIDER || 'dlt';

    const entityId = process.env.SMS_ENTITY_ID || '1201173444411453897';
    const dltTemplateId = process.env.SMS_DLT_TEMPLATE_ID || '1207173589889308632';
    const senderId = process.env.SMS_SENDER_ID || 'HMFCLI';
    const templateText = process.env.SMS_TEMPLATE_TEXT || 'Your OTP for registering on Superhome is: {#var#} This code is valid for the next 10 minutes.';

    // Replace placeholder for Indian DLT Template
    let formattedMessage = message;
    if (otpCode) {
      formattedMessage = templateText.replace('{#var#}', otpCode).replace('{var}', otpCode).replace('{{otp}}', otpCode);
    }

    console.log(`[DLT-SMS-DISPATCH] Target: ${mobile} | SenderID: ${senderId} | EntityID: ${entityId} | TemplateID: ${dltTemplateId}`);
    console.log(`[DLT-SMS-PAYLOAD] Content: "${formattedMessage}"`);

    if (provider === 'mock') {
      console.log(`[SMS-MOCK] Sent to ${mobile}: ${formattedMessage}`);
      return true;
    }

    try {
      const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
      const apiKey = process.env.SMS_API_KEY || '';
      const apiUrl = process.env.SMS_API_URL || 'https://www.fast2sms.com/dev/bulkV2';

      if (apiKey && apiKey !== 'mockSmsApiKey123') {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': apiKey,
          },
          body: JSON.stringify({
            route: 'dlt',
            sender_id: senderId,
            message: dltTemplateId,
            variables_values: otpCode || '',
            numbers: cleanMobile,
            entity_id: entityId,
          }),
        });

        const resJson: any = await response.json();
        console.log('[DLT-SMS-RESPONSE]', resJson);
        return Boolean(resJson && (resJson.return === true || resJson.status === 'success' || resJson.success === true));
      } else {
        console.log(`[DLT-SMS-READY] DLT SMS Compiled & Prepared for Sender: ${senderId}.`);
        return true;
      }
    } catch (err) {
      console.error('[DLT-SMS-ERROR] Failed to send SMS:', err);
      return false;
    }
  }

  /**
   * Integration point for Email Providers (e.g. SendGrid, Nodemailer)
   */
  private static async sendEmailGateway(email: string, subject: string, htmlContent: string): Promise<void> {
    const provider = process.env.EMAIL_PROVIDER || 'mock';
    if (provider === 'mock') {
      console.log(`[EMAIL-MOCK] Sent to ${email} (Subject: ${subject}): ${htmlContent}`);
    } else {
      // Production Email API calls (SendGrid / EMAIL_API_KEY)
    }
  }

  /**
   * Integration point for Push Notifications (e.g. Firebase Cloud Messaging)
   */
  private static async sendPushGateway(userId: number, title: string, message: string): Promise<void> {
    console.log(`[PUSH-MOCK] User ID ${userId}: ${title} - ${message}`);
  }
}
