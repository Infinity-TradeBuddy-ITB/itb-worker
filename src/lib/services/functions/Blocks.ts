import { Stock } from '@repositories';
import { log, rapidFalling, reduce, rising } from '@utils';

export const blocked = (stock: Stock, currFluct: number) => {

  if (stock.prevFluct === stock.currFluct) {
    return false;
  }

  if (stock.reasonable) {
    return true
  }

  if (stock.holds) {
    stock.currFounds = reduce(currFluct, stock);
  } else {
    stock.currFounds = stock.founds;
  }

  if (stock.currFounds < stock.startFounds) {
    stock.currFoundsBellowStartVal.push(stock.index);
  }

  if (stock.prevFluct < currFluct) {
    stock.positiveFluctuations.push({ index: stock.index, currPrice: stock.currFluct, type: '', timeStamp: new Date() });
    stock.positiveCounter++;
  } else {
    stock.negativeFluctuations.push({ index: stock.index, currPrice: stock.currFluct, type: '', timeStamp: new Date() });
    stock.negativeCounter++;
  }

  if (!stock.reasonable) {
    stock.prevFluct = stock.currFluct;
    if (stock.positiveCounter >= 5 && rising(stock.positiveFluctuations)) {
      stock.reasonable = true;
      return true
    }
  }
};

export const firstStopLoss = (stock: Stock, closeConnection: Function) => {
  if (stock.currFoundsBellowStartVal.length > 15 &&
    rapidFalling(stock.currFoundsBellowStartVal) && stock.currFounds >= stock.startFounds) {
    stock.buysAndSells.push({ type: 'v_c_m', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });
    log(`vendeu para evitar possivel prejuizo, segurando na flutação de n° 
         ${stock.index} entre ${stock.total} no dia ${new Date()}`);
    stock.founds = stock.currFounds;
    log(stock.buysAndSells);
    closeConnection(stock.stockName);
    return true;
  }
  return false;
};