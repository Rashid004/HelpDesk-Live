export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string | undefined;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export class ApiValidationError extends Error {
  public readonly errorCode: string | undefined;
  public readonly validationErrors: Record<string, string | string[]>;

  constructor(
    validationErrors: Record<string, string | string[]>,
    errorCode?: string,
  ) {
    super("Validation Error");
    this.name = "ApiValidationError";
    this.validationErrors = validationErrors;
    this.errorCode = errorCode;
  }
}
