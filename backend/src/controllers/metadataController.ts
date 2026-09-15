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
      let cities = await City.findAll({
        where: { is_active: true },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
      }).catch(() => []);

      if (!cities || cities.length === 0) {
        const defaultCities = [
          { name: 'Jaipur', is_active: true },
          { name: 'Delhi NCR', is_active: true },
          { name: 'Mumbai', is_active: true },
          { name: 'Bangalore', is_active: true },
          { name: 'Pune', is_active: true },
          { name: 'Hyderabad', is_active: true },
          { name: 'Chandigarh', is_active: true },
          { name: 'Udaipur', is_active: true },
        ];
        await City.bulkCreate(defaultCities).catch(() => {});
        cities = await City.findAll({
          where: { is_active: true },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']],
        }).catch(() => []);
      }

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
      let activities = await Activity.findAll({
        where: { is_active: true },
        attributes: ['id', 'name', 'description', 'image_url'],
        order: [['name', 'ASC']],
      }).catch(() => []);

      if (!activities || activities.length === 0) {
        const defaultActivities = [
          { name: 'WithMe Coffee & Conversation', description: 'Meet in a quiet cafe for warm coffee and friendly talks.', image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500', is_active: true },
          { name: 'WithMe City Walk', description: 'Explore historical sites, parks, and pathways together.', image_url: 'https://images.unsplash.com/photo-1517089596392-db9a5e8c8532?w=500', is_active: true },
          { name: 'WithMe Shopping Companion', description: 'Get a second opinion on fashion and navigate local markets.', image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500', is_active: true },
          { name: 'WithMe Movie / Entertainment', description: 'Watch the latest releases in a cinema or attend local theatre shows.', image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500', is_active: true },
          { name: 'WithMe Events & Shows', description: 'Attend art gallery openings, books launches, or stand-up shows.', image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500', is_active: true },
          { name: 'WithMe Sports & Fitness', description: 'A companion for morning badminton matches, golf, jogging, or gym sessions.', image_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500', is_active: true },
          { name: 'WithMe Hobbies & Activities', description: 'Join standard hobby classes like pottery, culinary, or painting sessions.', image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500', is_active: true },
          { name: 'WithMe Explore the City', description: 'Discover tourist attractions, street food hubs, and hidden gems.', image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500', is_active: true }
        ];
        await Activity.bulkCreate(defaultActivities).catch(() => {});
        activities = await Activity.findAll({
          where: { is_active: true },
          attributes: ['id', 'name', 'description', 'image_url'],
          order: [['name', 'ASC']],
        }).catch(() => []);
      }

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
