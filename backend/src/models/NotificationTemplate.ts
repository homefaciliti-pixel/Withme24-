import { Model, DataTypes, Sequelize } from 'sequelize';

export class NotificationTemplate extends Model {
  public id!: number;
  public template_key!: string;
  public channel!: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
  public title!: string;
  public message!: string;
  public variables!: string | null; // JSON Stringified array of variable names e.g. ["user_name", "booking_number"]
  public status!: 'ACTIVE' | 'INACTIVE';
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
        template_key: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        channel: {
          type: DataTypes.ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH'),
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        variables: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },
      },
      {
        sequelize,
        tableName: 'notification_templates',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
