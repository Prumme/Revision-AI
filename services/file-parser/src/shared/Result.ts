export type Result<T> = Success<T> | Failure;

class Failure {
  readonly type = "failure";
  readonly success = false;
  constructor(public readonly error: Error) {}
}

class Success<T> {
  readonly type = "success";
  readonly success = true;
  constructor(public readonly value: T) {}
}

// Factory
export const Result = {
  Failure: (error: Error): Result<never> => new Failure(error),

  Success: <T>(value: T): Result<T> => new Success(value),

  SuccessNoValue: (): Result<void> => new Success(undefined),

  SuccessOptional: <T>(value?: T | null): Result<T | null> => new Success(value ?? null),
};

// Type Guards
function isFailure<T>(result: Result<T>): result is Failure {
  return result.type === "failure";
}

function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.type === "success";
}