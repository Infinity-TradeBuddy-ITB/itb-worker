import { log } from '../log/log_lib.js';
import { Stock } from '../models/stock.js';
import { applyB3CostToStockPrice } from '../utils/lib_utils.js';
import { buy, changeStopLoss, sell } from './default_behavior_lib_v3.js';

export const processing = (stock: Stock, currFluct: number, closeConnection: Function) => {
  //-- compra
  if (stock.holding && stock.holds.length > 0) {
    if (applyB3CostToStockPrice(currFluct) >= stock.holds[0]) {
      sell(stock, currFluct);
    }
    // venda
  } else if (!stock.holding && stock.prevFluct < applyB3CostToStockPrice(currFluct)) {
    return buy(stock, currFluct);
  }

  // stop-loss
  if (stock.holding) {
    stock.lastSell = stock.currFounds - stock.startFounds;
    changeStopLoss(stock, currFluct);
    // panic!
  } else if (!stock.holding && stock.founds <= stock.startFounds * 0.998) {
    stock.buysAndSells.push({ type: 'PANIC!', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });
    log(stock.buysAndSells);
    closeConnection(stock.stockName);
    return true;
  }
  return false;
};
