import builtins
import collections
import inspect
import types
import numpy as np
import pandas as pd

from utils.my_exception import NonSenseTypeError
from utils.my_typing import *
from typing import *

"""
    In the following functions: 
        1. pandas.Series is used as just a consecutive array
             a. index will not lost and order of index will not change
             b. if a Series has lost index or index order changed(like by s[::-1], 
                    before calling function, convert it to a array with consecutive ascending index first 
        2. careful about if_else:
            s1 = [np.nan, 1, 10,  2]
            s2 = [2,      5,  3, np.nan]
            if_else(s1 > s2, s1, s2) -> [np.nan, 5, 10, 2]  # last nan of s2 might not be expected
            if_else(s1 > s2, s1, if_else(s1 <= s2, s2, np.nan)) -> [np.nan, 5, 10, np.nan]
        3. single value only comes from user input, so functions like add(1, 2), abs(1) not allowed, user should do it by itself
"""


def add(s1: Number | Series[Number],
        s2: Number | Series[Number]) -> Number | Series[Number]:
    # if isinstance(s1, pd.Series) and isinstance(s2, pd.Series):
    #     if s1.dtype == 'Int64' and s2.dtype == 'Int64':
    #         return (s1 + s2).astype('Int64')
    return s1 + s2


def minus(s1: Number | Series[Number],
          s2: Number | Series[Number]) -> Number | Series[Number]:
    return s1 - s2


def multiply(s1: Number | Series[Number],
             s2: Number | Series[Number]) -> Number | Series[Number]:
    return s1 * s2


def divide(s1: Number | Series[Number],
           s2: Number | Series[Number]) -> Number | Series[Number]:
    return s1 / s2


def round(s: Number | Series[Number],
          n: NonNegInt = 2) -> Number | Series[Number]:
    if isinstance(s, pd.Series):
        if n == 0:
            return s.round(0).astype('Int64')
        return s.round(n)
    return builtins.round(s, n)


def abs(s: Number | Series[Number]) -> Number | Series[Number]:
    if isinstance(s, pd.Series):
        return s.abs()
    return builtins.abs(s)


def max(s1: Series[Number] | Number,
        s2: Series[Number] | Number) -> Series[Number] | Number:
    if isinstance(s1, pd.Series) or isinstance(s2, pd.Series):
        return pd.Series(np.maximum(s1, s2))
    return builtins.max(s1, s2)


def min(s1: Series[Number] | Number,
        s2: Series[Number] | Number) -> Series[Number] | Number:
    if isinstance(s1, pd.Series) or isinstance(s2, pd.Series):
        return pd.Series(np.minimum(s1, s2))
    return builtins.min(s1, s2)


def and_(s1: Series[Bool], s2: Series[Bool]) -> Series[Bool]:
    return s1 & s2


def or_(s1: Series[Bool], s2: Series[Bool]) -> Series[Bool]:
    return s1 | s2


def higher(s1: Series[Number] | Number, s2: Series[Number] | Number) -> Series[Bool] | Bool:
    if isinstance(s1, pd.Series) or isinstance(s2, pd.Series):
        return s1.combine(s2, np.greater)
    return s1 > s2


def lower(s1: Series[Number] | Number, s2: Series[Number] | Number) -> Series[Bool] | Bool:
    if isinstance(s1, pd.Series) or isinstance(s2, pd.Series):
        return s1.combine(s2, np.less)
    return s1 < s2


def cross_above(s1: Series[Number], s2: Series[Number]) -> Series[Bool]:
    cross_bool = s1 > s2
    count_bool = count_over_periods(cross_bool, 2) == 1
    return count_bool * cross_bool


def cross_below(s1: Series[Number], s2: Series[Number]) -> Series[Bool]:
    cross_bool = s1 <= s2
    count_bool = count_over_periods(cross_bool, 2) == 1
    return count_bool * cross_bool


def sum_over_periods(s: Series[Number],
                     n: Series[PosInt] | PosInt) -> Series[Number]:
    """
        if n is positive integer: return sum of last n periods(include current period)
        if n is positive integer series: return sum of last n[i] periods(include current period) for each period i
    """
    if not isinstance(n, pd.Series):
        # return s.rolling(n).sum(skipna=True)  # skipna not work in rolling().sum()
        return s.rolling(n, min_periods=n).sum()  # min_periods = min number of non-nan values in the window
    if isinstance(n, pd.Series):
        return pd.Series(
            map(
                lambda v, i: s.iloc[builtins.max(0, i - v + 1): i + 1].sum(skipna=False) if not pd.isnull(
                    v) and i - v + 1 >= 0 else np.nan,
                n,
                n.index
            )
        )


def count_over_periods(s_bool: Series[Bool], n: PosInt | Series[PosInt]) -> Series[NonNegInt]:
    return sum_over_periods(s_bool, n)


def max_over_periods(s: Series[Number],
                     n: PosInt | Series[PosInt]) -> Series[Number]:
    """
        if n is positive integer: return max of last n periods(include current period)
        if n is positive integer series: return max of last n[i] periods(include current period) of each period i
    """
    if not isinstance(n, pd.Series):
        return s.rolling(n, min_periods=n).max()
    return pd.Series(
        map(
            lambda v, i: s.iloc[builtins.max(0, i - v + 1): i + 1].max(skipna=False) if not pd.isnull(
                v) and i - v + 1 >= 0 else np.nan,
            n,
            n.index
        )
    )


