from re import M
from typing import *
from numpy import nan, rint
from pandas.core.indexing import convert_missing_indexer
from MyTT.hb_hq_api import *
from MyTT.MyTT import *
import matplotlib.pyplot as plt
import pandas as pd
from stock import *
import my_dict
from metrics import metrics

CLOSE = []
OPEN = []
HIGH = []
LOW = []
VOLUME = []
def run_test(stocks: Dict,strategy: Dict,):  
    rets = {}
    freq = {}
    start_date, end_date = map(lambda v: to_date(v, ), strategy['testParams']['timePeriod'])
    for stock in stocks.values():
        global CLOSE, OPEN, HIGH, LOW, VOLUME
        CLOSE = stock.close; OPEN = stock.open; HIGH = stock.high; LOW = stock.low; VOLUME = stock.volume; 
        DATE = stock.date
        valid_dates = (start_date <= DATE) & (DATE <= end_date)
        CLOSE = CLOSE[valid_dates]              # filter(if valid_date: remain; else pop())
        VOLUME = VOLUME[valid_dates]
        LOW = LOW[valid_dates]
        HIGH = HIGH[valid_dates]
        OPEN = OPEN[valid_dates]
        DATE = DATE[valid_dates]
        
        res = test_one_stock(stock, strategy)
        d = dict(zip(DATE, res))
        rets = my_dict.add_merge(rets, d)
        freq = my_dict.key_counter(freq, d)
    capital =  int(strategy['testParams']['capital'])
    rets = my_dict.div(rets, freq)                         # have to be in dict, since trading halt makes stocks' trading date vary
    rets = list(sorted(list(rets.items()), key=lambda item: item[0]))
    capital_flow = pd.Series(list(map(lambda tuple: tuple[1], rets)))
    capital_flow *= capital
    
    date = list(map(lambda tuple: tuple[0], rets))
    date = list(map(lambda d:str(d) , list(date)))
    m = metrics(capital_flow)
    print(len(date), len(capital_flow))
    
    res = {
        'date': date,
        'capitalFlow': list(capital_flow),
        'metrics': m,
    }
    return res
    
    print(rets)    

def returns(stock: Stock, open_signals, close_signals, holding_days):
    # close_signals NOT USED.  # take into account next SPRINT
    for i in range(holding_days):
        open_signals |= REF(open_signals, i)
    holding = open_signals                  # True if hold the stock, else false
    
    
    return_rates =  IF(open_signals, (CLOSE - REF(CLOSE, 1)) / REF(CLOSE, 1), 0)
    return_rates[np.isnan(return_rates)] = 0
    returns = return_rates + 1
    for i in range(1, len(returns)):
        returns[i] *= returns[i-1]
    return returns

def test_one_stock(stock: Stock, strategy: Dict):
    open_signals = signals(stock, strategy['openCriterion'])
    close_signals = signals(stock, strategy['closeCriterion'])
    rets = returns(stock, open_signals, close_signals, int(strategy['holdingDays']))
    pre = 0
    # print(rets)
    # print(rets)
    return rets
    # print(strategy)
    
def signals(stock: Stock, criterion: List[str]):
    
    s = [0]
    code = 's[0]=' + '(' + ') &('.join(criterion).strip() + ')'
    # print(code)
    exec(code)
    # print('CLOSE:', CLOSE)
    # print(s[0])
    return s[0]

def returns_test(close, open_signals, close_signals, holding_days):
    # close_signals NOT USED.  # take into account next SPRINT
    CLOSE = close
    for i in range(holding_days):
        open_signals |= REF(open_signals, i)
    return_rates =  IF(open_signals, (CLOSE - REF(CLOSE, 1)) / REF(CLOSE, 1), 0)
    return_rates[np.isnan(return_rates)] = 0
    returns = return_rates + 1
    for i in range(1, len(returns)):
        returns[i] *= returns[i-1]
    return returns



def demo(stock):
    CLOSE = stock.close
    s = [0]
    code = 's[0]=' + '(CLOSE>-0.8) & (CLOSE<100)'
    exec(code)
    print(s[0])


    

def helper(people):
    name, age = people.values() # 错误！！ values()的顺序不能保证！！
    return name, age


if __name__ == '__main__':
    # person = {'Allen', 18}
    # res = helper(person)
    # print(res)
    
    # get stocks dict
    stock_data_path = r'C:\Users\insect\Desktop\stock_data_test'
    stocks = get_all_stocks(stock_data_path)
    # print(returns(stocks[0], 1))

    # strategy = {
    #     'name': 'Strategy1',
    #     'position_type': 'Long',
    #     'position_open_criterion_code': 'CLOSE > 100',
    #     'position_close_criterion_code': 'CLOSE < 10',
    #     'position_hold_days': '1',
    #     'initial_capital': '100000',
    #     'capital_at_risk': '0.05',
    #     'commission': '0.08',
    #     'bid_ask_spread': '0.02',
    #     'testing_time_period': ['2020-Jan-1', '2021-Jan-1']
    # }
    # dates = strategy['testing_time_period'].split('~')
    # t1 = time.strptime(dates[0], r'%Y-%b-%d')
    # t2 = time.strptime(dates[1], r'%Y-%b-%d')
    # print(t2 > t1)
    # stock = stocks['600000']
    # CLOSE=stock.close
    # # exec('s=CLOSE>100')
    # # print(s)
    # demo(stock)
    close = pd.Series([1, 2, 3, 4, 5, 6, 7])
    sig = pd.Series([True, True, False, False, False, True, False])
    rets = returns_test(close, sig, sig, 2)
    print(rets)