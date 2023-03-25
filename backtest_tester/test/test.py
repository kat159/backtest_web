import unittest

from ..model.stock import *
from ..MyTT1 import MyTT as mt
from ..utils import indicator


class MyTestCase(unittest.TestCase):
    def test_read(self):
        stocks: dict[str, Stock] = get_all_stocks(r'C:\Users\insect\Desktop\stock_data_test')
        print(stocks['600000'].close)
        stock = stocks['600000']
        bljj1 = indicator.bljj(stock.close, stock.high, stock.low)
        bljj2 = mt.BLJJ(stock.close, stock.high, stock.low)
        bljj2 = pd.Series(bljj2)
        print(str(bljj1))
        print(str(bljj2))
        pd.testing.assert_series_equal(bljj1, bljj2)

    def test_strategy(self):
        pd_s = pd.Series([True, False, False, True, True, False, False, True, False, False, False])

        # Calculate the cumulative sum of True values in the Series
        cumsum = pd_s.cumsum()

        # Calculate the index of the third-last True value
        third_last_idx = (cumsum == (cumsum.max() - 2)).idxmax()

        print(third_last_idx)


if __name__ == '__main__':
    unittest.main()
