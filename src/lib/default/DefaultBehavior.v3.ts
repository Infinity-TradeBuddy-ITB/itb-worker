import { log, reduce, Stock } from '../index.lib.js';

export const sell = (stock: Stock, currFluct: number) => {
  stock.tradeCount++;
  stock.positiveFluctuations.push({ index: stock.index, currPrice: currFluct, type: '', timeStamp: new Date() });
  stock.buysAndSells.push({ type: 'v', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });
  stock.founds = reduce(currFluct, stock);
  stock.lastSell = stock.founds;
  stock.holds.length = 0;
  stock.currFounds = stock.founds;
  stock.sells.push(stock.lastSell);
  stock.holding = false;
  stock.transactionsNumber++;
};

export const buy = (stock: Stock, currFluct: number) => {
  if (stock.sells.length > 5 && [...stock.sells].slice(-3).some((curr) => stock.startFounds >= curr)) {
    log(stock.sells);
    log(`V_E_O + ${stock.currFounds}} em ${stock.stockName}}`)
    stock.buysAndSells.push({ type: 'v_eo!', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });
    return true;
  }
  stock.tradeCount++;
  stock.positiveFluctuations.push({ index: stock.index, currPrice: currFluct, type: '', timeStamp: new Date() });
  stock.buysAndSells.push({ type: 'c', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });
  stock.holds.length = 0;
  while (stock.founds >= currFluct) {
    stock.holds.push(currFluct);
    stock.founds -= currFluct;
  }
  stock.holding = true;
  stock.transactionsNumber++;
  stock.currFounds = stock.founds;
  return false;
};

export const changeStopLoss = (stock: Stock, currFluct: number) => {
  if (
    stock.currFounds > stock.startFounds &&
    stock.currPossibleWin <= stock.lastSell * 0.9
  ) {
    stock.founds = reduce(currFluct, stock);
    stock.currFounds = stock.founds;
    stock.holding = false;
    stock.buysAndSells.push({ type: 'v_s_1', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });
    stock.holds.length = 0;
    return true;
  } else if (
    stock.currFounds <= stock.currFounds * 0.95 ||
    stock.currFounds <= 998.5
  ) {
    stock.founds = reduce(currFluct, stock);
    stock.currFounds = stock.founds;
    stock.holding = false;
    stock.buysAndSells.push({ type: 'v_s_2', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });
    stock.holds.length = 0;
    return true;
  }
  return false;
};
