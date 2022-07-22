from re import M
from typing import *
from numpy import nan, rint
from pandas.core.indexing import convert_missing_indexer
from MyTT1.MyTT import *
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
COMMISSION = [0]
BID_ASK_SPREAD = [0]
HOLDING_DAYS = [1]
POSITION_TYPE = ['Long']
CAPITAL_AT_RISK = [1]


# **TODO：目前用的算法没法做到，需要收集每天的buy/sell signals才可以，而不是收集每只股票的每天的returns计算
# 'Global Balanced': alwayse holding positions in average,昨天持100只股，今天卖出50只，买入100只，那么剩下今天的50只股票每只都卖出一点，给新买的100只留份额
# 'Local Balanced': 昨天持100只股，今天卖出50只，买入100只, 那么只有今天卖出剩余的50%资金去买入100只股票
PISITION_SELF_BALANCED_TYPE = 'Global Balanced'


def run_test(stocks: Dict, strategy: Dict,):
    '''
        Return: {
            'dates': ['2020-01-01', '2020-01-02', ....],
            'capital_flow': [1.01, 1.02, 1.1, 0.9, ....],
            'financial_ratios': {
                'standard-deviation': 0.3,
                'XXX': xxx,
                ...
            }
            'detailed_report': {
                '2020-01-01': {
                    [
                        ['600000', '中国银行', 0.05(盈利)],
                        ['600001', '工商银行', -0.03(盈利)],
                    ]
                },
                '2020-01-02': {

                }
            }

        }
    '''
    rets = {}
    freq = {}
    params = strategy['testParams']
    COMMISSION[0] = float(params['commission']) / 100
    BID_ASK_SPREAD[0] = float(params['bidAskSpread'])
    HOLDING_DAYS[0] = int(strategy['holdingDays'])
    POSITION_TYPE[0] = strategy['positionType']
    CAPITAL_AT_RISK[0] = float(params['capitalAtRisk']) / 100

    start_date, end_date = map(lambda v: to_date(v,), strategy['testParams']['timePeriod'])
    for stock in stocks.values():
        global CLOSE, OPEN, HIGH, LOW, VOLUME
        CLOSE = stock.close
        OPEN = stock.open
        HIGH = stock.high
        LOW = stock.low
        VOLUME = stock.volume
        DATE = stock.date
        valid_dates = (start_date <= DATE) & (DATE <= end_date)
        # filter(if valid_date: remain; else pop())
        CLOSE = CLOSE[valid_dates].values   # values会让pandas.Series 变为 numpy.ndarray
        VOLUME = VOLUME[valid_dates].values # 可以让index重置
        LOW = LOW[valid_dates].values       # **否则pop掉的东西不会让index重置，
        HIGH = HIGH[valid_dates].values     # 比如s = pd.Series([False,True, False, True])
        OPEN = OPEN[valid_dates].values     # s[s]会返回 1:True, 3:True,
        DATE = DATE[valid_dates].values     # 这样是s[0]会报错，因为index 0 不存在，只能s.iloc[0]取得第一个数
        res = test_one_stock(stock, strategy)
        d = dict(zip(DATE, res))
        rets = my_dict.add_merge(rets, d)
        freq = my_dict.key_counter(freq, d)
    capital = float(strategy['testParams']['capital'])
    # have to be in dict, since trading halt makes stocks' trading date vary
    rets = my_dict.div(rets, freq)
    rets = list(sorted(list(rets.items()), key=lambda item: item[0]))
    daily_returns = pd.Series(list(map(lambda tuple: tuple[1], rets))) * (1 - CAPITAL_AT_RISK[0])
    capital_flow = (daily_returns + 1).cumprod()
    date = list(map(lambda tuple: tuple[0], rets))
    date = list(map(lambda d: str(d), list(date)))
    m = metrics(capital_flow)
    capital_flow = capital_flow * capital  

    res = {
        'date': date,
        'capitalFlow': list(capital_flow),
        'metrics': m,
    }
    return res


def returns(stock: Stock, open_signals, close_signals, holding_days):
    for i in range(HOLDING_DAYS[0]):
        # 每天都要根据close-signal卖出，如果同天买入卖出信号，不买
        open_signals &= (~close_signals)
        open_signals |= REF(open_signals, i)
    holding = open_signals                  # True if hold the stock, else false
    hold_from_yesterday = REF(holding, 1)  # 当年买入要从后一天开始算收益
    # print('hold:', hold_from_yesterday)
    # 当天盘尾买入的手续费 + spread, 总费率
    
    buy_cost = IF((~hold_from_yesterday) & REF(hold_from_yesterday, -1),  # 今天没持股，明天持股，说明今天买了
                  (CLOSE * COMMISSION[0] + BID_ASK_SPREAD[0]) / CLOSE,
                  0
                  )
    
    # 当天盘尾卖出的手续费 + spread, 总费率
    sell_cost = IF(hold_from_yesterday & (~REF(hold_from_yesterday, -1)),  # 今天持股，明天没持股，说明今天卖了
                   (CLOSE * COMMISSION[0] + BID_ASK_SPREAD[0]) / CLOSE,
                   0
                   )
    # 今天持股收益
    holding_returns = IF(hold_from_yesterday,
                         (CLOSE - REF(CLOSE, 1)) / REF(CLOSE, 1),
                         0
                         )
    # 今日净收益
    return_rates = holding_returns - sell_cost - buy_cost
    return_rates[np.isnan(return_rates)] = 0
    # 如果是short，取负
    return_rates = -return_rates if POSITION_TYPE[0] == 'Short' else return_rates
    # 累进收益率不应该在这算，要按总的平均算，这个只是一直股票的
    # returns = return_rates + 1
    # returns = returns.cumprod()
    
    return return_rates


def test_one_stock(stock: Stock, strategy: Dict):
    open_signals = signals(stock, strategy['openCriterionStr'])
    close_signals = signals(stock, strategy['closeCriterionStr'])
    rets = returns(stock, open_signals, close_signals,
                   int(strategy['holdingDays']))
    return rets
''' 之前成功的
# def returns(stock: Stock, open_signals, close_signals, holding_days):
#     # close_signals NOT USED.  # take into account next SPRINT
#     for i in range(holding_days):
#         open_signals |= REF(open_signals, i)
#     holding = open_signals                  # True if hold the stock, else false

#     return_rates =  IF(open_signals, (CLOSE - REF(CLOSE, 1)) / REF(CLOSE, 1), 0)
#     return_rates[np.isnan(return_rates)] = 0
#     returns = return_rates + 1
#     for i in range(1, len(returns)):
#         returns[i] *= returns[i-1]
#     return returns

# def test_one_stock(stock: Stock, strategy: Dict):
#     open_signals = signals(stock, strategy['openCriterionStr'])
#     close_signals = signals(stock, strategy['closeCriterionStr'])
#     rets = returns(stock, open_signals, close_signals, int(strategy['holdingDays']))
#     return rets
'''



def signals(stock: Stock, criterion: str):
    s = [0]
    code = 's[0]=' + criterion
    # print('Executing code:', code)
    exec(code)
    # print('signals', s[0])
    return s[0]


def returns_test(close, open_signals, close_signals, holding_days):
    # close_signals NOT USED.  # take into account next SPRINT
    CLOSE = close
    for i in range(holding_days):
        open_signals |= REF(open_signals, i)
    return_rates = IF(open_signals, (CLOSE - REF(CLOSE, 1)) / REF(CLOSE, 1), 0)
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
    name, age = people.values()  # 错误！！ values()的顺序不能保证！！
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
