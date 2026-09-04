import { Model, DataTypes, Sequelize } from 'sequelize';

export class SystemSetting extends Model {
  public id!: number;
  public key!: string;
  public value!: string;
  public description!: string | null;
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
        key: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        value: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'system_settings',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
