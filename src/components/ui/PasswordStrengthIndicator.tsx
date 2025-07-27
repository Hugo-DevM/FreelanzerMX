import React from 'react';
import { 
  PasswordValidationResult, 
  getPasswordStrengthColor, 
  getPasswordStrengthText 
} from '../../utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidationResult;
  showDetails?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  validation,
  showDetails = true
}) => {
  const { score, strength, errors } = validation;
  
  const getBarColor = () => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBarWidth = () => {
    return `${score}%`;
  };

  return (
    <div className="space-y-2">
      {/* Barra de progreso */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getBarColor()}`}
            style={{ width: getBarWidth() }}
          />
        </div>
        <span className={`text-sm font-medium ${getPasswordStrengthColor(strength)}`}>
          {getPasswordStrengthText(strength)}
        </span>
      </div>

      {/* Detalles de errores */}
      {showDetails && errors.length > 0 && (
        <div className="text-xs text-red-600 space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-1">
              <span>•</span>
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Puntuación numérica (opcional) */}
      {showDetails && (
        <div className="text-xs text-gray-500">
          Fortaleza: {score}/100
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator; 