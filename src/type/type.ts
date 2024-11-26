export type StockData = {
  [key: string]: {
    symbol: string;
    name: string;
    price: number;
    high: number;
    low: number;
  };
};
