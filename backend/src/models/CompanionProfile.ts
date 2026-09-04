import { Model, DataTypes, Sequelize } from 'sequelize';

export class CompanionProfile extends Model {
  public id!: number;
  public user_id!: number;
  public bio!: string | null;
  public experience!: string | null;
  public response_rate!: number;
  public verification_status!: 'NOT_STARTED' | 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'SUSPENDED';
  public rating!: number;
  public total_reviews!: number;
  public total_bookings!: number;
  public is_available!: boolean;
  public profile_visibility!: 'PUBLIC' | 'PRIVATE';
  public user?: any;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        bio: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        experience: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        response_rate: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 100,
        },
        verification_status: {
          type: DataTypes.ENUM(
            'NOT_STARTED',
            'PENDING',
            'UNDER_REVIEW',
            'VERIFIED',
            'REJECTED',
            'EXPIRED',
            'SUSPENDED'
          ),
          allowNull: false,
          defaultValue: 'NOT_STARTED',
        },
        rating: {
          type: DataTypes.DECIMAL(3, 2),
          allowNull: false,
          defaultValue: 0.00,
        },
        total_reviews: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        total_bookings: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        is_available: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        profile_visibility: {
          type: DataTypes.ENUM('PUBLIC', 'PRIVATE'),
          allowNull: false,
          defaultValue: 'PRIVATE',
        },
      },
      {
        sequelize,
        tableName: 'companion_profiles',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
