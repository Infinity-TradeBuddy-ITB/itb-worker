import fs from 'fs';
import * as path from 'path';
import protobuf from 'protobufjs';
import { Fluctuations, Stock } from '../models/Stock.js';

const date = new Date();
export const dateString = date.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: '2-digit'
}).replace(/\//g, '-');

export const rootPath = `./`;
export const connectionString = 'mongodb://localhost:27017/';
export const dbName = 'itb_db';
export const publicStockFolder = `./public/stocks/`;
export const errorsDir = `./public/errors/`;
export const stockTickers = `stock_tickers/`;
export const stocksData = `stocks_data/${dateString}`;
export const dailyResults = `daily_results/`
export const dailyResultsDir = `${publicStockFolder}${dailyResults}/${dateString}`;

export const makeTodaysDir = () => {
  if (!fs.existsSync(dailyResultsDir)) {
    fs.mkdirSync(dailyResultsDir);
  }
  if (!fs.existsSync(errorsDir + dateString)) {
    fs.mkdirSync(errorsDir + dateString);
    [1, 2, 3, 4, 5].forEach((index) => {
      fs.writeFileSync(`${errorsDir}${dateString}/worker_${index}_errors.log`, ``);
    });
  }
}

export const buildFilePath = (processArgv: string | undefined) => {
  return (processArgv != undefined) ?
    path.join(publicStockFolder, stockTickers, `stocks_${processArgv}.json`)
    : undefined;
}

export const buildDataFilePath = (stockSymbol: string | undefined) => {
  const filePath = path.join(publicStockFolder, stocksData, `${stockSymbol}.json`);

  try {
    fs.accessSync(filePath);
    return filePath;
  } catch (error) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    } catch (error) {
      console.log(`Directory does not exists: ${path.dirname(filePath)}`)
      console.log(error);
    }

    fs.writeFileSync(filePath, JSON.stringify([]));
    return filePath;
  }
}

export const returnYaticker = () => {
  const root = protobuf.loadSync(
    path.join(publicStockFolder, `/YPricingData.proto`)
  );
  return root.lookupType('yaticker');
}

export const rising = (positiveFluctuations: Fluctuations[]) => {
  const values = positiveFluctuations.map(fluctuation => fluctuation.currPrice);
  return (
    values[0] < values[1] ||
    values[1] < values[2] ||
    values[2] < values[3] ||
    (values[3] < values[4] && values[0] < values[2]) ||
    (values[1] < values[3] && values[0] < values[3] && values[0] < values[4])
  );
};

export const rapidFalling = (currFoundsBellowStartVal: number[]) => {
  return (
    currFoundsBellowStartVal[currFoundsBellowStartVal.length - 3] ===
    currFoundsBellowStartVal[currFoundsBellowStartVal.length - 2] - 1 &&
    currFoundsBellowStartVal[currFoundsBellowStartVal.length - 2] ===
    currFoundsBellowStartVal[currFoundsBellowStartVal.length - 1] - 1
  );
};

export const endTransaction = (stock: Stock, currFluct: number) => {
  stock.founds = reduce(currFluct, stock);
  stock.tradeCount++;
  console.log(stock.buysAndSells);
  stock.holds = [];
  stock.holding = false;

  return stock;
};

export const stops = (stock: Stock, time: Date, currFluct: number, goal: number) => {
  const now = new Date().getTime();

  return (
    ((stock.holding && currFluct > stock.holds[0]) || (!stock.holding && stock.founds >= goal))
    && ((time.getTime() <= now) && (now <= stock.breakPoint.getTime()))
  );
};

export const reduce = (currFluct: number, stock: Stock) => {
  return stock.holds.reduce((x, y) => x + applyB3CostToStockPrice(currFluct), stock.founds);
};

export const priceCheck = (stock: Stock) => {
  let fluct = stock.currFluct - stock.prevFluct;
  return stock.openValue * 0.999 < stock.openValue - fluct;
};

export const setValues = (stock: Stock, currFluct: number) => {
  stock.prevFluct = stock.currFluct;
  stock.currFluct = currFluct;
  stock.index++;
};

export const applyB3CostToStock = (stock: Stock) => {
  return stock.currFluct - (stock.currFluct * 0.00023);
};

export const applyB3CostToStockPrice = (currFluct: number) => {
  return currFluct - (currFluct * 0.00023);
};