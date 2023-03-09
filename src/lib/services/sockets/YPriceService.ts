import fs from 'fs';
import { StockTicker } from 'itb-types';
import * as path from 'path';
import WebSocket from 'ws';

import { Stock, YPriceData, YPriceDataModel } from '@repositories';
import { blocked, BreaksAndGoals, firstStopLoss, processing, searchSymbol, sendToFrontend } from '@services';
import { applyB3CostToStockPrice, buildFilePath, log, returnYaticker } from '@utils';

const config = {
	ignoreStockMarkedAsNotWorking: true
}

export type StockWorkingState = {
	stock: Stock;
	working: boolean;
}

export const connectToSocket = (isTest: boolean) => {
	if (isTest) {
		return new WebSocket('ws://127.0.0.1:5501');
	} else {
		return new WebSocket('wss://streamer.finance.yahoo.com');
	}
}

export const onOpen = (ws: WebSocket, clusterIndex: string | undefined, isTest: boolean,) => {
	if (isTest) {
		ws.onopen = () => {
			log(`\n\n\t\tconneceted to test server\n\n`)
		};
	} else {
		ws.onopen = () => {

			if (clusterIndex == undefined) {
				log('clusterIndex is undefined');
				return;
			}
			const fileNumber = parseInt(clusterIndex) + 1;
			const filePathString = buildFilePath(fileNumber.toString());

			if (filePathString == undefined) {
				log('file path is undefined');
				return;
			}

			const filePath = path.resolve(filePathString);
			const file = JSON.parse(fs.readFileSync(filePath, 'utf8'));

			log(`Worker ${process.pid} connected`);
			log('Files created');

			ws.send(
				JSON.stringify({
					subscribe: [...file.stocks],
				})
			);
			log(`Worker ${process.pid} subscribed`);
		};
	}
}

export const onMessage = (ws: WebSocket, server: WebSocket.Server, isTest: boolean) => {
	const Yaticker = returnYaticker();
	const stocks: StockWorkingState[] = [];

	ws.onmessage = (data: any) => {
		log('comming message');

		let rawYPriceData: YPriceData;
		if (isTest) {
			rawYPriceData = JSON.parse(data.data) as YPriceData;
		} else {
			const message = Yaticker.decode(Buffer.from(data.data, 'base64'));
			rawYPriceData = Yaticker.toObject(message) as YPriceData;
		}
		YPriceDataModel.logYPriceData(rawYPriceData);

		if (searchSymbol(<StockTicker>rawYPriceData.id)) {
			sendToFrontend(rawYPriceData, server);
		}

		const found = stocks.find((o) => o.stock.stockName === rawYPriceData.id);
		if (!found) {
			stocks.push({ stock: Stock.newInstance(rawYPriceData.id, rawYPriceData.price, 1000), working: true });
			log(stocks.length);
		} else if (found.working || config.ignoreStockMarkedAsNotWorking) {
			const currStock = stocks.find((o) => o.stock.stockName === rawYPriceData.id)?.stock;

			if (currStock != undefined) {
				currStock.currFluct = rawYPriceData.price ?? 0;

				validateAndOperate(currStock);

				currStock.prevFluct = currStock.currFluct;
				currStock.index++;
			}
		}
		log(`${found?.stock.founds}`);
	};

	const validateAndOperate = (currStock: Stock) => {
		if (currStock.reasonable &&
			currStock.prevFluct < applyB3CostToStockPrice(currStock.currFluct) + 0.1 &&
			currStock.currFluct > 0) {
			log(`currStock is reasonable\n\n`);

			if (!firstStopLoss(currStock, removeStock))
				if (!BreaksAndGoals(currStock, removeStock))
					processing(currStock, removeStock);
		} else {
			blocked(currStock, currStock.currFluct)
		}
	}

	const removeStock = (stockName: string | undefined) => {
		const workingStock = stocks.find(stock => stock.stock.stockName === stockName);

		if (workingStock) {
			Stock.logStock(workingStock.stock);
			workingStock.working = false;
			log(stocks.length);
		}
	}
}
