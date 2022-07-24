from ast import Pass
from pickle import FALSE
from numpy import dtype, float64, nan, rint
import pandas as pd
from MyTT1.MyTT import *
from stock import Stock

MAX_HOLDING_DAYS = [3]

def get_holding_signals(open_signals, close_signals,): 
    # return: Bool np.array
    # True if holding the stock, else False
    # open_sig=       [1,0,0,1,0,0,0,0,0,0,1,1,0,0,1,0,0,0]
    # close_sig=      [1,0,1,0,0,0,0,0,1,0,1,0,1,0,0,0,1,1]
    # holding结果：    [0,0,0,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0]
    # **思路：站在第i天，先不管max_holding_days, 那么这一天是持有还是不持有，就要往左边看，
    # 如果离得近的是close_signal，那就说明已经卖出了不持有，
    # 如果离得近的是open_signal, 那就说明有买入了，还没卖出，持有
    # 如果最近的open和close同一天，那么就不买入，不持有
    # 所以要把open_sig和close_sig的出现signal的当天的index提出，其他为Nan
    # 然后进行forward fill NaN， 让每一天都知道最近的一次open_sig和close_sig的index
    # 在进行哪个sig里的更近的判断，
    # 再结合max_holding_days，进行最终判断
    close_signals=pd.Series(close_signals)
    open_signals=pd.Series(open_signals)
    index_of_nearest_close_signal = pd.Series(close_signals.index.where(close_signals)).ffill()
    index_of_nearest_open_signal = pd.Series(open_signals.index.where(open_signals)).ffill()
    # print(index_of_nearest_close_signal.values)
    # print(index_of_nearest_open_signal.values)
    holding_to_next_day_without_holding_day_limit = index_of_nearest_open_signal > index_of_nearest_close_signal
    # print(np.array(list(map(lambda v: 1 if v else 0, holding_to_next_day_without_holding_day_limit)), dtype=np.float64))
    
# 到今天为止已经持有的天数, **注意，即使有NaN也不会阻断让cumsum()重置
    # 转换False 为 nan  (好像没必要，直接用 False判断也一样)
    holding_to_next_day_without_holding_day_limit.replace(False, np.nan)
    tmp = holding_to_next_day_without_holding_day_limit.replace(False, np.nan)
    
    # 这样如果index i是nan， 那么i的cumsum就会改变， 
    # 非nan的连续数值的cumsum会相同(以及连续数值前面的一个nan的cumsum也会相同，不过不影响结果)
    s = tmp.isna().cumsum()
    
    # 把在s中具有相同cumsum的数值(tmp的index映射s的值)分入同一个group进行cumsum计算（这样nan会被分开算）
    # 因为没有agg把group分为一组，结果还是会分开算
    
    # 获得：到今天为止已经持有的天数,
    holding_days = holding_to_next_day_without_holding_day_limit.groupby(s).cumsum()
    
    print(holding_days.values)
    # 过滤掉持有时间大于limit的index, where会把不满足条件的都替换成NaN，不用担心原来的NaN
    holding_to_next_day_with_holding_day_limit = holding_to_next_day_without_holding_day_limit.where(holding_days <= MAX_HOLDING_DAYS[0]).values
    print(holding_to_next_day_with_holding_day_limit)

if __name__ == '__main__':
    max_holding_days= 3
    open=       [1,0,0,1,0,0,0,0,0,0,1,1,0,0,1,0,0,0]
    close=      [1,0,1,0,0,0,0,0,1,0,1,0,1,0,0,0,1,1]
    holding=    [0,0,0,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0]
    open = pd.Series(map(lambda v: v == 1, open))
    close = pd.Series(map(lambda v: v == 1, close))
    holding = pd.Series(map(lambda v: v == 1, holding)).values
    close_index = pd.Series(close.index.where(close)).ffill().values
    print(close_index)
    open_index = pd.Series(open.index.where(open&(~close))).ffill().values
    print(open_index)
    
    print(pd.Series(open_index>close_index).replace(False, np.nan).cumsum().values)

    print(np.array(list(map(lambda v: 1 if v else 0, open_index > close_index)), dtype=np.float64))
    
    index = np.array(open.index, dtype=np.float64)
    
    get_holding_signals(open, close)
    # print(pd.Series(index).where(index <= close_index).values)
    real_open = open&(~close)
    func(open, close)
    # res = get_holding_to_next_day(open, close)