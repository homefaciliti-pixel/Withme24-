import { Model, DataTypes, Sequelize } from 'sequelize';

export class KYCVerification extends Model {
  public id!: number;
  public user_id!: number;
  public document_type!: string; // e.g. "Aadhaar", "Passport", "Driving License"
  public document_status!: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'SUSPENDED';
  public document_front_url!: string;
  public document_back_url!: string | null;
  public selfie_url!: string;
  public verification_reference!: string | null;
  public submitted_at!: Date | null;
  public reviewed_at!: Date | null;
  public reviewed_by!: number | null;
  public rejection_reason!: string | null;
  public expiry_date!: Date | null;
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
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        document_type: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        document_status: {
          type: DataTypes.ENUM(
            'PENDING',
            'UNDER_REVIEW',
            'VERIFIED',
            'REJECTED',
            'EXPIRED',
            'SUSPENDED'
          ),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        document_front_url: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        document_back_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        selfie_url: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        verification_reference: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        submitted_at: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: DataTypes.NOW,
        },
        reviewed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        reviewed_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        rejection_reason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        expiry_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'kyc_verifications',
        underscored: true,
        timestamps: true,
      }
    );
  }
}
