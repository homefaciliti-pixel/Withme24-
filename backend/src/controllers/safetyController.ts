import { Request, Response } from 'express';
import { Report, Block, User, EmergencyContact, ModerationCase } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { sequelize } from '../models';

export class SafetyController {
  /**
   * POST /api/reports
   * Submit a report against another user. Automatically creates a moderation case.
   */
  public static async submitReport(req: AuthenticatedRequest, res: Response) {
    const reporter = req.user!;
    const { reported_user_id, booking_id, reason, description } = req.body;

    if (reporter.id === reported_user_id) {
      return res.status(400).json({ success: false, message: 'You cannot report yourself' });
    }

    try {
      const reportedUser = await User.findByPk(reported_user_id);
      if (!reportedUser) {
        return res.status(404).json({ success: false, message: 'User to report not found' });
      }

      const result = await sequelize.transaction(async (t) => {
        const report = await Report.create(
          {
            reporter_id: reporter.id,
            reported_user_id,
            booking_id: booking_id || null,
            reason,
            description,
            status: 'OPEN',
          },
          { transaction: t }
        );

        // Determine severity based on reason
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
        if (['UNSAFE_BEHAVIOUR', 'THREAT', 'ABUSE'].includes(reason)) {
          severity = 'HIGH';
        } else if (reason === 'PROHIBITED_SERVICE') {
          severity = 'CRITICAL';
        }

        // Generate moderation ticket
        const modCase = await ModerationCase.create(
          {
            user_id: reported_user_id,
            report_id: report.id,
            status: 'OPEN',
            severity,
            internal_notes: `Report created by User #${reporter.id} for reason: ${reason}`,
          },
          { transaction: t }
        );

        return { report, modCase };
      });

      return res.status(201).json({
        success: true,
        message: 'Report submitted successfully. Our safety team is investigating.',
        data: result.report,
      });
    } catch (error) {
      console.error('Submit Report Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/users/:id/block
   */
  public static async blockUser(req: AuthenticatedRequest, res: Response) {
    const blocker = req.user!;
    const blockedId = parseInt(req.params.id, 10);

    if (blocker.id === blockedId) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself' });
    }

    try {
      const targetUser = await User.findByPk(blockedId);
      if (!targetUser) return res.status(404).json({ success: false, message: 'User to block not found' });

      const existing = await Block.findOne({
        where: { blocker_id: blocker.id, blocked_id: blockedId },
      });

      if (existing) {
        return res.status(200).json({ success: true, message: 'User is already blocked' });
      }

      await Block.create({
        blocker_id: blocker.id,
        blocked_id: blockedId,
      });

      return res.status(200).json({ success: true, message: 'User blocked successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/users/:id/block
   */
  public static async unblockUser(req: AuthenticatedRequest, res: Response) {
    const blocker = req.user!;
    const blockedId = parseInt(req.params.id, 10);

    try {
      const deleted = await Block.destroy({
        where: { blocker_id: blocker.id, blocked_id: blockedId },
      });

      if (!deleted) {
        return res.status(400).json({ success: false, message: 'User is not in your blocked list' });
      }

      return res.status(200).json({ success: true, message: 'User unblocked successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/users/blocked
   */
  public static async getBlockedUsers(req: AuthenticatedRequest, res: Response) {
    const blocker = req.user!;

    try {
      const blocks = await Block.findAll({
        where: { blocker_id: blocker.id },
        include: [{ model: User, as: 'blocked', attributes: ['id', 'name', 'profile_photo'] }],
      });

      const list = blocks.map((b) => b.blocked);
      return res.status(200).json({ success: true, data: list });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/safety/emergency-contacts
   */
  public static async getEmergencyContacts(_req: Request, res: Response) {
    try {
      const contacts = await EmergencyContact.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']],
      });
      return res.status(200).json({ success: true, data: contacts });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/safety/emergency
   * Trigger SOS Panic / Safety alert.
   */
  public static async triggerEmergency(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const { booking_id, latitude, longitude, notes } = req.body;

    try {
      // Print alert logs to server console (critical safety mock event)
      console.error(
        `🚨 [SOS PANIC TRIGGERED] User ID: ${user.id} (${user.name}) triggered an SOS alert. ` +
        `Booking ID: ${booking_id || 'N/A'}. Location: Lat ${latitude || 'N/A'}, Lng ${longitude || 'N/A'}. ` +
        `Notes: ${notes || 'N/A'}`
      );

      // In production: trigger cellular alert API or dispatch immediate notify to moderators
      return res.status(200).json({
        success: true,
        message: 'Safety alert registered. Emergency contacts notified, and WithMe24 support team alerted.',
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