def min_over_periods(s: Series[Number],
                     n: PosInt | Series[PosInt]) -> Series[Number]:
    """
        if n is positive integer: min of last n periods(include current period)
        if n is positive integer series: min of last n[i] periods(include current period) of each period i
    """
    if not isinstance(n, pd.Series):
        return s.rolling(n, min_periods=n).min()
    return pd.Series(
        map(
            lambda v, i: s.iloc[builtins.max(0, i - v + 1): i + 1].min(skipna=False) if not pd.isnull(
                v) and i - v + 1 >= 0 else np.nan,
            n,
            n.index
        )
    )


def ago(s: Series[AllBaseTypes],
        n: NonNegInt | Series[NonNegInt] = 1) -> Series[AllBaseTypes]:
    """
        negative integer not allowed, as you will never know the stock data in the future.

        if n is positive integer: value of n periods ago
        if n is positive integer series: value of n[i] periods ago of each period i
    """
    is_bool = s.dtype == bool
    res = None
    if isinstance(n, pd.Series):
        res = pd.Series(
            map(
                lambda v, i: v if pd.isnull(v) else s.iloc[i - v] if not pd.isnull(v) and i - v >= 0 else np.nan,
                n,
                n.index
            )
        )
    else:
        res = s.shift(n)
    if is_bool:
        res.fillna(False, inplace=True)
    return res


def diff_over_periods(s: Series[Number],
                      n: NonNegInt | Series[NonNegInt] = 1) -> Series[Number]:
    """
        negative integer not allowed, as you will never know the stock data in the future.

        if n is positive integer: value of current period - value of n periods ago
        if n is positive integer series: value of current period - value of n[i] periods ago for each period i
    """
    # return s.diff(n)
    return s - ago(s, n)


def std(s: Series[Number],
        n: PosInt | Series[PosInt],
        ddof: NonNegInt = 1) -> Series[Number]:
    if not isinstance(n, pd.Series):
        return s.rolling(n, min_periods=n).std(ddof=ddof)
    return pd.Series(
        map(
            lambda v, i: s.iloc[builtins.max(0, i - v + 1): i + 1].std(ddof=ddof, skipna=False) if not pd.isnull(
                v) and i - v + 1 >= 0 else np.nan,
            n,
            n.index
        )
    )
    # return s.rolling(n).std(ddof=ddof)


def if_else(s_bool: Series[Bool],
            s_true: AllTypes,
            s_false: AllTypes) -> AllTypes:
    return s_true.where(s_bool, s_false)


def periods_since_nth_to_last_true(s_bool: Series[Bool], n: PosInt = 1) -> Series[NonNegInt]:
    """
    return the periods from current period to the period when the nth to last of s_bool is True(excluding the current period)
    example:
        params:
            s_bool: [True, False, False, True, False, False, True, False, False, False]
            n: 1
        return:
            res :    [0,    1,     2,     3,    1,     2,     3,    1,     2,     3]
    """
    dq = collections.deque(maxlen=n)

    def helper(cur_index, cur_bool):
        # today's True should not be counted into the calculation of today's result
        # if cur_bool:
        #     dq.append(cur_index)
        # return cur_index - dq[0] if len(dq) == n else np.nan

        res = cur_index - dq[0] if len(dq) == n else np.nan
        if cur_bool:
            dq.append(cur_index)
        return res

    return pd.Series(map(helper, s_bool.index, s_bool)).astype('Int64')
    # return pd.Series(map(helper, s_bool.index, s_bool))


def when_nth_to_last(s_bool: Series[Bool], s: Series[AllBaseTypes], n: PosInt = 1) -> Series[AllBaseTypes]:
    """
    return the value of s at the nth to last True of s_bool(excluding the current period)
    example:
        params:
            s_bool: [True, False, False, True, False, False, True, False, False, False]
            s:      [1,    2,     3,     4,    5,     6,     7,    8,     9,     10]
            n: 1
        return:
            res:    [1,    1,     1,     4,    4,     4,     7,    7,     7,     7]
    """
    dq = collections.deque(maxlen=n)

    def helper(cur_index, cur_bool):

        res = s[dq[0]] if len(dq) == n else np.nan  # np.nan works the same as False for bool operation
        if cur_bool:
            dq.append(cur_index)
        return res

    return pd.Series(map(helper, s_bool.index, s_bool))


def ma(s: Series[Number], n: PosInt) -> Series[Number]:
    return s.rolling(n).mean()


def ema(s: Series[Number], n: PosInt) -> Series[Number]:
    return s.ewm(span=n, adjust=False).mean()


def sma(s: Series[Number], n: PosInt, m: PosInt = 1) -> Series[Number]:
    return s.ewm(com=n - m, adjust=True).mean()


def average_deviation(s: Series[Number], n: PosInt) -> Series[Number]:
    return s.rolling(n).apply(lambda x: (np.abs(x - x.mean())).mean())


def linear_regression(s: Series[Number], n: PosInt) -> Series[Number]:
    m = s[-n:]
    poly = np.polyfit(m.index, m.values, deg=1)
    y = np.polyval(poly, m.index)
    return pd.Series(y[1] - y[0], index=m.index)
