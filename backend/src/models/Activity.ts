import { Model, DataTypes, Sequelize } from 'sequelize';

export class Activity extends Model {
  declare public id: number;
  declare public name: string;
  declare public description: string | null;
  declare public image_url: string | null;
  declare public is_active: boolean;
  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        image_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        tableName: 'activities',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
