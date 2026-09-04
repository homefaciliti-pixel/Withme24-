import { Model, DataTypes, Sequelize } from 'sequelize';

export class EmergencyContact extends Model {
  public id!: number;
  public name!: string;
  public contact_number!: string;
  public description!: string | null;
  public is_active!: boolean;
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
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        contact_number: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        description: {
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
        tableName: 'emergency_contacts',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
