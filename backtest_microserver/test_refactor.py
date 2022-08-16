from re import M
from typing import *
from numpy import nan, rint
from pandas.core.indexing import convert_missing_indexer
from MyTT1.MyTT import *
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


def formula_executor(stock: Stock, formula: str):
    # init_one_stock_data(stock)    // **多个request会不会让global混乱？ 下面的test是不是也会让global混乱？
    CLOSE = stock.close
    OPEN = stock.open
    HIGH = stock.high
    LOW = stock.low
    VOLUME = stock.volume
    DATE = stock.date
    s = [0]
    code = 's[0]=' + formula
    # print('Executing code:', code)
    exec(code)
    # print('signals', s[0])
    return s[0]


def init_one_stock_data(stock: Stock):
    global CLOSE, OPEN, HIGH, LOW, VOLUME
    CLOSE = stock.close
    OPEN = stock.open
    HIGH = stock.high
    LOW = stock.low
    VOLUME = stock.volume
    DATE = stock.date


def run_test(stocks: dict, strategy: dict,):
    params = strategy['testParams']
    COMMISSION = float(params['commission']) / 100
    BID_ASK_SPREAD = float(params['bidAskSpread'])
    MAX_HOLDING_DAYS = int(strategy['holdingDays'])
    POSITION_TYPE = strategy['positionType']
    CAPITAL_AT_RISK = float(params['capitalAtRisk']) / 100
    CAPITAL = float(strategy['testParams']['capital'])
    rets = {}
    freq = {}
    hold_to_tomorrow_stocks = {}
    hold_from_tomorrow_stocks = {}
    open_today_stocks = {}
    close_today_stocks = {}
    start_date, end_date = map(lambda v: to_date(
        v,), strategy['testParams']['timePeriod'])
    stocks_start_date = {}
    for stock in stocks.values():
        if True:  # pre-process stock data
            valid_dates = (start_date <= stock.date) & (stock.date <= end_date)
            # filter(if valid_date: remain; else pop())
            # values会让pandas.Series 变为 numpy.ndarray
            stock.close = stock.close[valid_dates].values
            stock.volume = stock.volume[valid_dates].values  # 可以让index重置
            # **否则pop掉的东西不会让index重置,
            stock.low = stock.low[valid_dates].values
            # 比如s = pd.Series([False,True, False, True])
            stock.high = stock.high[valid_dates].values
            # s[s]会返回 1:True, 3:True,
            stock.open = stock.open[valid_dates].values
            # 这样是s[0]会报错,因为index 0 不存在,只能s.iloc[0]取得第一个数
            stock.date = stock.date[valid_dates].values
        stocks_start_date[stock.symbol] = stock.date[0]
        open_signals = signals(stock, strategy['openCriterionStr'])
        close_signals = signals(stock, strategy['closeCriterionStr'])

        # 该股票每个index的holding sig
        hold_to_tomorrow_sig = get_holding_to_next_day_signals(
            open_signals, close_signals, MAX_HOLDING_DAYS)
        hold_from_yesterday_sig = REF(hold_to_tomorrow_sig, 1)

    # 该股票每个index当天的open sig（已考虑持有情况, 必然发生在不持有时)
        open_today = get_open_today(hold_from_yesterday_sig)

        # 以时间序列进行多个股票累计
        open_today_symbol = [[stock.symbol] if open_today[i] else []
                             for i in range(len(open_today))]
        open_today_symbol_ts = dict(zip(stock.date, open_today_symbol))
        open_today_stocks = my_dict.merge_concat(
            open_today_stocks, open_today_symbol_ts)

    # 该股票每个index当天的close sig（已考虑持有情况, 必然发生在持有时)
        close_today = get_close_today(hold_to_tomorrow_sig)

        # 以时间序列进行多个股票累计
        close_today_symbol = [[stock.symbol] if close_today[i] else []
                              for i in range(len(close_today))]
        close_today_symbol_ts = dict(zip(stock.date, close_today_symbol))
        close_today_stocks = my_dict.merge_concat(
            close_today_stocks, close_today_symbol_ts)

    if (len(open_today_stocks) != len(close_today_stocks)):
        print('错误： 长度不符')

    date = my_dict.time_series_to_sorted_dates(open_today_stocks)
    close_today_stocks_values = my_dict.time_series_to_sorted_values(
        close_today_stocks)
    open_today_stocks_values = my_dict.time_series_to_sorted_values(
        open_today_stocks)
    capital_flow, daily_test_report = test_intergrated(stocks, open_today_stocks_values, close_today_stocks_values,
                     date, CAPITAL, COMMISSION, COMMISSION,
                     BID_ASK_SPREAD, BID_ASK_SPREAD, CAPITAL_AT_RISK, POSITION_TYPE)
    m = metrics(pd.Series(capital_flow))
    res = {
        'date': date,
        'capitalFlow': capital_flow,
        'metrics': m,
        'daily_test_report': daily_test_report
    }
    return res


