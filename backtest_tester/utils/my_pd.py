import collections
import inspect
import types
import numpy as np
import pandas as pd
from .my_typing import *
from typing import *


@type_check
def shift(s: Series[All], n: Integer = 1) -> types.MappingProxyType[tuple[int] | str, int]({
    'default': Series[All],
}):
    res = s.shift(n)
    if s.dtype == 'bool':
        res = s.fillna(False)
    return res


def add(s1: Number | Series[Number], s2: Number | Series[Number]) -> Number | Series[Number]:
    return s1 + s2


def minus(s1: Number | Series[Number], s2: Number | Series[Number]) -> Number | Series[Number]:
    return s1 - s2


def multiply(s1: Number | Series[Number], s2: Number | Series[Number]) -> Number | Series[Number]:
    return s1 * s2


def divide(s1: Number | Series[Number], s2: Number | Series[Number]) -> Number | Series[Number]:
    return s1 / s2


def round(s: Series[Number], n: Integer = 2) -> Series[Number]:
    return s.round(n)


def abs(s: Series[Number]) -> Series[Number]:
    return s.abs()


def max(s1: Series[Number], s2: Series[Number]) -> Series[Number]:
    return pd.Series(np.maximum(s1, s2), index=s1.index)


def min(s1: Series[Number], s2: Series[Number]) -> Series[Number]:
    return pd.Series(np.minimum(s1, s2), index=s1.index)


def ago(s: Series[All], n: PosInt = 1) -> Series[All]:
    return s.shift(n)


def diff_over_periods(s: Series[Number], n: PosInt = 1) -> Series[Number]:
    return s.diff(n)


def std(s: Series[Number], n: PosInt) -> Series[Number]:
    return s.rolling(n).std(ddof=0)


def if_else(s_bool: Series[Bool], s_true: Series[All], s_false: Series[All]) -> Series[All]:
    return s_true.where(s_bool, s_false)


def periods_since_nth_to_last_true(s_bool: Series[Bool], n: PosInt = 1) -> Series[NonNegInt]:
    dq = collections.deque(maxlen=n)

    def _lambda(i, b):
        if b:
            dq.append(i)
        return i - dq[0] if len(dq) == n else np.nan

    return pd.Series(map(_lambda, s_bool.index, s_bool))
    # res = []
    # for i, v in s_bool.iteritems():
    #     if v:
    #         dq.append(i)
    #     if len(dq) == n:
    #         res.append(i - dq[0])
    # return res


def sum_over_periods(s: Series[Number], n: PosInt) -> Series[Number]:
    return s.rolling(n).sum()


def max_over_periods(s: Series[Number], n: PosInt) -> Series[Number]:
    return s.rolling(n).max()


def min_over_periods(s: Series[Number], n: PosInt) -> Series[Number]:
    return s.rolling(n).min()


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


def count_over_periods(s_bool: Series[Bool], n: PosInt) -> Series[NonNegInt]:
    return s_bool.rolling(n).sum()


def cross_above(s1: Series[Number], s2: Series[Number]) -> Series[Bool]:
    cross_bool = s1 > s2
    count_bool = count_over_periods(cross_bool, 2) == 1
    return count_bool * cross_bool


def cross_below(s1: Series[Number], s2: Series[Number]) -> Series[Bool]:
    cross_bool = s1 <= s2
    count_bool = count_over_periods(cross_bool, 2) == 1
    return count_bool * cross_bool
