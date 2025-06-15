export type UseCase<Input, Output> = (input: Input) => Output;

export type UseCaseFactory<T extends UseCase<any, any>, Args extends any[]> = (
  ...args: Args
) => T;
