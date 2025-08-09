import { STOCK } from "../constants/Stock";
import { Trade } from "../pages/Dashboard";

export class StockUtils {
  static KoEnBySymbol(symbol: string): string {
    // symbol이 숫자로 시작하는 경우
    if (/^\d/.test(symbol)) {
      return STOCK.COUNTRY.KO;
    } else {
      return STOCK.COUNTRY.EN;
    }
  }

  static GetSymbolByCountry(country: string): string {
    switch (country) {
      case STOCK.COUNTRY.KO:
        return STOCK.SYMBOL.KO;
      case STOCK.COUNTRY.EN:
        return STOCK.SYMBOL.EN;
      default:
        return STOCK.SYMBOL.DEFAULT;
    }
  }

  static calculateProfitRate = (averagePrice: number, currentPrice: number) => {
    const result = ((currentPrice - averagePrice) / averagePrice) * 100;
    return result.toFixed(2);
  };

  static calculateProfitAmount = (
    averagePrice: number,
    currentPrice: number,
    amount: number
  ) => {
    const result = currentPrice * amount - averagePrice * amount;
    return result.toFixed(2);
  };

  static calculateTotalProfit = (stockList: Trade[]) => {
    const ret = {
      [STOCK.COUNTRY.KO]: {
        totalAmount: 0,
        profit: 0,
        original: 0,
      },
      [STOCK.COUNTRY.EN]: {
        totalAmount: 0,
        profit: 0,
        original: 0,
      },
    };

    stockList.forEach((item) => {
      const country = StockUtils.KoEnBySymbol(item.symbol);
      ret[country].totalAmount += item.amount * (item.currentPrice || 0);
      ret[country].profit +=
        item.amount * ((item.currentPrice || 0) - item.average);
      ret[country].original += item.amount * item.average;
    });

    return ret;
  };
}
