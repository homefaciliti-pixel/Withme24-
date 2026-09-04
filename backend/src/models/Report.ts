import { Model, DataTypes, Sequelize } from 'sequelize';

export class Report extends Model {
  public id!: number;
  public reporter_id!: number;
  public reported_user_id!: number;
  public booking_id!: number | null;
  public reason!: 'HARASSMENT' | 'UNSAFE_BEHAVIOUR' | 'FRAUD' | 'FAKE_PROFILE' | 'PROHIBITED_SERVICE' | 'THREAT' | 'ABUSE' | 'SCAM' | 'OTHER';
  public description!: string;
  public status!: 'OPEN' | 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'RESOLVED' | 'REJECTED';
  public reviewed_by!: number | null;
  public reviewed_at!: Date | null;
  public action_taken!: string | null;
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
        reporter_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        reported_user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        booking_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'bookings',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        reason: {
          type: DataTypes.ENUM(
            'HARASSMENT',
            'UNSAFE_BEHAVIOUR',
            'FRAUD',
            'FAKE_PROFILE',
            'PROHIBITED_SERVICE',
            'THREAT',
            'ABUSE',
            'SCAM',
            'OTHER'
          ),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('OPEN', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'REJECTED'),
          allowNull: false,
          defaultValue: 'OPEN',
        },
        reviewed_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        reviewed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        action_taken: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'reports',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
