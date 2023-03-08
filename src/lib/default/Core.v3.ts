import { applyB3CostToStockPrice, buy, changeStopLoss, log, sell, Stock } from '../';

export const processing = (stock: Stock, closeConnection: Function) => {
  /* compra */ if (stock.holding && stock.holds.length > 0) {
    if (applyB3CostToStockPrice(stock.currFluct) >= stock.holds[0]) {
      sell(stock, stock.currFluct);
    }
  } /* venda */ else if (!stock.holding && stock.prevFluct < applyB3CostToStockPrice(stock.currFluct)) {
    return buy(stock, stock.currFluct);
  } /* stop-loss */ else if (stock.holding) {
    stock.lastSell = stock.currFounds - stock.startFounds;
    changeStopLoss(stock, stock.currFluct);
  } /* panic!! */ else if (!stock.holding && stock.founds <= stock.startFounds * 0.998) {
    stock.buysAndSells.push({ type: 'PANIC!', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });
    log(stock.buysAndSells);
    closeConnection(stock.stockName);
    return true;
  }
  return false;
};
