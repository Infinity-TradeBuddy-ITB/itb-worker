const WebSocket = require('isomorphic-ws');
const protobuf = require('protobufjs');
const fs = require('fs');

const root = protobuf.loadSync('./stock_data/YPricingData.proto');

const Yaticker = root.lookupType('yaticker');
const ws = new WebSocket('wss://streamer.finance.yahoo.com');

ws.onopen = open = () => {
  console.log('connected');

  //fs.writeFileSync(`WEGE3.json`, '{\n\t"array": [\n\t]\n}');
  // fs.writeFileSync(`AFRM.json`,'{\n\t"array": [\n\t]\n}');
  // fs.writeFileSync(`COIN.json`,'{\n\t"array": [\n\t]\n}');
  // fs.writeFileSync(`TWLO.json`,'{\n\t"array": [\n\t]\n}');
  // fs.writeFileSync(`W.json`,'{\n\t"array": [\n\t]\n}');

  console.log('files created');
  ws.send(
    JSON.stringify({
      subscribe: [
        'WEGE3.SA',
        'TAL',
        'CEIX',
        'HKD',
        'APE',
        'MSFT',
        'AFRM',
        'COIN',
        'TWLO',
        'M',
      ],
    })
  );
};

ws.onclose = close = () => {
  ws.terminate();
  console.log('disconnected');
};

ws.onmessage = incoming = (data) => {
  console.log('comming message');
  const message = Yaticker.decode(new Buffer(data.data, 'base64'));
  const stock = Yaticker.toObject(message);
  const stockSymbol = stock.id;
  const stockJson = JSON.stringify(stock, null, 2);
  switch (stockSymbol) {
    case 'WEGE3.SA':
      fs.appendFile(
        './WEGE3.SA_0601.json',
        JSON.stringify(stock, null, 2),
        (writeErr) => {
          if (writeErr) {
            throw writeErr;
          }
        }
      );
      break;
    case 'TAL':
      fs.appendFile(
        './TAL.json',
        JSON.stringify(stock, null, 2),
        (writeErr) => {
          if (writeErr) {
            throw writeErr;
          }
        }
      );
      break;
    case 'CEIX':
      fs.appendFile(
        './CEIX.json',
        JSON.stringify(stock, null, 2),
        (writeErr) => {
          if (writeErr) {
            throw writeErr;
          }
        }
      );
      break;
    case 'HKD':
      fs.appendFile(
        './HKD.json',
        JSON.stringify(stock, null, 2),
        (writeErr) => {
          if (writeErr) {
            throw writeErr;
          }
        }
      );
      break;
    case 'APE':
      fs.appendFile(
        './APE.json',
        JSON.stringify(stock, null, 2),
        (writeErr) => {
          if (writeErr) {
            throw writeErr;
          }
        }
      );
      break;
    case 'MSFT':
      fs.appendFile(
        './MSFT.json',
        JSON.stringify(stock, null, 2),
        (writeErr) => {
          if (writeErr) {
            throw writeErr;
          }
        }
      );
      break;
    case 'AFRM':
      fs.appendFile(
        './AFRM.json',
        JSON.stringify(stock, null, 2),
        (writeErr) => {
          if (writeErr) {
            throw writeErr;
          }
        }
      );
      break;
    case 'COIN':
      fs.appendFile(
        './COIN.json',
        JSON.stringify(stock, null, 2),
        (writeErr) => {
          if (writeErr) {
            throw writeErr;
          }
        }
      );
      break;
    case 'TWLO':
      fs.appendFile(
        './TWLO.json',
        JSON.stringify(stock, null, 2),
        (writeErr) => {
          if (writeErr) {
            throw writeErr;
          }
        }
      );
      break;
    case 'M':
      fs.appendFile('./M.json', JSON.stringify(stock, null, 2), (writeErr) => {
        if (writeErr) {
          throw writeErr;
        }
      });
      break;
  }

  console.log(message);

  // fs.writeFileSync(`${stockSymbol}.txt`, JSON.stringify(stock, null, 2));
};

process.on('SIGINT', () => {
  console.log('\n\nClosing WebSocket connection');
  ws.close();
});

console.log('server started');
