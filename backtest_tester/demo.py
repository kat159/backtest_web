import collections
import math
import types
import decimal
import typing
from decimal import Decimal

import numpy as np
import pandas as pd

from utils import my_inspect
from utils.indicator import kdj_j
from utils.my_pd import *

Number = typing.NewType('Number', int)
Series = typing.NewType('Series', pd.Series)


def divide_series(s, divisor):
    result = s / divisor
    if result.dtype == 'Int64' and result.is_integer().all():
        return result.astype('Int64')
    else:
        return result.astype('float')


def test(name, age):
    print('name: ', name, ', age: ', age)


if __name__ == '__main__':
    pass



