import unittest

import numpy as np
import pandas as pd

from utils.my_typing import *
from utils.my_pd import *
from pandas.testing import assert_series_equal


class TestToBoolFunc(unittest.TestCase):
    def test_created(self):
        s1 = to_bool(pd.Series([True, False, False, True]))
        s2 = ~s1
        expected = pd.Series([False, True, True, False])
        assert_series_equal(s2, expected)

        s1 = to_bool(
            pd.Series([True, False, False, True]).shift(1)
        )
        s2 = ~s1
        expected = pd.Series([True, False, True, True])
        assert_series_equal(s2, expected)

        s1 = to_bool(
            pd.Series([True, False, np.nan, False])
        )
        s2 = ~s1
        expected = pd.Series([False, True, True, True])
        assert_series_equal(s2, expected)

        s1 = to_bool(
            pd.Series([True, False, np.nan, False]).shift(1)
        )
        s2 = ~s1
        expected = pd.Series([False, True, True, True])
        assert_series_equal(s2, expected)

        self.assertRaises(Exception, to_bool, pd.Series([True, False, 0]))
        self.assertRaises(Exception, to_bool, pd.Series([True, False, 1]))
        self.assertRaises(Exception, to_bool, pd.Series([True, False, 0.0]))
        self.assertRaises(Exception, to_bool, pd.Series([True, False, 1.0]))


class TestCases(unittest.TestCase):
    def test_is_non_neg_int(self):
        s1 = pd.Series([1, np.nan, 3, 4, 5])
        s2 = s1.shift(1)
        x = s1
        # (isinstance(x, int) and x >= 0) or pd.isnull(x) or (isinstance(x, str) and is_int_str(x) and int(x) >= 0)
        # res = (isinstance(x, int) and x >= 0)
        # res = pd.isnull(x)
        # res = (isinstance(x, str) and is_int_str(x) and int(x) >= 0)
        b1 = pd.Series([True, True, True, True, True])
        b2 = pd.Series([False, False, False, False, False])

    def test_created(self):
        s1 = to_int(pd.Series([1, 2, 3, 4]))
        s2 = s1 + 1
        expected = pd.Series([2, 3, 4, 5])
        assert_series_equal(s2, expected)

        s1 = to_int(pd.Series([1, 2, 3, 4]).shift(1))
        s2 = s1 + 1
        expected = pd.Series([2, 3, 4, 5])
        assert_series_equal(s2, expected)

        s1 = to_int(pd.Series([1, 2, np.nan, 4]))
        s2 = s1 + 1
        expected = pd.Series([2, 3, np.nan, 5])
        assert_series_equal(s2, expected)

        s1 = to_int(pd.Series([1, 2, np.nan, 4]).shift(1))
        s2 = s1 + 1
        expected = pd.Series([2, 3, 4, 5])
        assert_series_equal(s2, expected)

        self.assertRaises(Exception, to_int, pd.Series([1, 2, 3.0]))
        self.assertRaises(Exception, to_int, pd.Series([1, 2, 3.1]))


if __name__ == '__main__':
    unittest.main()
