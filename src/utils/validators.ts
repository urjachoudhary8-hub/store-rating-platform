// Form Validations:
// ● Name: Min 20 characters, Max 60 characters.
// ● Address: Max 400 characters.
// ● Password: 8-16 characters, must include at least one uppercase letter and one special character.
// ● Email: Must follow standard email validation rules.
// ● Rating: Between 1 to 5.

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validateName(name: string): string | null {
  if (!name || !name.trim()) {
    return 'Full name is required';
  }
  const trimmed = name.trim();
  if (trimmed.length < 20) {
    return `Name must be at least 20 characters (current: ${trimmed.length}/20)`;
  }
  if (trimmed.length > 60) {
    return `Name must not exceed 60 characters (current: ${trimmed.length}/60)`;
  }
  return null;
}

export function validateStoreName(name: string): string | null {
  if (!name || !name.trim()) {
    return 'Store name is required';
  }
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return 'Store name must be at least 3 characters';
  }
  if (trimmed.length > 60) {
    return 'Store name must not exceed 60 characters';
  }
  return null;
}

export function validateAddress(address: string): string | null {
  if (!address || !address.trim()) {
    return 'Address is required';
  }
  const trimmed = address.trim();
  if (trimmed.length > 400) {
    return `Address must not exceed 400 characters (current: ${trimmed.length}/400)`;
  }
  return null;
}

export interface PasswordRuleStatus {
  hasLength: boolean;
  hasUppercase: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
}

export function checkPasswordRules(password: string): PasswordRuleStatus {
  const hasLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

  return {
    hasLength,
    hasUppercase,
    hasSpecialChar,
    isValid: hasLength && hasUppercase && hasSpecialChar,
  };
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8 || password.length > 16) {
    return `Password must be between 8 and 16 characters (current: ${password.length})`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z)';
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*...)';
  }
  return null;
}

export function validateRating(rating: number): string | null {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return 'Rating must be a number';
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return 'Rating must be an integer between 1 and 5';
  }
  return null;
}
