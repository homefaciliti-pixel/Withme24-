import { Model, DataTypes, Sequelize } from 'sequelize';

export class Block extends Model {
  public id!: number;
  public blocker_id!: number;
  public blocked_id!: number;
  public readonly created_at!: Date;
  public blocked?: any;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        blocker_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        blocked_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
      },
      {
        sequelize,
        tableName: 'blocks',
        underscored: true,
        timestamps: true,
        updatedAt: false,
      }
    );
  }
}
