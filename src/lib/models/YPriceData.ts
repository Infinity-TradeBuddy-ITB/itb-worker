import { getModelForClass, prop } from '@typegoose/typegoose';

enum QuoteType {
  NONE = 0,
  ALTSYMBOL = 5,
  HEARTBEAT = 7,
  EQUITY = 8,
  INDEX = 9,
  MUTUALFUND = 11,
  MONEYMARKET = 12,
  OPTION = 13,
  CURRENCY = 14,
  WARRANT = 15,
  BOND = 17,
  FUTURE = 18,
  ETF = 20,
  COMMODITY = 23,
  ECNQUOTE = 28,
  CRYPTOCURRENCY = 41,
  INDICATOR = 42,
  INDUSTRY = 1000
}

enum OptionType {
  CALL = 0,
  PUT = 1
}

enum MarketHoursType {
  PRE_MARKET = 0,
  REGULAR_MARKET = 1,
  POST_MARKET = 2,
  EXTENDED_HOURS_MARKET = 3
}

export class YPriceData {
  @prop()
  id?: string;

  @prop()
  price?: number;

  @prop()
  time?: number;

  @prop()
  currency?: string;

  @prop()
  exchange?: string;

  @prop()
  quoteType?: QuoteType;

  @prop()
  marketHours?: MarketHoursType;

  @prop()
  changePercent?: number;

  @prop()
  dayVolume?: number;

  @prop()
  dayHigh?: number;

  @prop()
  dayLow?: number;

  @prop()
  change?: number;

  @prop()
  shortName?: string;

  @prop()
  expireDate?: number;

  @prop()
  openPrice?: number;

  @prop()
  previousClose?: number;

  @prop()
  strikePrice?: number;

  @prop()
  underlyingSymbol?: string;

  @prop()
  openInterest?: number;

  @prop()
  optionsType?: OptionType;

  @prop()
  miniOption?: number;

  @prop()
  lastSize?: number;

  @prop()
  bid?: number;

  @prop()
  bidSize?: number;

  @prop()
  ask?: number;

  @prop()
  askSize?: number;

  @prop()
  priceHint?: number;

  @prop()
  vol_24hr?: number;

  @prop()
  volAllCurrencies?: number;

  @prop()
  fromcurrency?: string;

  @prop()
  lastMarket?: string;

  @prop()
  circulatingSupply?: number;

  @prop()
  marketcap?: number;

  public static async logYPriceData(rawYPriceData: YPriceData) {
    const YPriceDataModel = getModelForClass(YPriceData);
    await YPriceDataModel.create(rawYPriceData);
  }
}

export default getModelForClass(YPriceData);