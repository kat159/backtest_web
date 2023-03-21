from .my_typing import *

_one_period_width = 73  # px
_screen_height = 663  # px


def _absolute_slope(self, s: Series[Number], n: int = 1) -> Series[Number]:
    return abs(diff_over_periods(s))


def bullish_divergence(self, indicator: Series[Number]) -> Series[Bool]:
    return self.cross(indicator, self.close) > 0
