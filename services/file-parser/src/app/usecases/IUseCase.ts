
export type IUseCase<Input, Output> = (input : Input) => Promise<Output>;
export type IUseCaseFactory<Input, Output> = () => IUseCase<Input, Output>;