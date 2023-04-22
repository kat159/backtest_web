from dataclasses import dataclass
from typing import *
import re
import os
import pandas as pd
from utils.date import *


class Stock:
    def __init__(self, path: str) -> None:
        self.symbol = ''
        self.name = ''
        self.time_period = ''
        self.split_adjust = ''
        self.date = []
        self.open = []
        self.close = []
        self.high = []
        self.low = []
        self.volume = []
        self.turn_volume = []
        self.timestamp = []
        # TODO: try catch
        f = open(path, encoding='latin1')
        # f = open(path)    # stock data 第一行中文不是utf-8，linux报错
        l = f.readline()
        title = re.split('\s', l.strip())

        self.symbol, self.name, self.time_period, self.split_adjust \
            = title[0], ''.join(title[1:len(title) - 2]), title[-2], title[-1]
        self.name = self.name.encode('latin1').decode('gb2312').encode('utf-8').decode('utf-8')
        f.readline()
        while 1:
            l = f.readline()
            if not l:
                break
            data = re.split('\s', l.strip())
            if len(data) < 7:
                break
            self.timestamp.append(datetime.strptime(data[0], '%Y/%m/%d').timestamp())
            self.date.append(to_date(data[0], '%Y/%m/%d'))
            self.open.append(float(data[1]))
            self.high.append(float(data[2]))
            self.low.append(float(data[3]))
            self.close.append(float(data[4]))
            self.volume.append(float(data[5]))
            self.turn_volume.append(float(data[6]))
        # self.close = pd.Series(self.close)
        # self.open = pd.Series(self.open)
        # self.high = pd.Series(self.high)
        # self.low = pd.Series(self.low)
        # self.volume = pd.Series(self.volume)
        # self.turn_volume = pd.Series(self.turn_volume)
        # self.date = pd.Series(self.date)
        # self.timestamp = pd.Series(self.timestamp)
        f.close()


def get_all_stocks(path: str):
    files = os.listdir(path)
    d = {}

    for file in files[:5]:
        stock = Stock(path + '/' + file)
        # stock = Stock(path + '\\' + file)     # linux会报错
        d[stock.symbol] = stock
    return d


_stocks = None


def get_stocks():
    global _stocks
    if _stocks is None:
        _stocks = get_all_stocks('C:\\Users\\insect\\Desktop\\stock_data_test')
    return _stocks


if __name__ == '__main__':
    stock = Stock(r'C:\Users\insect\Desktop\股票数据\SH#600000.txt')
    stocks = get_all_stocks(r'C:\Users\insect\Desktop\stock_data_test')
    print(stocks['600000'].close)
