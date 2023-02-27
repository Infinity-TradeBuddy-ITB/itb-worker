import fs from 'fs';
import { deprecate } from 'util';

import { dailyResultsDir, dateString, errorsDir, Stock } from '../';

[deprecate(
  (stock: Stock, logContent: string) => {
    let buy = 0;
    let sell = 0;
    stock.buysAndSells.forEach((buyOrSell) => {
      if (buyOrSell.type.split(' ')[0] === 'c' || buyOrSell.type.split('_')[0] === 'c') {
        buy = buyOrSell[1];
      }
      if (buyOrSell.type.split(' ')[0] === 'v') {
        sell = buyOrSell[1];
      }
      if (sell - buy >= stock.total / 10) {
        const improve = '\n\n\t\tMelhorar!!\n\n';
        logContent += improve;
        log(improve);
        log(buy.toString(), sell.toString());
      }
    });
    return logContent;
  },
  ' TODO: refactor this method to use time metrics instead array indexs ',
  'distanceCheck'
)]

export const log = (...str: any[]) => console.log(...str)

export const logger = (stock: Stock) => {
  let logContent: string = '';
  /* let logContent: string = distanceCheck(stock, logContent); */

  const dayLog = `resultados para referente a ações da ${stock.stockName} no dia ${new Date()}\n`;
  log(dayLog);
  const totalLog = `total tivemos ${stock.total} flutuações deste ativo no dia\n`
  logContent += dayLog + totalLog;
  log(`total tivemos ${stock.total} flutuações deste ativo no dia`);
  if (stock.founds > stock.startFounds) {
    const winLog = `${stock.founds}, lucro de ${stock.founds - stock.startFounds}\n`
    logContent += winLog;
    log(winLog);
  }
  if (stock.founds === stock.startFounds) {
    const evenLog = 'empatou\n';
    logContent += evenLog;
    log(evenLog);
  }
  if (stock.founds < stock.startFounds && stock.founds > 0) {
    const lossLog = `${stock.founds} prejuizo, perdemos ${stock.founds - stock.startFounds}\n`;
    logContent += lossLog;
    log(lossLog);
  }
  if (stock.founds <= 0) {
    const panicLog = 'PANIC!!\n';
    logContent += panicLog;
    log(panicLog);
  }
  const buysAndSellsLog = `numero de transações feitas para estes dados ${stock.transactionsNumber}\n\n\n`;
  logContent += buysAndSellsLog;
  log(buysAndSellsLog);

  console.log(dateString)

  stock.closingTime = new Date();
  const filePath: string = `${dailyResultsDir}/result_${stock.stockName}_${dateString}.json`;

  stock.log = logContent;

  Stock.logStock(stock);
  logInFile(stock, filePath, undefined);
};

export const logInFile = (stock: any, filePath: string | undefined, workerIndex: string | undefined) => {
  if (stock !== undefined && filePath !== undefined) {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        const stocks: any[] = [];
        stocks.push(stock);
        const stocksString = JSON.stringify(stocks, null, 2);

        writeFileAsync(filePath, stocksString, `file was created for ${stock.stockName}`);
      } else {
        handleJsonFileLogging(filePath, stock, workerIndex);
      }
    });
  }
}

const logInErrorFile = (workerIndex: string | undefined, filePath: string, stock: any) => {
  let errorFilePath = `${errorsDir}${dateString}`
  let logContent = '';

  if (workerIndex !== undefined) {
    errorFilePath += `/worker_${workerIndex}_error.log`;
    filePath += `: on fluctuation ${stock.total}, `;
    logContent = `error on file ${stock.stockName} during fluctuation loging`;

  } else {
    errorFilePath += `/closingError_${stock.stockName}_error.log`;
    filePath += `: on closing ${stock.total}, `
    logContent = `error on file ${stock.stockName} during clousure loging`;
  }

  writeFileAsync(errorFilePath, filePath, logContent);
}

const handleJsonFileLogging = (filePath: string, stock: any, workerIndex: string | undefined) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log(stock);
      throw err;
    }
    if (data) {
      let stocksString = '';
      let stocks: any[] = [];
      try {
        stocks = JSON.parse(data);
        stocks.push(stock);
        stocksString = JSON.stringify(stocks, null, 2);

        const logContet = stock.toString() + `${stock.stockName} was appeded to file`;
        writeFileAsync(filePath, stocksString, logContet);

      } catch (e: any) {
        logInErrorFile(workerIndex, filePath, stock)
        stocksString = parseJsonFileClean(e, data, stocks);

        const logContet = stock.toString() + `${stock.stockName} was appeded to file`;
        writeFileAsync(filePath, stocksString, logContet);
      }
    }
  });
}

const parseJsonFileClean = (e: any, data: string, stocks: any[]) => {
  console.log(e);
  const position = e.message.match(/position (\d+)/)[1];
  console.log(`Problematic character position: ${position}`);

  let cleanedData = data.slice(0, position);
  const cleanedStocks = JSON.parse(cleanedData);
  stocks.push(cleanedData);
  return JSON.stringify(cleanedStocks, null, 2);
}

export const writeFileAsync = (filePath: string, stocksString: string, logContent: string) => {
  fs.writeFile(filePath, stocksString, (err) => {
    if (err) {
      throw err;
    }
    console.log(`${filePath}, ${logContent}`);
  });
}