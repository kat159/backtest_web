from typing import *
from stock import Stock
from MyTT.MyTT import *
import pandas
import numpy
from numpy import nan

def BLJJ(stock: Stock, close_weight, high_weight, low_weight, 
         first_EMA_params: List[int], 
         accuracy,
         do_second_slope: bool,
         second_EMA_params: List[int]):
    
    close = stock.close
    high = stock.high
    low = stock.low
    
    # var1
    BLJJ_list = (close * close_weight + high * high_weight + low * low_weight) / (close_weight + high_weight + low_weight)
    
    # var2
    for param in first_EMA_params:
        BLJJ_list = EMA(BLJJ_list, param)
        
    # J
    BLJJ_list = DIFF(BLJJ_list) / REF(BLJJ_list, 1) * accuracy
    # second slope
    if do_second_slope:
        BLJJ_list = DIFF(BLJJ_list)
        for param in second_EMA_params:
            # print(BLJJ_list, param)
            BLJJ_list = EMA(BLJJ_list, param)
    BLJJ_list[np.isnan(BLJJ_list)] = 0          # replace nan with 0
    # res = list(BLJJ_list)
    # res = map(lambda num: num * 2, res)
    # res = list(res)
    # print('res = ', res[len(res)-10:])
    return BLJJ_list


stock = Stock(r'C:\Users\insect\Desktop\股票数据\SH#600000.txt')
closeW, highW, lowW = 2, 1, 1
firstEMA = [2, 2, 2, 2, 2, 2, 2]
accuracy = 1000
do_second_slope = True
secondEMA = [2, 2, 1]
bljj = BLJJ(stock, closeW, highW, lowW, firstEMA, accuracy, do_second_slope, secondEMA)
print(bljj)
'''
[ 0.          0.          1.69089527 ... -0.87653355 -1.44011438
 -2.20484141]
'''

l1 = [3, 4, 5]
l2 = [1, 2, 3]
buy = [True, False, True]
l1, l2, buy = pd.Series(l1), pd.Series(l2), pd.Series(buy)
res = IF(buy, l1 - l2, 0)
print(res)