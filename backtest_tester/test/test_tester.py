import unittest

from utils.my_pd import *
from utils.indicator import *
from model.stock import Stock, get_all_stocks


class MyTestCase(unittest.TestCase):
    def test_macd_divergence(self):
        _stocks: dict[str, Stock] = get_all_stocks(r'C:\Users\insect\Desktop\stock_data_test')
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
                    print('is_macd_rebound error:', macd[i - 2], macd[i - 1], macd[i])

        periods_to_last_time_macd_rebound = periods_since_nth_to_last_true(is_macd_rebound, 1)
        # print(pd.concat([macd, is_macd_rebound, periods_to_last_time_macd_rebound], axis=1).head(1000))

        cur_macd_trough = ago(macd, 1)

        last_macd_trough = ago(macd, periods_to_last_time_macd_rebound)

        closing_price_when_cur_macd_trough = ago(close, 1)

        closing_price_when_last_macd_trough = ago(macd, periods_to_last_time_macd_rebound)

        is_macd_divergence = and_(higher(cur_macd_trough, last_macd_trough),
                                  lower(closing_price_when_cur_macd_trough, closing_price_when_last_macd_trough))
        res = and_(is_macd_rebound, higher(cur_macd_trough, last_macd_trough))
        print(count_over_periods(res, 5000))


if __name__ == '__main__':
    unittest.main()
