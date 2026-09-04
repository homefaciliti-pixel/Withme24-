import { Model, DataTypes, Sequelize } from 'sequelize';

export class Review extends Model {
  public id!: number;
  public booking_id!: number;
  public customer_id!: number;
  public companion_id!: number;
  public rating!: number; // 1-5
  public comment!: string | null;
  public reply!: string | null;
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
        booking_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'bookings',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        customer_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
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
        rating: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
            max: 5,
          },
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        reply: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'reviews',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
