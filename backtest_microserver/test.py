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
MAX_HOLDING_DAYS = [1]
POSITION_TYPE = ['Long']
CAPITAL_AT_RISK = [1]


# **TODO: 目前用的算法没法做到,需要收集每天的buy/sell signals才可以,而不是收集每只股票的每天的returns计算
# 'Global Balanced': alwayse holding positions in average,昨天持100只股,今天卖出50只,买入100只,那么剩下今天的50只股票每只都卖出一点,给新买的100只留份额
# 'Local Balanced': 昨天持100只股,今天卖出50只,买入100只, 那么只有今天卖出剩余的50%资金去买入100只股票
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
    MAX_HOLDING_DAYS[0] = int(strategy['holdingDays'])
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
        LOW = LOW[valid_dates].values       # **否则pop掉的东西不会让index重置,
        HIGH = HIGH[valid_dates].values     # 比如s = pd.Series([False,True, False, True])
        OPEN = OPEN[valid_dates].values     # s[s]会返回 1:True, 3:True,
        DATE = DATE[valid_dates].values     # 这样是s[0]会报错,因为index 0 不存在,只能s.iloc[0]取得第一个数
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

def get_holding_to_next_day_signals(open_signals, close_signals,): 
    '''
    return: Bool np.array
    True if holding the stock to next day, else False
    '''
    ''' 思路:
        open_sig=       [1,0,0,1,0,0,0,0,0,0,1,1,0,0,1,0,0,0]
        close_sig=      [1,0,1,0,0,0,0,0,1,0,1,0,1,0,0,0,1,1]
        holding结果:     [0,0,0,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0]
        **思路: 站在第i天,先不管max_holding_days, 那么这一天是持有还是不持有,就要往左边看,
        如果离得近的是close_signal,那就说明已经卖出了不持有,
        如果离得近的是open_signal, 那就说明有买入了,还没卖出,持有
        如果最近的open和close同一天,那么就不买入,不持有
        所以要把open_sig和close_sig的出现signal的当天的index提出,其他为Nan
        然后进行forward fill NaN, 让每一天都知道最近的一次open_sig和close_sig的index
        在进行哪个sig里的更近的判断,
        再结合max_holding_days,进行最终判断
    '''
    
    close_signals=pd.Series(close_signals)
    open_signals=pd.Series(open_signals)
    # 每个index的value设为获取最近的signal的index
    index_of_nearest_close_signal = pd.Series(close_signals.index.where(close_signals)).ffill()
    index_of_nearest_open_signal = pd.Series(open_signals.index.where(open_signals)).ffill()
    # print(index_of_nearest_open_signal.values)
    # print(index_of_nearest_close_signal.values)
    # 如果最近的open_sig_index > close_sig_index, 
    #   或者open_sig_index不是nan 而close_sig_index为nan(还没出现过就是nan),那就是持有
    #   (可以把close_sig_index的nan替换为-1，就不用额外判断nan了)
    holding_to_next_day_without_holding_day_limit = (index_of_nearest_open_signal > index_of_nearest_close_signal) | ((~index_of_nearest_open_signal.isna()) & index_of_nearest_close_signal.isna())
    print('holding_to_next_day_without_holding_day_limit:', 
          np.array(list(map(lambda v: 1 if v else 0, holding_to_next_day_without_holding_day_limit)), dtype=np.float64)
          )
    
# 到今天为止已经持有的天数, **注意,即使有NaN也不会阻断让cumsum()重置
    # 转换False 为 nan  (好像没必要,直接用 False判断也一样)
    holding_to_next_day_without_holding_day_limit.replace(False, np.nan)
    tmp = holding_to_next_day_without_holding_day_limit.replace(False, np.nan)
    
    # 这样如果index i是nan, 那么i的cumsum就会改变, 
    # 非nan的连续数值的cumsum会相同(以及连续数值前面的一个nan的cumsum也会相同,不过不影响结果)
    group1 = tmp.isna().cumsum()
    
    # 把同一个open_sig后面的分为一组，如果遇到新的open_sig重置holding_days，
    # 比如open_sig是[1, 1, 1], max_holding是1天，
    # **如果不重置，那么holding_days会变成[1, 2, 3]
    # **就会造成错误: 最终经过max_holding_day=1的filter的holding_to_next_day会是[1, 0, 0]
    # **group2开头可能有NaN,grouby(group2)有NaN部分会直接被删去，cumsum()结果会变成-1，
    #   但是后面filter只需要正数，负数不影响，所以不管了
    group2 = index_of_nearest_open_signal
    
    # 把在group中具有相同cumsum的数值(tmp的index映射s的值)分入同一个group进行cumsum计算（这样nan会被分开算）
    #   跟Mysql一样，只要不Select group的字段，结果还是会把index全部分开
    
    # 获得: 到今天为止已经持有的天数,
    # print(group1.values)
    # print(group2.values)
    # print(list(holding_to_next_day_without_holding_day_limit.groupby([group1,group2])))
    holding_days = holding_to_next_day_without_holding_day_limit.groupby([group1,group2]).cumsum()
    # print('holding_days:', holding_days.values)
    # 过滤掉持有时间大于limit的index, where会把不满足条件的都替换成NaN,不用担心原来的NaN
    holding_to_next_day_with_holding_day_limit = holding_to_next_day_without_holding_day_limit.where(holding_days <= MAX_HOLDING_DAYS[0])
    # print(holding_to_next_day_with_holding_day_limit)
    return holding_to_next_day_with_holding_day_limit.replace(np.nan, False).values

