import * as dotenv from 'dotenv';
import fs from 'fs';
import * as path from 'path';
import WebSocket from 'ws';

import {
	blocked, breaks, buildFilePath, connectToMongo, firstStopLoss,
	goalsHolding, goalsNotHolding, log, newSubscribedStockEvent,
	processing, returnYaticker, Stock, StockEvent, StockEventType,
	StockTicker, SubscribedStocksEvent, YPriceData
} from '../';

import YPriceDataModel from '../models/YPriceData.js';
	
const config = {
	ignoreStockMarkedAsNotWorking: true
}

export type StockWorkingState = {
	stock: Stock;
	working: boolean;
}

const subscribedStockEvents: SubscribedStocksEvent = newSubscribedStockEvent();

export const clusterBehavior = async (clusterIndex: string | undefined, isTest: boolean) => {
	// ******************** mongoose connection
	dotenv.config();
	connectToMongo();

	// ******************** opening connections logic
	const ws = connectToSocket(false);
	const server = openServer();

	onOpen(ws, clusterIndex, isTest);
	log('server started');

	// ******************** operation on message logic
	onMessage(ws, server, isTest);
	onFrontMessage(server);

	// ******************** closing connection logic 
	ws.onclose = () => {
		log('disconnected');
		ws.terminate();
	};
}

// ******************** opening connections logic
const connectToSocket = (isTest: boolean) => {
	if (isTest) {
		return new WebSocket('ws://127.0.0.1:5501');
	} else {
		return new WebSocket('wss://streamer.finance.yahoo.com');
	}
}

const openServer = () => {
	return new WebSocket.Server({ port: 5500 });
}

const onOpen = (ws: WebSocket, clusterIndex: string | undefined, isTest: boolean,) => {
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

// ******************** operation on message logic
const onMessage = (ws: WebSocket, server: WebSocket.Server, isTest: boolean) => {
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

				if (currStock.reasonable && currStock.prevFluct != currStock.currFluct && currStock.currFluct > 0) {
					log(`currStock is reasonable\n\n`);
					!firstStopLoss(currStock, removeStock) &&
						!goalsHolding(currStock, currStock.currFluct, removeStock) &&
						!goalsNotHolding(currStock, removeStock) &&
						!processing(currStock, currStock.currFluct, removeStock) &&
						breaks(currStock, removeStock);
				} else {
					blocked(currStock, currStock.currFluct)
				}
				currStock.prevFluct = currStock.currFluct;
				currStock.index++;
			}
		}
		log(`${found?.stock.founds}`);
	};

	const removeStock = (stockName: string | undefined) => {
		const workingStock = stocks.find(stock => stock.stock.stockName === stockName);

		if (workingStock) {
			Stock.logStock(workingStock.stock);
			workingStock.working = false;
			log(stocks.length);
		}
	}
}

const onFrontMessage = (ws: WebSocket.Server) => {
	ws.on(`ypriceEvent`, (stockEvent: StockEvent | any) => {
		if (!('event' in stockEvent)) {
			return log('not a stock event');

		} else if (stockEvent.event === StockEventType.SUBSCRIBE) {
			subscribeStockEvent(stockEvent.symbol);

		} else if (stockEvent.event === StockEventType.UNSUBSCRIBE) {
			unsubscribeStockEvent(stockEvent.symbol);
		}
	});
}

const sendToFrontend = (data: YPriceData, ws: WebSocket.Server) => {
	ws.on(`send`, async (socket: WebSocket) => {
		log('comming message');
		socket.send(JSON.stringify(data));
	});
}

const unsubscribeStockEvent = (stockName: StockTicker) => {
	subscribedStockEvents.symbols = subscribedStockEvents.symbols.filter(symbol => symbol !== stockName);
}

const subscribeStockEvent = (stockName: StockTicker) => {
	subscribedStockEvents.symbols.push(stockName);
}

const searchSymbol = (stockName: StockTicker | undefined) => {
	return subscribedStockEvents.symbols.find(symbol => symbol === stockName) != undefined;
}
