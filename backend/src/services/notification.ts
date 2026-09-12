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
    const provider = (process.env.SMS_PROVIDER || 'jio').toLowerCase();

    const entityId = process.env.SMS_ENTITY_ID || '1201173444411453897';
    const dltTemplateId = process.env.SMS_DLT_TEMPLATE_ID || '1207173589889308632';
    const senderId = process.env.SMS_SENDER_ID || 'HMFCLI';
    const templateText = process.env.SMS_TEMPLATE_TEXT || 'Your OTP for registering on Superhome is: {#var#}. This code is valid for the next 10 minutes. Thank You, Super Home';

    // Format DLT message template with strict character matching
    let formattedMessage = message;
    if (otpCode) {
      formattedMessage = templateText
        .replace('{#var#}', otpCode)
        .replace('{var}', otpCode)
        .replace('{{otp}}', otpCode);
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    console.log(`[DLT-SMS-DISPATCH] Mobile: ${cleanMobile} | Provider: ${provider} | SenderID: ${senderId} | TemplateID: ${dltTemplateId}`);
    console.log(`[DLT-SMS-BODY] "${formattedMessage}"`);

    if (provider === 'mock') {
      console.log(`[SMS-MOCK] Dispatch simulation complete for ${cleanMobile}`);
      return true;
    }

    try {
      const apiKey = process.env.SMS_API_KEY || process.env.JIO_API_KEY || process.env.FAST2SMS_API_KEY || '';

      // 1. Custom HTTP GET/POST URL API Gateway
      if (process.env.SMS_API_URL && process.env.SMS_API_URL.includes('{mobile}')) {
        const customUrl = process.env.SMS_API_URL
          .replace('{mobile}', cleanMobile)
          .replace('{message}', encodeURIComponent(formattedMessage))
          .replace('{otp}', otpCode || '')
          .replace('{sender}', senderId)
          .replace('{template}', dltTemplateId);

        console.log(`[CUSTOM-SMS-GET] Calling Gateway URL: ${customUrl}`);
        const response = await fetch(customUrl);
        const resText = await response.text();
        console.log(`[CUSTOM-SMS-RESPONSE] Code ${response.status}:`, resText);
        return response.ok;
      }

      // 2. Fast2SMS DLT Provider
      if (provider === 'fast2sms') {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'dlt',
            sender_id: senderId,
            message: dltTemplateId,
            variables_values: otpCode || '',
            numbers: cleanMobile,
          }),
        });
        const resJson: any = await response.json().catch(() => ({}));
        console.log('[FAST2SMS-DLT-RESPONSE]', resJson);
        return Boolean(response.ok && resJson.return === true);
      }

      // 3. Jio Trueconnect DLT Provider (Default)
      const apiUrl = process.env.SMS_API_URL || 'https://trueconnect.jio.com/api/v2/SendSMS';

      if (apiKey && apiKey !== 'mockSmsApiKey123') {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': apiKey,
          },
          body: JSON.stringify({
            username: process.env.JIO_USERNAME || apiKey,
            password: process.env.JIO_PASSWORD || '',
            route: 'dlt',
            sender_id: senderId,
            header: senderId,
            template_id: dltTemplateId,
            message: formattedMessage,
            variables_values: otpCode || '',
            numbers: cleanMobile,
            mobile: cleanMobile,
            entity_id: entityId,
          }),
        });

        const resJson: any = await response.json().catch(() => ({ success: response.ok }));
        console.log('[JIO-DLT-SMS-RESPONSE]', resJson);
        return Boolean(response.ok && resJson && (resJson.return === true || resJson.status === 'success' || resJson.success === true || resJson.code === 200 || resJson.code === '200'));
      } else {
        console.warn(`[SMS-GATEWAY-NOTICE] Live SMS API Key missing in environment variables. DLT SMS compiled for Sender: ${senderId} (Template: ${dltTemplateId}). Add SMS_API_KEY on Render to send live SMS to handsets.`);
        return true;
      }
    } catch (err) {
      console.error('[SMS-GATEWAY-ERROR] Exception sending SMS:', err);
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
