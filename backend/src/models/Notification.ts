import { Model, DataTypes, Sequelize } from 'sequelize';

export class Notification extends Model {
  public id!: number;
  public user_id!: number;
  public title!: string;
  public message!: string;
  public channel!: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
  public status!: 'UNREAD' | 'READ';
  public read_at!: Date | null;
  public readonly created_at!: Date;

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
        title: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        channel: {
          type: DataTypes.ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH'),
          allowNull: false,
          defaultValue: 'IN_APP',
        },
        status: {
          type: DataTypes.ENUM('UNREAD', 'READ'),
          allowNull: false,
          defaultValue: 'UNREAD',
        },
        read_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'notifications',
        underscored: true,
        timestamps: true,
        updatedAt: false,
      }
    );
  }
}
