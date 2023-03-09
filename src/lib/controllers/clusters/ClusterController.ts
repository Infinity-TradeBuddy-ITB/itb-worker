import * as dotenv from 'dotenv';

import { connectToMongo, Stock } from '@repositories';
import { connectToSocket, onFrontMessage, onMessage, onOpen, openServer } from '@services';
import { log } from '@utils';

const config = {
	ignoreStockMarkedAsNotWorking: true
}

export type StockWorkingState = {
	stock: Stock;
	working: boolean;
}

// const subscribedStockEvents: SubscribedStocksEvent = newSubscribedStockEvent();

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
	// onFrontMessage(server);

	// ******************** closing connection logic 
	ws.onclose = () => {
		log('disconnected');
		ws.terminate();
	};
}


