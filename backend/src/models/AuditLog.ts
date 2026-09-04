import { Model, DataTypes, Sequelize } from 'sequelize';

export class AuditLog extends Model {
  public id!: number;
  public admin_id!: number;
  public action!: string;
  public entity_type!: string;
  public entity_id!: number | null;
  public old_value!: string | null; // JSON Stringified
  public new_value!: string | null; // JSON Stringified
  public ip_address!: string | null;
  public user_agent!: string | null;
  public readonly created_at!: Date;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        admin_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        entity_type: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        entity_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        old_value: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        new_value: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        ip_address: {
          type: DataTypes.STRING(45),
          allowNull: true,
        },
        user_agent: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'audit_logs',
        underscored: true,
        timestamps: true,
        updatedAt: false,
      }
    );
  }
}
