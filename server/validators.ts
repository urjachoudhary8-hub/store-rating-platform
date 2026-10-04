// Validation rules strictly following requirements:
// Name: Min 20 characters, Max 60 characters.
// Address: Max 400 characters.
// Password: 8-16 characters, must include at least one uppercase letter and one special character.
// Email: Must follow standard email validation rules.
// Rating: Integer between 1 and 5.

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }
  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validateName(name: string): string | null {
  if (!name || typeof name !== 'string') {
    return 'Name is required';
  }
  const trimmed = name.trim();
  if (trimmed.length < 20) {
    return `Name must be at least 20 characters (current length: ${trimmed.length})`;
  }
  if (trimmed.length > 60) {
    return `Name must not exceed 60 characters (current length: ${trimmed.length})`;
  }
  return null;
}

export function validateStoreName(name: string): string | null {
  if (!name || typeof name !== 'string') {
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
  if (address === undefined || address === null || typeof address !== 'string') {
    return 'Address is required';
  }
  const trimmed = address.trim();
  if (trimmed.length === 0) {
    return 'Address cannot be empty';
  }
  if (trimmed.length > 400) {
    return `Address must not exceed 400 characters (current length: ${trimmed.length})`;
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  if (password.length < 8 || password.length > 16) {
    return `Password must be 8-16 characters long (current length: ${password.length})`;
  }
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return 'Password must include at least one uppercase letter (A-Z)';
  }
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  if (!hasSpecialChar) {
    return 'Password must include at least one special character (!@#$%^&*...)';
  }
  return null;
}

export function validateRating(rating: unknown): string | null {
  const num = Number(rating);
  if (isNaN(num) || !Number.isInteger(num)) {
    return 'Rating must be an integer between 1 and 5';
  }
  if (num < 1 || num > 5) {
    return 'Rating must be between 1 and 5';
  }
  return null;
}
