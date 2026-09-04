import { Model, DataTypes, Sequelize } from 'sequelize';

export class City extends Model {
  declare public id: number;
  declare public name: string;
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
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        tableName: 'cities',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
