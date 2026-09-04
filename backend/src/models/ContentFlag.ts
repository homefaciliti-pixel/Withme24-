import { Model, DataTypes, Sequelize } from 'sequelize';

export class ContentFlag extends Model {
  public id!: number;
  public entity_type!: 'PROFILE' | 'REVIEW' | 'ACTIVITY' | 'MESSAGE';
  public entity_id!: number;
  public reason!: string;
  public flagged_by!: number;
  public status!: 'PENDING' | 'APPROVED' | 'REJECTED';
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
        entity_type: {
          type: DataTypes.ENUM('PROFILE', 'REVIEW', 'ACTIVITY', 'MESSAGE'),
          allowNull: false,
        },
        entity_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        reason: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        flagged_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
      },
      {
        sequelize,
        tableName: 'content_flags',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
