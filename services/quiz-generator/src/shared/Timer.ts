export class Timer {
  private endTime : Date | undefined;
  private constructor(private startTime : Date) {}

  static start(){
    return new Timer(new Date());
  }

  public stop(unit: TimeUnit = TimeUnit.MILLISECOND) {
    this.endTime = new Date();
    return this.getDuration(unit)
  }

  public getDuration(unit: TimeUnit = TimeUnit.MILLISECOND) {
    if(!this.endTime) throw new Error("Timer not stopped");
    const msDuration = this.endTime.getTime() - this.startTime.getTime();
    return convertTime(msDuration, TimeUnit.MILLISECOND, unit);
  }

  static async measure<T>(fn: () => T | Promise<T>, unit : TimeUnit): Promise<{ result: T; duration: number }> {
    const timer = Timer.start();
    const result = await fn();
    const duration = timer.stop(unit);
    return { result, duration };
  }
}

export enum TimeUnit {
  MILLISECOND = "ms",
  SECOND = "s",
  MINUTE = "m",
  HOUR = "h",
}

export function convertTime(value : number, fromUnit: TimeUnit, toUnit: TimeUnit): number {
  if(fromUnit === toUnit) return value;
  const conversionFactors: { [key in TimeUnit]: number } = {
    [TimeUnit.MILLISECOND]: 1,
    [TimeUnit.SECOND]: 1000,
    [TimeUnit.MINUTE]: 60 * 1000,
    [TimeUnit.HOUR]: 60 * 60 * 1000,
  };
  return (value * conversionFactors[fromUnit]) / conversionFactors[toUnit];
}