# **TODO:
#       1）open_today把多次出现的open_sig覆盖了，如果要补仓会补不了
#       2）新选项：股票卖出后允许买入几天前出现open_sig的股票进行补仓，
#           实现： open_today_stocks和close_today_stocks要改成hold_to_tomorrow_stocks， 以此找到还没被close_sig覆盖的旧买入信号
''' rebalance_types:
    {
        dynamic_rebalance: {    # 要考虑当天买入多的情况，卖出多的情况（买入更多现在持有的股票，还是买入旧信号？），
            always_holding_stock_equally,
        }
    }
'''

def test_intergrated(stocks, open_today_stocks, close_today_stocks, date,
                     capital, open_commission_rate, close_commission_rate, open_spread,
                     close_spread, capital_at_risk, position_type, rebalance_type='None'):
    print(open_today_stocks)
    cur_available_balance = capital
    cur_holdings = {}
    cur_avg_open_at_price = {}
    daily_test_report = []
    capital_flow = []
    def get_cur_holding_market_value():
        cur_holding_market_value = 0
        for symbol in cur_holdings:
            hands = cur_holdings[symbol]
            price = stocks[symbol].date_to_close[cur_date]
            cur_holding_market_value += price * hands
        return cur_holding_market_value

    close_spread = -close_spread if position_type == 'Long' else close_spread   # spread必须负面影响
    open_spread = open_spread if position_type == 'Long' else -open_spread

    # i = 集成array的index， 股票对应index = i - stocks_start_index[stock_symbol]
    for i in range(len(open_today_stocks)):
        cur_date = date[i]
    # handle close
        close_today = close_today_stocks[i]
        for symbol in close_today:
            if symbol not in cur_holdings:
                continue

            hands = cur_holdings.pop(symbol)
            cur_avg_open_at_price.pop(symbol)
            # 买入价
            close_at_price = stocks[symbol].date_to_close[cur_date] + close_spread
            amount = close_at_price * hands                                             # 股票总金额
            commission = amount * close_commission_rate                                 # 手续费
            # 更新可用余额
            cur_available_balance += (amount - commission)
    # 持有股票市值
        cur_holding_market_value = get_cur_holding_market_value()
    # 名义资金
        total_capital = cur_holding_market_value + cur_available_balance
    # 可用资金（除去capital at risk）
        capital_available_for_investing = min(total_capital * (1 - capital_at_risk) - cur_holding_market_value, 0)
    # handle open + rebalance
        open_today = open_today_stocks[i]
        position_change = position_rebalance(   # 执行所有close_sig之后，进行rebalance
            stocks, cur_holdings, open_today, close_today, capital_available_for_investing, date[i], rebalance_type)     
        position_change_report_today = []  
        for symbol, hands in position_change.items():
            hands = position_change[symbol]
            price = stocks[symbol].date_to_close[cur_date]
            if hands < 0:       # close for rebalancing
                price += close_spread
                print(position_change)
                print(stocks, cur_holdings, open_today, close_today, capital_available_for_investing, date[i], rebalance_type)
                cur_holdings[symbol] -= hands
                if cur_holdings[symbol] < 0:
                    print('Error: holding < 0')
                amount = price * hands
                commission = amount * close_commission_rate
                cur_available_balance += (amount - commission)
                
                position_change_report_today.append(
                    {
                        'symbol': symbol,
                        'type': 'close',
                        'bid_price': price,
                        'hands': hands,
                        'amount': amount,
                        'commission': commission,
                        'reason': 'signal'  # 'signal' / 'rebalance'
                    }
                )
            else:               # new open
                price += open_spread
                amount = price * hands
                cur_avg_open_at_price[symbol] = (cur_avg_open_at_price.get(
                    symbol, 0) * cur_holdings.get(symbol, 0) + amount) / (cur_holdings.get(symbol, 0) + hands)
                cur_holdings[symbol] = cur_holdings.get(
                    symbol, 0) + hands      # 可能是补仓，如果当天只卖没新信号
                commission = amount * open_commission_rate
                cur_available_balance -= (amount + commission)
                
                position_change_report_today.append(
                    {
                        'symbol': symbol,
                        'type': 'open',
                        'bid_price': price,
                        'hands': hands,
                        'amount': amount,
                        'commission': commission,
                        'reason': 'signal'  # 'signal' / 'rebalance'
                    }
                )
    # handle report
        cur_holding_market_value = get_cur_holding_market_value()
        cur_day_report = {
            'date': str(cur_date),
            'capital': cur_available_balance + cur_holding_market_value,
            'available_capital': cur_available_balance,
            'cur_position_detail': [
                {
                    'symbol': symbol,
                    # 'return_rate_today': 0.001,      # 如果是卖出要算入今天的   #要算入买入comission
                    'hands': cur_holdings[symbol],
                    'price_today': stocks[symbol].date_to_close[cur_date],
                    'average_open_at_price': cur_avg_open_at_price[symbol],
                    'net_accum_return': stocks[symbol].date_to_close[cur_date] / (cur_avg_open_at_price[symbol] * (1 + commission))
                } for symbol in cur_holdings
            ],
            'position_change': position_change_report_today
        }
        daily_test_report.append(cur_day_report)
        capital_flow.append(cur_available_balance + cur_holding_market_value)
        
    return (capital_flow, daily_test_report)
