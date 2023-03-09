import { StockEvent, StockEventType, StockTicker, SubscribedStocksEvent } from 'itb-types';
import WebSocket from 'ws';

import { YPriceData } from '@repositories';
import { log, newSubscribedStockEvent } from '@utils';

const subscribedStockEvents: SubscribedStocksEvent = newSubscribedStockEvent();

export const openServer = () => {
	return new WebSocket.Server({ port: 5500 });
}

export const onFrontMessage = (ws: WebSocket.Server) => {
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

export const sendToFrontend = (data: YPriceData, ws: WebSocket.Server) => {
	ws.on(`send`, async (socket: WebSocket) => {
		log('comming message');
		socket.send(JSON.stringify(data));
	});
}

export const unsubscribeStockEvent = (stockName: StockTicker) => {
	subscribedStockEvents.symbols = subscribedStockEvents.symbols.filter(symbol => symbol !== stockName);
}

export const subscribeStockEvent = (stockName: StockTicker) => {
	subscribedStockEvents.symbols.push(stockName);
}

export const searchSymbol = (stockName: StockTicker | undefined) => {
	return subscribedStockEvents.symbols.find(symbol => symbol === stockName) != undefined;
}
