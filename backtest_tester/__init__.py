import pandas as pd

from model.stock import Stock, get_all_stocks

stock_dfs = []
stocks: dict[str, Stock] = get_all_stocks(r'C:\Users\insect\Desktop\stock_data_test')
for stock in stocks.values():
    stock_df = pd.DataFrame({
        'symbol': stock.symbol,
        'name': stock.name,
        'date': stock.date,
        'open': stock.open,
        'close': stock.close,
        'high': stock.high,
        'low': stock.low,
        'volume': stock.volume,
        'turn_volume': stock.turn_volume,
        'timestamp': stock.timestamp
    })
    stock_dfs.append(stock_df)

all_stocks_df = pd.concat(stock_dfs)

if __name__ == '__main__':

    print(stock_dfs)

    apple_df = all_stocks_df[all_stocks_df['symbol'] == 'apple']
    print(apple_df)
    orange_df = all_stocks_df[all_stocks_df['symbol'] == 'orange']
    print(orange_df)
    apple_close = apple_df['close']
    orange_close = orange_df['close']