# **TODO: replace open_today with holding_to_next_day if rebalance with old open_signals


def position_rebalance(stocks, cur_holdings, open_today, close_today, capital_available, cur_date, rebalance_type, ):
    position_change = {}       # rebalance可能会卖出一些目前持有的股票
    if rebalance_type == 'None':        # **TODO: 不同的ra-balance strategy
        # **TODO: 尽可能接近capital_available，还是每只股票接近avg capital （目前是后者，如果钱少或者open_today很多，可能会少买很多）
        average_capital = capital_available // len(open_today) if len(open_today) else capital_available
        for symbol in open_today:
            price = stocks[symbol].date_to_close[cur_date]
            hands = average_capital // price
            if hands > 0:
                position_change[symbol] = hands
        return position_change
        # **position_change[close_symbole] = -10 表示平仓10手，
# ===============================Below is for one stock


def get_open_signals(stock: Stock, open_criterion_str):
    return signals(stock, open_criterion_str)


def get_close_signals(stock: Stock, close_criterion_str):
    return signals(stock, close_criterion_str)


def signals(stock: Stock, criterion: str):
    CLOSE = stock.close
    OPEN = stock.open
    HIGH = stock.high
    LOW = stock.low
    VOLUME = stock.volume

    s = [0]
    code = 's[0]=' + criterion
    exec(code)
    return s[0]


