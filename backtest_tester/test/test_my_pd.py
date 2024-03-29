import unittest

import numpy as np
import pandas as pd

from utils.my_pd import *


class MyTestCase(unittest.TestCase):
    def test_divide(self):
        s1 = pd.Series([np.nan, 7, 6, 5, 4, 3, np.nan, np.nan, 2, 1])
        s2 = pd.Series([np.nan, 7, 6, 5, 4, 3, np.nan, np.nan, 2, 1]).shift(1)


    def test_round(self):
        s = pd.Series([1.1111, 2.2222, 3.3333, np.nan, None, 1]).shift(1)
        df = pd.DataFrame({
            's': s,
            'round(s, 0)': round(s, 0),
            'round(s, 1)': round(s, 1),
            'round(s, 2)': round(s, 2),
        })


    def test_abs(self):
        s1 = pd.Series([np.nan, 7, 6, 5, 4, 3, np.nan, np.nan, 2, 1]).astype('Int64')


    def test_max(self):
        s1 = pd.Series([11111111.1111, 1.1, 10000, 11])
        s2 = ago(s1, 1)
        res = max(s1, s2)


        s1 = np.nan
        res = max(s1, s2)


        s1 = 1.3
        res = max(s1, s2)


        s1 = 1.3
        s2 = 1.4
        res = max(s1, s2)


    def test_min(self):
        s1 = pd.Series([11111111.1111, 1.1, 10000, 11])
        s2 = ago(s1, 1)
        res = min(s1, s2)


        s1 = np.nan
        res = min(s1, s2)


        s1 = 1.3
        res = min(s1, s2)


        s1 = 1.3
        s2 = 1.4
        res = min(s1, s2)


    def test_sum_over_periods(self):
        s1 = pd.Series([np.nan, 1, 1, 1, 1, 1, np.nan, np.nan, 1, 1])
        expected = s1.rolling(3).sum()
        res = sum_over_periods(s1, pd.Series([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]))
        pd.testing.assert_series_equal(expected, res)




        s1 = pd.Series([np.nan, 1, 1, 1, 1, 1, np.nan, np.nan, 1, 1])
        winsize = pd.Series([1, 3, 2, 2, 2, 4, 5, 3, 2, 1])
        res = sum_over_periods(s1, winsize)


    def test_max_over_periods(self):
        s1 = pd.Series([np.nan, 7, 6, 5, 4, 3, np.nan, np.nan, 2, 1])
        expected = s1.rolling(3).max()
        res = max_over_periods(s1, pd.Series([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]))
        pd.testing.assert_series_equal(expected, res)




        s1 = pd.Series([np.nan, 7, 6, 5, 4, 3, np.nan, np.nan, 2, 1])
        winsize = pd.Series([1, 3, 2, 2, 2, 4, 5, 3, 2, 1])
        res = max_over_periods(s1, winsize)


    def test_min_over_periods(self):
        s1 = pd.Series([np.nan, 7, 6, 5, 4, 3, np.nan, np.nan, 2, 1][::-1])
        expected = s1.rolling(3).min()
        res = min_over_periods(s1, pd.Series([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]))
        pd.testing.assert_series_equal(expected, res)




        s1 = pd.Series([np.nan, 7, 6, 5, 4, 3, np.nan, np.nan, 2, 1][::-1])
        winsize = pd.Series([1, 3, 2, 2, 2, 4, 5, 3, 2, 1])
        res = min_over_periods(s1, winsize)
        ['value']

    def test_count_over_periods(self):
        s1 = pd.Series([np.nan, 7, 6, 5, 4, 3, np.nan, np.nan, 2, 1])
        bools = pd.Series([True, False, True, True, False, True, False, False, True, True]).shift(1)
        s1_int = to_int(s1)
        ['value']
        ['value']

    def test_std(self):
        s1 = pd.Series([np.nan, 1, 2, np.nan, 3, 4, 5, 6])
        n = 3
        expected = s1.rolling(n).std()
        res = std(s1, n)
        pd.testing.assert_series_equal(expected, res)

        s = pd.Series([1000000000000000000000, 1.0, 1, np.nan, 2, 3, 1, 5, 9])
        res = std(s, pd.Series([3, 3, 3, 3, 3, 3, 3, 3, np.nan]).astype('Int64'))
        ['value']

    def test_ago(self):
        s1 = pd.Series([np.nan, 1, 2, np.nan, 3, 4, 5, 6])
        expected = s1.shift(3)
        res = ago(s1, pd.Series([3, 3, 3, 3, 3, 3, 3, 3]))
        pd.testing.assert_series_equal(expected, res)
        ['value']

    def test_if_else(self):
        s1 = pd.Series([np.nan, 1, 2, np.nan, 3, 4, 5, 6, 4])
        s2 = pd.Series([np.nan, 5, 5, 7, 2, 2, 5, 1, np.nan])
        # res = if_else(s1 > s2, s1, s2)  # should not use > directly, np.nan > 10 is true
        res = if_else(s1 > s2, s1, if_else(s1 <= s2, s2, np.nan))
        res2 = max(s1, s2)
        ['value']
        pd.testing.assert_series_equal(res, res2)
        ['value']


if __name__ == '__main__':
    unittest.main()
