// Export all models for easy importing
import User from './User';
import Barangay from './Barangay';
import Crime from './Crime';
// import Prediction from './Prediction'; // Commented out due to naming conflict
import Prescription from './Prescription';
import AuditLog from './AuditLog';
import { Prediction as NewPrediction, type IPrediction, type IForecastPoint } from './Prediction';
import { Recommendation, type IRecommendation } from './Recommendation';
import ImportHistory, { type IImportHistory } from './ImportHistory';

export {
  User,
  Barangay,
  Crime,
  // Prediction, // Commented out due to naming conflict
  Prescription,
  AuditLog,
  NewPrediction,
  Recommendation
};

export type {
  IPrediction,
  IForecastPoint,
  IRecommendation,
  IImportHistory
};

export default {
  User,
  Barangay,
  Crime,
  // Prediction, // Commented out due to naming conflict
  Prescription,
  AuditLog,
  NewPrediction,
  Recommendation,
  ImportHistory
};
