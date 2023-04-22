from utils.indicator import *
from utils.my_pd import *
from model.stock import Stock, get_all_stocks
import pandas as pd
import numpy as np

pd.options.display.max_rows = 1000


def execute_decoded_final_criterion(stock: Stock, decoded_final_criterion: str):
    open = pd.Series(stock.open)
    high = pd.Series(stock.high)
    low = pd.Series(stock.low)
    close = pd.Series(stock.close)
    volume = pd.Series(stock.volume)

    res = eval(decoded_final_criterion)
    print(res)


if __name__ == '__main__':
    _stocks: dict[str, Stock] = get_all_stocks(r'C:\Users\insect\Desktop\stock_data_test')
    stock = _stocks['600000']
    open = pd.Series(stock.open)
    high = pd.Series(stock.high)
    low = pd.Series(stock.low)
    close = pd.Series(stock.close)
    volume = pd.Series(stock.volume)

    decoded_final_criterion = 'and_(higher(ago(macd(close, 12, 26, 9), 1), ago(macd(close, 12, 26, 9), periods_since_nth_to_last_true(and_(higher(macd(close, 12, 26, 9), ago(macd(close, 12, 26, 9), 1)), lower(ago(macd(close, 12, 26, 9), 1), ago(macd(close, 12, 26, 9), 2))), 1))), and_(higher(macd(close, 12, 26, 9), ago(macd(close, 12, 26, 9), 1)), lower(ago(macd(close, 12, 26, 9), 1), ago(macd(close, 12, 26, 9), 2))))'
    execute_decoded_final_criterion(stock, decoded_final_criterion)