def returns(stock: Stock, open_signals, close_signals, holding_days):
    ''' **老方法:  错误！ 并且效率低！！！ 如果max_holding_day 很大,要循环很多次
        for i in range(MAX_HOLDING_DAYS[0]):
                # 每天都要根据close-signal卖出,如果同天买入卖出信号,不买
                open_signals &= (~close_signals)
                open_signals |= REF(open_signals, i)
            holding = open_signals                  
            hold_from_yesterday = REF(holding, 1)  
        # 假设open_signal = [0, 1, 0, 0, 0]
        # 第二次i=1循环变成  [0, 1, 1, 0, 0]
        # 第三次i=2循环就变成[0, 1, 1, 1, 1]了
        # 不能原地变,又原地利用！
    '''
    
    holding_to_next_day= get_holding_to_next_day_signals(open_signals, close_signals)
    print('=========================')
    print(open_signals)
    print(close_signals)
    print(holding_to_next_day)
    hold_from_yesterday = REF(holding_to_next_day, 1)  # 当天买入要从后一天开始算收益
    print(hold_from_yesterday)
    # print('hold:', hold_from_yesterday)

# buy_cost利用from yesterday向右看，sell_cost利用holding_to_next_day想左看
# 防止用到~REF(), 不要取反REF()的结果，因为REF()会把shift得到的nan转换为False，取反就是Nan变成True，与想要的结果不一致

    # 当天盘尾买入的手续费 + spread, 总费率
    buy_cost = IF((~hold_from_yesterday) & REF(hold_from_yesterday, -1),  # 今天没持股,明天持股,说明今天买了
                  (CLOSE * COMMISSION[0] + BID_ASK_SPREAD[0]) / CLOSE,
                  0
                  )
    print('buy_cost', buy_cost)
    # 当天盘尾卖出的手续费 + spread, 总费率
    sell_cost = IF((~holding_to_next_day) & REF(holding_to_next_day, 1),  # 今天持股,明天没持股,说明今天卖了
                   (CLOSE * COMMISSION[0] + BID_ASK_SPREAD[0]) / CLOSE,
                   0
                   )
    print('sell_cost', sell_cost)
    # 今天持股收益，利用hold_from向左看，因为hold_from第一个必为NaN
    holding_returns = IF(hold_from_yesterday,
                         (CLOSE - REF(CLOSE, 1)) / REF(CLOSE, 1),
                         0
                         )
    print('holding_returns', holding_returns)
    # 今日净收益
    return_rates = holding_returns - sell_cost - buy_cost
    return_rates[np.isnan(return_rates)] = 0
    # 如果是short,取负
    return_rates = -return_rates if POSITION_TYPE[0] == 'Short' else return_rates
    # 累进收益率不应该在这算,要按总的平均算,这个只是一直股票的
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

if __name__ == '__main__':

    # get stocks dict
    stock_data_path = r'C:\Users\insect\Desktop\stock_data_test'
    stocks = get_all_stocks(stock_data_path)
    # print(returns(stocks[0], 1))
    
    # close = pd.Series([1, 2, 3, 4, 5, 6, 7])
    # sig = pd.Series([True, True, False, False, False, True, False])

    # Test: get_holding_to_nest_day_signals
    max_holding_days= 3
    open=       [0,0,1,0,0,1,0,0,0,0,0,0,1,1,0,0,1,0,0,0,1,1,1,1,1]
    close=      [0,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0,0,1,1,0,0,0,0,0]
    holding=    [0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0,1,1,1,1,1]
    open = pd.Series(map(lambda v: v == 1, open))
    close = pd.Series(map(lambda v: v == 1, close))
    holding = pd.Series(map(lambda v: v == 1, holding)).values
    
    # print(111, get_holding_to_next_day_signals(open, close))
    res = returns(stocks[0], open, close, 3)