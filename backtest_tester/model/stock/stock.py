from dataclasses import dataclass
from typing import *
import re
import os
import pandas as pd
from utils.date import *


class Stock:
    def __init__(self, path: str = None) -> None:
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
        if path is not None:
            self.init_by_path(path)
    def copy(self):
        stock = Stock()
        stock.symbol = self.symbol
        stock.name = self.name
        stock.time_period = self.time_period
        stock.split_adjust = self.split_adjust
        stock.date = self.date.copy()
        stock.open = self.open.copy()
        stock.close = self.close.copy()
        stock.high = self.high.copy()
        stock.low = self.low.copy()
        stock.volume = self.volume.copy()
        stock.turn_volume = self.turn_volume.copy()
        stock.timestamp = self.timestamp.copy()
        return stock

    def slice_by_date(self, start_date: date, end_date: date) -> 'Stock':
        if start_date is None and end_date is None:
            return self
        sliced_stock = Stock()
        sliced_stock.symbol = self.symbol
        sliced_stock.name = self.name
        sliced_stock.time_period = self.time_period
        sliced_stock.split_adjust = self.split_adjust
        for i in range(len(self.date)):
            if start_date is not None and self.date[i] < start_date:
                continue
            if end_date is not None and self.date[i] > end_date:
                break

            sliced_stock.date.append(self.date[i])
            sliced_stock.open.append(self.open[i])
            sliced_stock.close.append(self.close[i])
            sliced_stock.high.append(self.high[i])
            sliced_stock.low.append(self.low[i])
            sliced_stock.volume.append(self.volume[i])
            sliced_stock.turn_volume.append(self.turn_volume[i])
            sliced_stock.timestamp.append(self.timestamp[i])
        sliced_stock._generate_date_to_index()
        return sliced_stock

    def init_by_path(self, path: str) -> None:
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

    def _generate_date_to_index(self):
        self.date_to_index = {}
        for i in range(len(self.date)):
            self.date_to_index[self.date[i]] = i

    def get_data_by_date(self, date_: date):
        if date_ not in self.date_to_index:
            return None
        index = self.date_to_index[date_]
        return {
            'date': self.date[index],
            'open': self.open[index],
            'close': self.close[index],
            'high': self.high[index],
            'low': self.low[index],
            'volume': self.volume[index],
            'turn_volume': self.turn_volume[index],
            'timestamp': self.timestamp[index]
        }

    def get_nearest_non_nan_data_by_date(self, date_: date):
        if date_ in self.date_to_index:
            return self.get_data_by_date(date_)
        else:
            # reduce date_ until find a valid date
            while date_ not in self.date_to_index:
                date_ = date_ - timedelta(days=1)
                # latest date_ is 1990-12-19
                if date_ < date(1990, 12, 19):
                    return None
            return self.get_data_by_date(date_)

if __name__ == '__main__':
    pass
