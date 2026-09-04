import { Response } from 'express';
import { Notification } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

export class NotificationController {
  /**
   * GET /api/notifications
   */
  public static async getNotifications(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;

    try {
      const notifications = await Notification.findAll({
        where: { user_id: user.id },
        order: [['created_at', 'DESC']],
        limit: 50,
      });

      return res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * PUT /api/notifications/:id/read
   */
  public static async markAsRead(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);

    try {
      const notification = await Notification.findOne({
        where: { id, user_id: user.id },
      });

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      await notification.update({ status: 'READ', read_at: new Date() });

      return res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * PUT /api/notifications/read-all
   */
  public static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;

    try {
      await Notification.update(
        { status: 'READ', read_at: new Date() },
        { where: { user_id: user.id, status: 'UNREAD' } }
      );

      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
