export class ApiResponseDto<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;

  constructor(success: boolean, data?: T, message?: string, error?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }

  static success<T>(
    data: T,
    message = 'Operation successful',
  ): ApiResponseDto<T> {
    return new ApiResponseDto<T>(true, data, message);
  }

  static error<T>(
    error: string,
    message = 'Operation failed',
  ): ApiResponseDto<T> {
    return new ApiResponseDto<T>(false, undefined, message, error);
  }
}
