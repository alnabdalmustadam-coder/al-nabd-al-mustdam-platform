import 'server-only';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError('صيغة البيانات المرسلة غير صحيحة');
  }
  return value as Record<string, unknown>;
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  try {
    return asObject(await request.json());
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('تعذر قراءة بيانات الطلب');
  }
}

export function cleanString(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; optional?: boolean } = {},
): string | undefined {
  const { min = 1, max = 500, optional = false } = options;
  if (value === undefined || value === null || value === '') {
    if (optional) return undefined;
    throw new ValidationError(`${fieldName} مطلوب`);
  }
  if (typeof value !== 'string') throw new ValidationError(`${fieldName} غير صالح`);
  const result = value.trim();
  if (result.length < min || result.length > max) {
    throw new ValidationError(`${fieldName} يجب أن يكون بين ${min} و${max} حرفاً`);
  }
  return result;
}

export function cleanEmail(value: unknown, fieldName = 'البريد الإلكتروني'): string {
  const email = cleanString(value, fieldName, { max: 254 })!.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError(`${fieldName} غير صالح`);
  }
  return email;
}

export function cleanSlug(value: unknown, fieldName = 'المعرّف'): string {
  const slug = cleanString(value, fieldName, { max: 120 })!.toLowerCase();
  if (!/^[a-z0-9\u0600-\u06ff]+(?:[-_][a-z0-9\u0600-\u06ff]+)*$/u.test(slug)) {
    throw new ValidationError(`${fieldName} يحتوي على رموز غير مسموحة`);
  }
  return slug;
}

export function cleanUuid(value: unknown, fieldName = 'المعرّف'): string {
  const id = cleanString(value, fieldName, { max: 36 })!;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new ValidationError(`${fieldName} غير صالح`);
  }
  return id;
}

export function cleanInteger(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; defaultValue?: number } = {},
): number {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, defaultValue } = options;
  const parsed = value === '' || value === undefined || value === null ? defaultValue : Number(value);
  if (parsed === undefined || !Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new ValidationError(`${fieldName} غير صالح`);
  }
  return parsed;
}

export function cleanNumber(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; defaultValue?: number } = {},
): number {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, defaultValue } = options;
  const parsed = value === '' || value === undefined || value === null ? defaultValue : Number(value);
  if (parsed === undefined || !Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new ValidationError(`${fieldName} غير صالح`);
  }
  return parsed;
}

export function cleanBoolean(value: unknown, defaultValue = false): boolean {
  return typeof value === 'boolean' ? value : defaultValue;
}

export function cleanStringArray(value: unknown, fieldName: string, maxItems = 50): string[] {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new ValidationError(`${fieldName} غير صالح`);
  }
  return value.map((item, index) => cleanString(item, `${fieldName} ${index + 1}`, { max: 500 })!);
}

export function oneOf<T extends string>(value: unknown, values: readonly T[], fieldName: string): T {
  if (typeof value !== 'string' || !values.includes(value as T)) {
    throw new ValidationError(`${fieldName} غير صالح`);
  }
  return value as T;
}

export function safeErrorMessage(error: unknown, fallback = 'حدث خطأ غير متوقع'): string {
  return error instanceof ValidationError ? error.message : fallback;
}
