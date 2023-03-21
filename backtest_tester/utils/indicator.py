from .my_pd import *
from .my_typing import *


def macd(close: Series[Number], short: PosInt = 12, long: PosInt = 26, m: PosInt = 9) -> Series[Number]:
    dif = ema(close, short) - ema(close, long)
    dea = ema(dif, m)
    return round(dif), round(dea)


def macd_signal(close: Series[Number], short: PosInt = 12, long: PosInt = 26, m: PosInt = 9) -> Series[Number]:
    dif = ema(close, short) - ema(close, long)
    dea = ema(dif, m)
    return round(dea)


def kdj_k(close: Series[Number], high: Series[Number], low: Series[Number], n: PosInt = 9, m1: PosInt = 3,
          m2: PosInt = 3) -> Series[Number]:
    rsv = (close - min_over_periods(low, n)) / (max_over_periods(high, n) - min_over_periods(low, n)) * 100
    k = ema(rsv, (m1 * 2 - 1))
    return k


def kdj_d(close: Series[Number], high: Series[Number], low: Series[Number], n: PosInt = 9, m1: PosInt = 3,
          m2: PosInt = 3) -> Series[Number]:
    rsv = (close - min_over_periods(low, n)) / (max_over_periods(high, n) - min_over_periods(low, n)) * 100
    k = ema(rsv, (m1 * 2 - 1))
    d = ema(k, (m2 * 2 - 1))
    return d


def kdj_j(close: Series[Number], high: Series[Number], low: Series[Number], n: PosInt = 9, m1: PosInt = 3,
          m2: PosInt = 3) -> Series[Number]:
    rsv = (close - min_over_periods(low, n)) / (max_over_periods(high, n) - min_over_periods(low, n)) * 100
    k = ema(rsv, (m1 * 2 - 1))
    d = ema(k, (m2 * 2 - 1))
    j = k * 3 - d * 2
    return j


def bljj(close, high, low):
    def helper(close, high, low, close_weight, high_weight, low_weight,
               first_ema_params,
               accuracy,
               do_second_slope,
               second_ema_params):
        # var1
        bljj_list = (close * close_weight + high * high_weight + low *
                     low_weight) / (close_weight + high_weight + low_weight)
        # var2
        for param in first_ema_params:
            bljj_list = ema(bljj_list, param)
        # J
        bljj_list = diff_over_periods(bljj_list) / ago(bljj_list, 1) * accuracy
        # second slope
        if do_second_slope:
            bljj_list = diff_over_periods(bljj_list)
            for param in second_ema_params:
                bljj_list = ema(bljj_list, param)
        bljj_list[np.isnan(bljj_list)] = 0
        return bljj_list

    close_weight, high_weight, low_weight = 2, 1, 1
    first_ema = [2, 2, 2, 2, 2, 2, 2]
    accuracy = 1000
    do_second_slope = True
    second_ema = [2, 2, 1]
    return helper(close, high, low, close_weight, high_weight, low_weight, first_ema, accuracy, do_second_slope,
                  second_ema)
