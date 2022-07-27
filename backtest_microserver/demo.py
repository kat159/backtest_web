from ast import Pass
from asyncio import constants
import os
from pickle import FALSE
from numpy import dtype, float64, nan, rint
import pandas as pd
from MyTT1.MyTT import *
from stock import Stock, get_all_stocks

if __name__ == '__main__':
    sig = [False, True, False, True, False, False, True, False, False]
    sig = pd.Series(sig)
    pd_index = pd.Series(sig.index)
    res = pd_index[sig].values
    print(res)
