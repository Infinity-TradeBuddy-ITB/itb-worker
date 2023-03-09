import { getModelForClass, prop } from '@typegoose/typegoose';
import { MarketHoursType, OptionType, QuoteType, YPriceData as YPriceDataInterface } from 'itb-types';

export class YPriceData implements YPriceDataInterface {
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