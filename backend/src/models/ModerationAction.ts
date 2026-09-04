import { Model, DataTypes, Sequelize } from 'sequelize';

export class ModerationAction extends Model {
  public id!: number;
  public case_id!: number;
  public action_type!: 'WARN' | 'SUSPEND' | 'BAN' | 'RESTORE' | 'CONTENT_REMOVAL';
  public reason!: string;
  public duration_days!: number | null; // Nullable for bans, warnings, or removals
  public performed_by!: number;
  public readonly created_at!: Date;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        case_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'moderation_cases',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        action_type: {
          type: DataTypes.ENUM('WARN', 'SUSPEND', 'BAN', 'RESTORE', 'CONTENT_REMOVAL'),
          allowNull: false,
        },
        reason: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        duration_days: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        performed_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'RESTRICT',
        },
      },
      {
        sequelize,
        tableName: 'moderation_actions',
        underscored: true,
        timestamps: true,
        updatedAt: false,
      }
    );
  }
}
