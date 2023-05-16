import os
from datetime import date
from types import MappingProxyType

from model.stock.stock import Stock

_stocks = None


def get_all_stocks(start_date: date=None, end_date: date=None) -> dict[str, Stock]:
    global _stocks

    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    stocks_dir = os.path.join(root_dir, 'stock_data')
    path = stocks_dir

    if _stocks is None:
        files = os.listdir(path)
        _stocks = {}

        for file in files[:20]:
            stock = Stock(path + '/' + file)
            # stock = Stock(path + '\\' + file)  # linux会报错
            _stocks[stock.symbol] = stock
    res = {}
    for symbol, stock in _stocks.items():
        res[symbol] = stock.slice_by_date(start_date, end_date).copy()
    return _stocks.copy()

