import { Request, Response } from 'express';
import { City, Activity } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuditService } from '../services/audit';

export class MetadataController {
  /**
   * GET /api/cities
   */
  public static async getCities(_req: Request, res: Response) {
    try {
      const cities = await City.findAll({
        where: { is_active: true },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
      });
      return res.status(200).json({ success: true, data: cities });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/activities
   */
  public static async getActivities(_req: Request, res: Response) {
    try {
      const activities = await Activity.findAll({
        where: { is_active: true },
        attributes: ['id', 'name', 'description', 'image_url'],
        order: [['name', 'ASC']],
      });
      return res.status(200).json({ success: true, data: activities });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // --- Admin Endpoints ---

  /**
   * POST /api/admin/cities
   */
  public static async createCity(req: AuthenticatedRequest, res: Response) {
    const { name, is_active } = req.body;
    const admin = req.user!;

    try {
      const existing = await City.findOne({ where: { name } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'City with this name already exists' });
      }

      const city = await City.create({ name, is_active: is_active ?? true });

      await AuditService.logAction({
        adminId: admin.id,
        action: 'CREATE_CITY',
        entityType: 'city',
        entityId: city.id,
        newValue: city,
      });

      return res.status(201).json({ success: true, message: 'City created successfully', data: city });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * PUT /api/admin/cities/:id
   */
  public static async updateCity(req: AuthenticatedRequest, res: Response) {
    const cityId = parseInt(req.params.id, 10);
    const { name, is_active } = req.body;
    const admin = req.user!;

    try {
      const city = await City.findByPk(cityId);
      if (!city) {
        return res.status(404).json({ success: false, message: 'City not found' });
      }

      const oldValue = { ...city.toJSON() };
      await city.update({ name, is_active });

      await AuditService.logAction({
        adminId: admin.id,
        action: 'UPDATE_CITY',
        entityType: 'city',
        entityId: city.id,
        oldValue,
        newValue: city,
      });

      return res.status(200).json({ success: true, message: 'City updated successfully', data: city });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/admin/activities
   */
  public static async createActivity(req: AuthenticatedRequest, res: Response) {
    const { name, description, image_url, is_active } = req.body;
    const admin = req.user!;

    try {
      const existing = await Activity.findOne({ where: { name } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Activity already exists' });
      }

      const activity = await Activity.create({
        name,
        description,
        image_url,
        is_active: is_active ?? true,
      });

      await AuditService.logAction({
        adminId: admin.id,
        action: 'CREATE_ACTIVITY',
        entityType: 'activity',
        entityId: activity.id,
        newValue: activity,
      });

      return res.status(201).json({ success: true, message: 'Activity created successfully', data: activity });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * PUT /api/admin/activities/:id
   */
  public static async updateActivity(req: AuthenticatedRequest, res: Response) {
    const activityId = parseInt(req.params.id, 10);
    const { name, description, image_url, is_active } = req.body;
    const admin = req.user!;

    try {
      const activity = await Activity.findByPk(activityId);
      if (!activity) {
        return res.status(404).json({ success: false, message: 'Activity not found' });
      }

      const oldValue = { ...activity.toJSON() };
      await activity.update({ name, description, image_url, is_active });

      await AuditService.logAction({
        adminId: admin.id,
        action: 'UPDATE_ACTIVITY',
        entityType: 'activity',
        entityId: activity.id,
        oldValue,
        newValue: activity,
      });

      return res.status(200).json({ success: true, message: 'Activity updated successfully', data: activity });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
