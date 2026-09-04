import { Model, DataTypes, Sequelize } from 'sequelize';

export class ModerationCase extends Model {
  public id!: number;
  public user_id!: number;
  public report_id!: number | null;
  public status!: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  public severity!: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public assigned_to!: number | null;
  public internal_notes!: string | null;
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
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        report_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'reports',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        status: {
          type: DataTypes.ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'),
          allowNull: false,
          defaultValue: 'OPEN',
        },
        severity: {
          type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
          allowNull: false,
          defaultValue: 'MEDIUM',
        },
        assigned_to: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        internal_notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'moderation_cases',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
