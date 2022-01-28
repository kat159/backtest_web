from typing import *
import re
import os
import pandas as pd
from date import * 

class Stock:
    def __init__(self, path: str) -> None:
        self.symbol = ''
        self.name = ''
        self.time_frame = ''
        self.split_adjust = ''
        self.date = []
        self.open = []
        self.close = []
        self.high = []
        self.low = []
        self.volume = []
        self.turn_volume = []
        # TODO: try catch
        f = open(path)
        l = f.readline()
        title = re.split('\s', l.strip())
        
        self.symbol, self.name, self.time_frame, self.split_adjust \
                = title[0], ''.join(title[1:len(title)-2]), title[-2], title[-1]
        f.readline()
        while 1:
            l = f.readline()
            if not l:
                break
            data = re.split('\s', l.strip())
            if len(data) < 7:
                break
            self.date.append(to_date(data[0], '%Y/%m/%d'))
            self.open.append(float(data[1]))
            self.high.append(float(data[2]))
            self.low.append(float(data[3]))
            self.close.append(float(data[4]))
            self.volume.append(float(data[5]))
            self.turn_volume.append(float(data[6]))
        self.close = pd.Series(self.close)
        self.open = pd.Series(self.open)
        self.high = pd.Series(self.high)
        self.low = pd.Series(self.low)
        self.volume = pd.Series(self.volume)
        self.turn_volume = pd.Series(self.turn_volume)
        self.date = pd.Series(self.date)
        
def get_all_stocks(path: str):
    files = os.listdir(path)
    d = {}
    
    for file in files:
        stock = Stock(path + '\\' + file)
        d[stock.symbol] = stock
        
    return d

if __name__ == '__main__':
    stock = Stock(r'C:\Users\insect\Desktop\股票数据\SH#600000.txt')
    stocks = get_all_stocks(r'C:\Users\insect\Desktop\stock_data_test')
    print(stocks['600000'].close)