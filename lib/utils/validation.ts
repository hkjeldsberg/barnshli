export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Ensures a date string is not in the future. */
export function validateDateNotFuture(dateStr: string): ValidationResult {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Please enter a valid date." };
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) {
    return { valid: false, error: "Date cannot be in the future." };
  }
  return { valid: true };
}

/** Ensures a measurement date is not before the child's date of birth. */
export function validateDateNotBeforeDOB(
  dateStr: string,
  dobStr: string,
): ValidationResult {
  const date = new Date(dateStr);
  const dob = new Date(dobStr);
  if (isNaN(date.getTime()) || isNaN(dob.getTime())) {
    return { valid: false, error: "Please enter a valid date." };
  }
  if (date < dob) {
    return {
      valid: false,
      error: "Measurement date cannot be before the child's date of birth.",
    };
  }
  return { valid: true };
}

/** Validates a weight value in kg for ages 0–5 (plausible range: 0–100 kg). */
export function validateWeight(kg: number): ValidationResult {
  if (kg <= 0 || kg > 100) {
    return {
      valid: false,
      error: "Weight must be between 0.1 kg and 100 kg.",
    };
  }
  return { valid: true };
}

/** Validates a height value in cm for ages 0–5 (plausible range: 0–130 cm). */
export function validateHeight(cm: number): ValidationResult {
  if (cm <= 0 || cm > 130) {
    return {
      valid: false,
      error: "Height must be between 0.1 cm and 130 cm.",
    };
  }
  return { valid: true };
}

/** Validates that a text value falls within the allowed length range. */
export function validateTextLength(
  text: string,
  min: number,
  max: number,
): ValidationResult {
  const trimmed = text.trim();
  if (trimmed.length < min) {
    return {
      valid: false,
      error:
        min === 1
          ? "This field is required."
          : `Must be at least ${min} characters.`,
    };
  }
  if (trimmed.length > max) {
    return {
      valid: false,
      error: `Must be ${max} characters or fewer.`,
    };
  }
  return { valid: true };
}
