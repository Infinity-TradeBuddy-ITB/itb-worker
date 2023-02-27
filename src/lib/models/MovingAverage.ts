import { getModelForClass, prop } from '@typegoose/typegoose';

class MovingAverage {
  @prop()
  data: number[] = [];
  @prop()
  slowWindow: number = 0;
  @prop()
  fastWindow: number = 0;
  @prop()
  slowAverage: number = 0;
  @prop()
  fastAverage: number = 0;
  @prop()
  prevSlowAverage: number = 0;
  @prop()
  prevFastAverage: number = 0;
  @prop()
  buyFlag: boolean = false;
  @prop()
  sellFlag: boolean = false;

  public static newInstance(slowWindow: number, fastWindow: number) {
    const movingAverage = new MovingAverage();
    movingAverage.slowWindow = slowWindow;
    movingAverage.fastWindow = fastWindow;
    return movingAverage;
  }

  public static reloadInstance(prevMovingAverage: MovingAverage) {
    const currMovingAverage = new MovingAverage();
    
    currMovingAverage.data = prevMovingAverage.data;
    currMovingAverage.slowWindow = prevMovingAverage.slowWindow;
    currMovingAverage.fastWindow = prevMovingAverage.fastWindow;
    currMovingAverage.slowAverage = prevMovingAverage.slowAverage;
    currMovingAverage.fastAverage = prevMovingAverage.fastAverage;
    currMovingAverage.prevSlowAverage = prevMovingAverage.prevSlowAverage;
    currMovingAverage.prevFastAverage = prevMovingAverage.prevFastAverage;
    currMovingAverage.buyFlag = prevMovingAverage.buyFlag;
    currMovingAverage.sellFlag = prevMovingAverage.sellFlag;
    return currMovingAverage;
  }

  update(value: number) {
    // Add the new value to the data array
    this.data.push(value);

    // If the data array is larger than the slow window, remove the oldest value
    if (this.data.length > this.slowWindow) {
      this.data.shift();
    }

    // Calculate the slow moving average
    const slowSum = this.data.reduce((a, b) => a + b, 0);
    this.prevSlowAverage = this.slowAverage;
    this.slowAverage = slowSum / this.data.length;

    // If the data array is larger than the fast window, remove the oldest value
    if (this.data.length > this.fastWindow) {
      this.data.shift();
    }

    // Calculate the fast moving average
    const fastSum = this.data.reduce((a, b) => a + b, 0);
    this.prevFastAverage = this.fastAverage;
    this.fastAverage = fastSum / this.data.length;

    // Set buy and sell flags based on crossover of slow and fast moving averages
    if (this.prevFastAverage < this.prevSlowAverage && this.fastAverage >= this.slowAverage) {
      this.buyFlag = true;
      this.sellFlag = false;
    } else if (this.prevFastAverage > this.prevSlowAverage && this.fastAverage <= this.slowAverage) {
      this.buyFlag = false;
      this.sellFlag = true;
    } else {
      this.buyFlag = false;
      this.sellFlag = false;
    }
  }

  getSlowMovingAverage(): number {
    return this.slowAverage;
  }

  getFastMovingAverage(): number {
    return this.fastAverage;
  }

  getBuyFlag(): boolean {
    return this.buyFlag;
  }

  getSellFlag(): boolean {
    return this.sellFlag;
  }

  public static async logMovingAverage(movingAverage: MovingAverage) {
		const MovingAverageModel = getModelForClass(MovingAverage);
		await MovingAverageModel.create(movingAverage);
	}
}

export default getModelForClass(MovingAverage);