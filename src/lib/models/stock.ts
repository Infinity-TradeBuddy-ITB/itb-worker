import { BuysAndSells, Fluctuations, Stock as StockInterface } from 'itb-types';
import { getModelForClass, prop } from '@typegoose/typegoose';

const currentDate = new Date();
currentDate.setHours(17, 55, 0, 0);

export class Stock implements StockInterface {

	// today at 5:55pm
	@prop()
	breakPoint!: Date;
	@prop()
	closingTime?: Date;

	// start values
	@prop()
	startFounds!: number;
	@prop()
	founds!: number;
	@prop()
	currFounds: number = 0;

	// flags
	@prop()
	stockName!: string;
	@prop()
	holding: boolean = false;
	@prop()
	reasonable: boolean = false;

	// sells
	@prop()
	currPossibleWin: number = 0;
	@prop()
	lastSell: number = 0;

	// fluctuations
	@prop()
	openValue!: number;
	@prop()
	minFluct!: number;
	@prop()
	maxFluct!: number;
	@prop()
	prevFluct!: number;
	@prop()
	currFluct!: number;

	// counters
	@prop()
	index: number = -1;
	@prop()
	total: number = 0;
	@prop()
	tradeCount: number = 0;
	@prop()
	positiveCounter: number = 0;
	@prop()
	negativeCounter: number = 0;
	@prop()
	transactionsNumber: number = 0;

	// arrays for data control
	@prop()
	currFoundsBellowStartVal: number[] = [];
	@prop()
	buysAndSells: BuysAndSells[] = [];
	@prop()
	positiveFluctuations: Fluctuations[] = [];
	@prop()
	negativeFluctuations: Fluctuations[] = [];
	@prop()
	sells: number[] = [];
	@prop()
	closeValues: number[] = [];

	// holds
	@prop()
	holds: number[] = [];

	// exited
	@prop()
	exited: boolean = false;

	// log
	@prop()
	log: string = '';

	public static newInstance(stockName: string | undefined, openValue: number | undefined, startFounds: number | undefined): Stock {
		const stock = new Stock();
		stock.breakPoint = currentDate; 
		stock.stockName = stockName ?? '';
		stock.startFounds = startFounds === null || startFounds === undefined ? 100000 : startFounds;
		stock.founds = startFounds === null || startFounds === undefined ? 100000 : startFounds;
		stock.openValue = openValue ?? 0;
		stock.minFluct = openValue ?? 0;
		stock.maxFluct = openValue ?? 0;
		stock.prevFluct = openValue ?? 0;
		stock.currFluct = openValue ?? 0;
		return stock;
	}

	public static async logStock(stock: Stock) {
		const StockModel = getModelForClass(Stock);
		await StockModel.create(stock);
	}
}

export default getModelForClass(Stock);