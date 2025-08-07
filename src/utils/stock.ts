import { STOCK } from "../constants/Stock";

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
}