def get_holding_to_next_day_signals(open_signals, close_signals, max_holding_day):
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

    close_signals = pd.Series(close_signals)
    open_signals = pd.Series(open_signals)
    # 每个index的value设为获取最近的signal的index
    index_of_nearest_close_signal = pd.Series(
        close_signals.index.where(close_signals)).ffill()
    index_of_nearest_open_signal = pd.Series(
        open_signals.index.where(open_signals)).ffill()
    # print(index_of_nearest_open_signal.values)
    # print(index_of_nearest_close_signal.values)
    # 如果最近的open_sig_index > close_sig_index,
    #   或者open_sig_index不是nan 而close_sig_index为nan(还没出现过就是nan),那就是持有
    #   (可以把close_sig_index的nan替换为-1，就不用额外判断nan了)
    holding_to_next_day_without_holding_day_limit = (index_of_nearest_open_signal > index_of_nearest_close_signal) | (
        (~index_of_nearest_open_signal.isna()) & index_of_nearest_close_signal.isna())
    # print('holding_to_next_day_without_holding_day_limit:',
    #       np.array(list(map(lambda v: 1 if v else 0,
    #                holding_to_next_day_without_holding_day_limit)), dtype=np.float64)
    #       )

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
    holding_days = holding_to_next_day_without_holding_day_limit.groupby(
        [group1, group2]).cumsum()
    # print('holding_days:', holding_days.values)
    # 过滤掉持有时间大于limit的index, where会把不满足条件的都替换成NaN,不用担心原来的NaN
    holding_to_next_day_with_holding_day_limit = holding_to_next_day_without_holding_day_limit.where(
        holding_days <= max_holding_day)
    # print(holding_to_next_day_with_holding_day_limit)
    return holding_to_next_day_with_holding_day_limit.replace(np.nan, False).values

# buy_cost利用from yesterday向右看，sell_cost利用holding_to_next_day想左看
# 防止用到~REF(), 不要取反REF()的结果，因为REF()会把shift得到的nan转换为False，取反就是Nan变成True，与想要的结果不一致


def get_open_today(hold_from_yesterday):
    # 今天没持股,明天持股,说明今天买了
    return (~hold_from_yesterday) & REF(hold_from_yesterday, -1)


def get_close_today(hold_to_tomorrow):
    # 今天持股,明天没持股,说明今天卖了
    return (~hold_to_tomorrow) & REF(hold_to_tomorrow, 1)


def get_open_comission(stock: Stock, open_today, open_comission_rate):  # 百分比%
    return IF(open_today, open_comission_rate, 0)


def get_close_comission(stock: Stock, close_today, close_comission_rate):  # 百分比%
    return IF(close_today, close_comission_rate, 0)


def get_open_spread_cost(stock: Stock, open_today, open_spread):        # 百分比%
    close = stock.close
    return IF(open_today, open_spread / close, 0)


def get_close_spread_cost(stock: Stock, close_today, close_spread):     # 百分比%
    close = stock.close
    return IF(close_today, close_spread / close, 0)


def get_gross_returns(stock: Stock, hold_from_yesterday, position_type):
    close = stock.close
    # 今天持股收益，利用hold_from向左看，因为hold_from第一个必为NaN, 因为只算一只股票，不考虑capital at risk
    holding_returns = IF(hold_from_yesterday,
                         (close - REF(close, 1)) / REF(close, 1), 0)
    return holding_returns if position_type == 'Long' else -holding_returns


def get_net_returns(gross_returns, open_comission, close_commission, open_spread, close_spread):
    # 因为只算一只股票，不考虑capital at risk
    return gross_returns - open_comission - close_commission - open_spread - close_spread


if __name__ == '__main__':

    # stock_data_path = r'C:\Users\insect\Desktop\stock_data_test'      #全部股票
    stock_data_path = os.path.abspath('./stock_data')
    stocks = get_all_stocks(stock_data_path)
    # print(returns(stocks[0], 1))

    # close = pd.Series([1, 2, 3, 4, 5, 6, 7])
    # sig = pd.Series([True, True, False, False, False, True, False])

    # Test: get_holding_to_nest_day_signals
    max_holding_days = 3
    open = [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0,
            1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1]
    close = [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0,
             1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0]
    holding = [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0,
               0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1]
    open = pd.Series(map(lambda v: v == 1, open))
    close = pd.Series(map(lambda v: v == 1, close))
    holding = pd.Series(map(lambda v: v == 1, holding)).values

    # print(111, get_holding_to_next_day_signals(open, close))
    res = returns(stocks[0], open, close, 3)
