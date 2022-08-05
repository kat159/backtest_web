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
    # pd_index = pd.Series(sig.index)
    # res = pd_index[sig].values
    # print(res)
    # print(IF(sig, ['12'], []))
    d = {'a': 10}
    # print(d.pop('b'))
    for k, v in d.items():
        print(k, v)
        

class Strategy:
    def __init__(self, name) -> None:
        self.name = name
    def from_front_end(name):
        return Strategy(name)

print(Strategy.from_front_end('aa').name)