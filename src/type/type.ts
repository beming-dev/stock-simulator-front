export type MockStockData = {
  [key: string]: StockData;
};

export type StockData = {
  symbol: string;
  name: string;
  price: string | number;
  high: number;
  low: number;
  country: string;
  type: string;
};

export type StockCurrentPrice = {
  stck_prpr: string; //주식현재가
  prdy_vrss: string; //전일대비
  prdy_vrss_sign: string; //전일대비 부호
  stck_hgpr: string; //주식 최고가
  stck_lwpr: string; //주식 최저가
  stck_mxpr: string; //상한가
  stck_llam: string; //하한가
  stck_sdpr: string; //기준가
};

export type OverseaStockCurrentPrice = {
  base: string; //전일종가
  diff: string; //전일거래량
  last: string; //현재가
  ordy: string; //매수가능여부
  pvol: string; //전일거래량
  rate: string; //등락율
  rsym: string; //실시간종목조회코드
  sign: string; //대비기호
  tamt: string; //거래대금
  tvol: string; //거래량
  zdiv: string; //소수점자릿수
};
