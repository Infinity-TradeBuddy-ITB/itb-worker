import * as dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';
import os from 'os';
import * as path from 'path';
import WebSocket from 'ws';

import { blocked, firstStopLoss } from '../default/blocks_lib.js';
import { breaks, goalsHolding, goalsNotHolding } from '../default/breaks_and_goals_lib.js';
import { processing } from '../default/core_lib_v3.js';
import { log } from '../log/log_lib.js';
import { Stock } from '../models/stock.js';
import YPriceDataModel, { YPriceData } from '../models/yprice_data.js';
import { buildFilePath, connectionString, returnYaticker } from '../utils/lib_utils.js';

const config = {
	ignoreStockMarkedAsNotWorking: true
}

export type StockWorkingState = {
	stock: Stock;
	working: boolean;
}

export const clusterBehavior = async (clusterIndex: string | undefined, isTest: boolean) => {
	// ******************** mongoose connection
	dotenv.config();
	connectToMongo();

	// ******************** opening connections logic
	const ws = connectToSocket(false);
	onOpen(ws, clusterIndex, isTest);
	log('server started');

	// ******************** operation on message logic
	onMessage(ws, isTest);

	// ******************** closing connection logic 
	ws.onclose = () => {
		log('disconnected');
		ws.terminate();
	};	
}

// ******************** mongoose connection
const connectToMongo = async () => {
	await mongoose.connect(connectionString, {
		dbName: process.env.MONGODB_DBNAME,
		user: process.env.MONGODB_USERNAME,
		pass: process.env.MONGODB_PASSWORD
	});
	const connection = mongoose.connection;

	connection.on('connected', () => {
		console.log('MongoDB connected successfully');
	});
	connection.on('error', (error) => {
		console.error(`\n\n\n\t MongoDB connection error: ${error}\n\n\n\t`);
		process.exit(0);
	});
}

// ******************** opening connections logic
const connectToSocket = (isTest: boolean) => {
	if(isTest){
		return new WebSocket('ws://127.0.0.1:5500');
	} else { 
		return new WebSocket('wss://streamer.finance.yahoo.com');
	}
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
const onMessage = (ws: WebSocket, isTest: boolean) => {
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

