import { Model, DataTypes, Sequelize } from 'sequelize';

export class Availability extends Model {
  public id!: number;
  public companion_id!: number;
  public date!: string; // DATEONLY
  public start_time!: string; // e.g. "09:00"
  public end_time!: string; // e.g. "10:00"
  public is_booked!: boolean;
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
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        start_time: {
          type: DataTypes.STRING(5),
          allowNull: false,
        },
        end_time: {
          type: DataTypes.STRING(5),
          allowNull: false,
        },
        is_booked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'availability',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
