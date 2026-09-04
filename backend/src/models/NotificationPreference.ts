import { Model, DataTypes, Sequelize } from 'sequelize';

export class NotificationPreference extends Model {
  public id!: number;
  public user_id!: number;
  public channel!: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
  public enabled!: boolean;
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
        channel: {
          type: DataTypes.ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH'),
          allowNull: false,
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        tableName: 'notification_preferences',
        underscored: true,
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['user_id', 'channel'],
          },
        ],
      }
    );
  }
}
