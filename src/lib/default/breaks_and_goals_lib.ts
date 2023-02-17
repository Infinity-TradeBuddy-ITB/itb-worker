import { log } from '../log/log_lib.js';
import { Stock } from '../models/stock.js';
import { endTransaction as end, stops } from '../utils/lib_utils.js';

export const goalsNotHolding = (stock: Stock, closeConnection: Function) => {
  // 0.6 de lucro
  if (!stock.holding && stock.currFounds >= stock.startFounds * 1.006 && !stock.exited) {
    stock.buysAndSells.push({ type: 'v_c_s', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });
    log(`vendeu bem rapidamente (1.006), sem segurar na flutação de n° 
					${stock.index} entre ${stock.total} no dia ${new Date()}, ${stock.currFounds} em ${stock.stockName}`);
    stock.founds = stock.currFounds;
    stock.transactionsNumber += 1;
    stock.exited = true;
    closeConnection(stock.stockName);
    return true;
  }

  // 0.5 de lucro
  if (!stock.holding && stock.currFounds >= stock.startFounds * 1.005 && !stock.exited) {
    stock.buysAndSells.push({ type: 'v_c_s_2', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });
    log(`vendeu bem rapidamente (1.005), sem segurar na flutação de n° 
					${stock.index} entre ${stock.total} no dia ${new Date()}, ${stock.currFounds} em ${stock.stockName}`);
    stock.founds = stock.currFounds;
    stock.transactionsNumber += 1;
    stock.exited = true;
    closeConnection(stock.stockName);
    return true;
  }
  return false;
};

export const goalsHolding = (stock: Stock, currFluct: number, closeConnection: Function) => {
  // 0.4 de lucro
  if (stock.holding && stock.currFounds >= stock.startFounds * 1.004) {
    stock.buysAndSells.push({ type: 'vv_c_c', index: stock.index, currPrice: currFluct, timeStamp: new Date() });
    log(`vendeu bem rapidamente (1.004), segurando na flutação de n° 
					${stock.index} entre ${stock.total} no dia ${new Date()}, ${stock.currFounds} em ${stock.stockName}`);
    // venda
    stock = end(stock, currFluct);
    closeConnection(stock.stockName);
    return true;
  }

  // 0.3 de lucro
  if (stock.holding && stock.currFounds >= stock.startFounds * 1.003) {
    stock.buysAndSells.push({ type: 'vv_c_c_2', index: stock.index, currPrice: currFluct, timeStamp: new Date() });
    log(`vendeu bem rapidamente (1.003), segurando na flutação de n° 
	  			${stock.index} entre ${stock.total} no dia ${new Date()}, ${stock.currFounds} em ${stock.stockName}`);
    // venda
    stock = end(stock, currFluct);
    closeConnection(stock.stockName);
    return true;
  }

  return false;
};

export const breaks = (stock: Stock, closeConnection: Function) => {
  const date = new Date();
  date.setHours(16, 30, 0, 0)
  // passou 75% do tempo
  if (stops(stock, date, stock.currFluct, stock.startFounds * 1.002)) {
    stock.buysAndSells.push({ type: 'v_m_r', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });

    log(`vendeu rapidamente (1.002), na flutação de n° 
					${stock.index} entre ${stock.total} no dia ${new Date()}, ${stock.currFounds} em ${stock.stockName}`);
    // venda
    stock = end(stock, stock.currFluct);
    closeConnection(stock.stockName);
    return true;
  }

  date.setHours(17, 0, 0, 0)
  // passou 85% do tempo
  if (stops(stock, date, stock.currFluct, stock.startFounds * 1.001)) {
    stock.buysAndSells.push({ type: 'v_r', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });

    log(`vendeu rapididamente (1.001), na flutação de n° 
					${stock.index} entre ${stock.total} no dia ${new Date()}, ${stock.currFounds} em ${stock.stockName}`);
    // venda
    stock = end(stock, stock.currFluct);
    closeConnection(stock.stockName);
    return true;
  }
  date.setHours(17, 30, 0, 0)
  // passou 95% do tempo
  if (stock.holding && date.getTime() >= stock.breakPoint.getTime()) {
    stock.buysAndSells.push({ type: 'v_u_s', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });

    // venda
    if (stock.holds.length >= 1) {
      stock = end(stock, stock.currFluct);
    }

    log(`vendeu perto do fechamento, na flutação de n°
					${stock.index} entre ${stock.total} no dia ${new Date()}, ${stock.currFounds} em ${stock.stockName}`);
    log(stock.buysAndSells);
    closeConnection(stock.stockName);
    return true;
  }

  // passou 95% do tempo com bolso vazio
  if (!stock.holding && date.getTime() >= stock.breakPoint.getTime()) {
    stock.buysAndSells.push({ type: 'v_s_v', index: stock.index, currPrice: stock.currFluct, timeStamp: new Date() });
    log(`fechou sem precisar vender, na flutação de n° 
					${stock.index} entre ${stock.total} no dia ${new Date()}, ${stock.currFounds} em ${stock.stockName}`);
    log(stock.buysAndSells);
    closeConnection(stock.stockName);
    return true;
  }
  return false;
};
