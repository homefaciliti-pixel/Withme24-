import { Model, DataTypes, Sequelize } from 'sequelize';

export class CompanionActivity extends Model {
  public id!: number;
  public companion_id!: number;
  public activity_id!: number;
  public price_per_hour!: number;
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
        companion_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'companion_profiles',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        activity_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'activities',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        price_per_hour: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'companion_activities',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
