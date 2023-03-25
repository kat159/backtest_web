from .my_typing import *
from .indicator import *
from utils.my_pd import *

_one_period_width = 73  # px
_screen_height = 663  # px


def rebound(self, s: Series[Number]) -> Series[Number]:
    return (s > s.shift(1)) & (s.shift(1) < s.shift(2))


def bullish_divergence(self, indicator: Series[Number]) -> Series[Bool]:
    return (indicator > indicator.shift(1)) & (indicator.shift(1) < indicator.shift(2))


def bearish_divergence(self, indicator: Series[Number]) -> Series[Bool]:
    return ~bullish_divergence(self, indicator)
