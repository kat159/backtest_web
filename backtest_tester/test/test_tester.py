import unittest
from types import MappingProxyType

from model.stock.stock import Stock
from model.stock.stock_service import get_all_stocks
from utils.my_pd import *
from utils.indicator import *


class MyTestCase(unittest.TestCase):
    def test_macd_divergence(self):
        _stocks: dict[str, Stock] = dict(get_all_stocks())
        stock = _stocks['600000']
        open = pd.Series(stock.open)
        high = pd.Series(stock.high)
        low = pd.Series(stock.low)
        close = pd.Series(stock.close)
        volume = pd.Series(stock.volume)

        macd = macd_signal(close, 12, 26, 9)

        is_macd_rebound = and_(higher(macd, ago(macd, 1)), lower(ago(macd, 1), ago(macd, 2)))
        for i in range(2, 1000):
            if macd[i - 2] > macd[i - 1] and macd[i - 1] < macd[i]:
                if not is_macd_rebound[i]:


        periods_to_last_time_macd_rebound = periods_since_nth_to_last_true(is_macd_rebound, 1)
        #

        cur_macd_trough = ago(macd, 1)

        last_macd_trough = ago(macd, periods_to_last_time_macd_rebound)

        closing_price_when_cur_macd_trough = ago(close, 1)

        closing_price_when_last_macd_trough = ago(macd, periods_to_last_time_macd_rebound)

        is_macd_divergence = and_(higher(cur_macd_trough, last_macd_trough),
                                  lower(closing_price_when_cur_macd_trough, closing_price_when_last_macd_trough))
        res = and_(is_macd_rebound, higher(cur_macd_trough, last_macd_trough))



if __name__ == '__main__':
    unittest.main()
