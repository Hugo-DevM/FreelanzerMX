export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Longitud mínima
  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  } else {
    score += 20;
  }

  // Longitud óptima
  if (password.length >= 12) {
    score += 10;
  }

  // Contiene mayúsculas
  if (!/[A-Z]/.test(password)) {
    errors.push("Debe contener al menos una letra mayúscula");
  } else {
    score += 15;
  }

  // Contiene minúsculas
  if (!/[a-z]/.test(password)) {
    errors.push("Debe contener al menos una letra minúscula");
  } else {
    score += 15;
  }

  // Contiene números
  if (!/\d/.test(password)) {
    errors.push("Debe contener al menos un número");
  } else {
    score += 15;
  }

  // Contiene caracteres especiales
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Debe contener al menos un carácter especial (!@#$%^&*)");
  } else {
    score += 15;
  }

  // Verificar patrones comunes débiles
  const weakPatterns = [
    /123456/,
    /password/,
    /qwerty/,
    /abc123/,
    /111111/,
    /000000/,
  ];

  const hasWeakPattern = weakPatterns.some(pattern => pattern.test(password.toLowerCase()));
  if (hasWeakPattern) {
    errors.push("La contraseña contiene patrones muy comunes");
    score -= 20;
  }

  // Verificar repetición de caracteres
  if (/(.)\1{2,}/.test(password)) {
    errors.push("No debe contener más de 2 caracteres repetidos consecutivos");
    score -= 10;
  }

  // Determinar fortaleza
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 70) {
    strength = 'strong';
  } else if (score >= 50) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.max(0, Math.min(100, score))
  };
};

export const getPasswordStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
  switch (strength) {
    case 'weak':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'strong':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

export const getPasswordStrengthText = (strength: 'weak' | 'medium' | 'strong') => {
  switch (strength) {
    case 'weak':
      return 'Débil';
    case 'medium':
      return 'Media';
    case 'strong':
      return 'Fuerte';
    default:
      return '';
  }
};

export const getPasswordRequirements = () => [
  "Mínimo 8 caracteres",
  "Al menos una letra mayúscula",
  "Al menos una letra minúscula", 
  "Al menos un número",
  "Al menos un carácter especial (!@#$%^&*)",
  "No usar patrones comunes",
  "No más de 2 caracteres repetidos consecutivos"
]; 