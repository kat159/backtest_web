from collections import defaultdict
from datetime import date

import pandas as pd
import copy
from model.stock import stock_service
from model.stock.stock import Stock
from utils.my_pd import *
from utils.indicator import *


def run_test(
        stocks: dict[str, Stock],

        position_type: str,  # 'long' or 'short'
        open_criterion: str,  # executable criterion str
        close_criterion: str,  # executable criterion str

        stop_loss: float,  # 0-100 percentage
        take_profit: float,  # 0-100 percentage
        max_holding_days: int,
        capital_at_risk: float,  # 0-100 percentage
        bid_ask_spread: float,
        commission: float,  # 0-100 percentage

        initial_capital: float,
        start_date: date,
        end_date: date,
):
    for symbol, stock in stocks.items():
        stocks[symbol] = stock.slice_by_date(start_date, end_date)
    """
      data_map: {
        '2019-01-01': {
            'symbols_to_open': ['600000', '600001'],
            'symbols_to_close': ['600002', '600003'],
            'stocks': {
                '600000': {
                    'open': 1,
                    'high': 2,
                    'low': 3,
                    'close': 4,
                    'volume': 5,
                },
                '600001': ...,
            },
        }
      }
    """
    data_map = _get_stocks_date_to_data_map(stocks)
    signals = _get_signals(stocks, open_criterion, close_criterion)
    for _date, _signal in signals.items():
        data_map[_date]['symbols_to_open'] = _signal['symbols_to_open']
        data_map[_date]['symbols_to_close'] = _signal['symbols_to_close']

    def _simulate_trading():
        """
        return: {
            '2019-01-01': {
                'capital': 10000,
                'closed_positions': {
                    '600000': {
                        'open_date': '2019-01-01',
                        'close_date': '2019-01-02',
                        'open_price': 1,
                        'close_price': 2,
                        'volume': 100,
                        'profit': 100,
                        'close_cause': 'stop_loss' / 'take_profit' / 'max_holding_days' / 'close_criterion',
                    },
                },
                'holding_positions': {
                    '600000': {
                        'closing_price': 2,     # market closing price of the period(not closed position price)
                        'open_price': 1,
                        'open_date': '2019-01-01',
                        'open_index': 0,
                        'reopen_date': '2019-01-02',  # when stop loss | take profit | max holding days reached but meet open signal again, keep holding and reset the holding days
                        'reopen_price': 2,
                        'reopen_index': 1,
                        'volume': 100,
                        'details': [
                            {
                                'open_date': '2019-01-01',
                                'open_price': 1,
                                'index': 0,
                                'volume': 30,
                            },
                            {
                                'open_date': '2019-01-01',
                                'open_price': 1,
                                'index': 0,
                                'volume': 70,
                            }
                        ]
                    },
                    '600001': ...
                }
            }
        }
        """
        res: dict[date, dict] = defaultdict(lambda: {
            'capital': initial_capital,
            'closed_positions': {},
            'holding_positions': {},
        })

        cur_index = 0
        cur_capital = initial_capital
        cur_positions = {}
        for _date, _data in sorted(data_map.items(), key=lambda x: x[0]):
            # if having close signal and open signal at the same period, close it
            symbols_to_close_by_close_criterion_set = set(
                _data['symbols_to_close']) if 'symbols_to_close' in _data else set()
            symbols_to_open_by_open_criterion_set = set(_data[
                                                            'symbols_to_open']) - symbols_to_close_by_close_criterion_set if 'symbols_to_open' in _data else set()
            stocks_data = _data['stocks']

            pre_positions = cur_positions
            cur_positions = {}
            cur_closed_positions = {}

            # close positions
            for symbol, position in pre_positions.items():

                if symbol not in stocks_data: # trading suspension, skip
                    cur_positions[symbol] = position
                    continue

                cur_stock_data = stocks[symbol].get_nearest_non_nan_data_by_date(_date)

                # close position by close_criterion signals
                if symbol in symbols_to_close_by_close_criterion_set:
                    open_date = position['open_date']
                    close_date = _date
                    open_index = position['open_index']
                    open_price = position['open_price']
                    close_price = cur_stock_data['close'] - bid_ask_spread
                    volume = position['volume']
                    commission_fee = commission * volume * close_price
                    profit = (close_price - open_price) * volume - commission_fee

                    cur_closed_positions[symbol] = {
                        'open_date': open_date,
                        'close_date': close_date,
                        'open_price': open_price,
                        'close_price': close_price,
                        'volume': volume,
                        'profit': profit,
                        'commission_fee': commission_fee,
                        'spread_loss': bid_ask_spread * volume,
                        'close_cause': 'close_criterion',
                    }
                    cur_capital += close_price * volume - commission_fee
                    continue

                if symbol in symbols_to_open_by_open_criterion_set:
                    # if meet open signal again, keep holding and reset the holding days
                    cur_positions[symbol] = copy.deepcopy(position)
                    cur_positions[symbol]['reopen_date'] = _date
                    cur_positions[symbol]['reopen_price'] = cur_stock_data['close']
                    cur_positions[symbol]['reopen_index'] = cur_index
                else:  # close position by stop_loss | take_profit | max_holding_days
                    reopen_date = position['open_date'] if 'reopen_date' not in position else position['reopen_date']
                    reopen_index = position['open_index'] if 'reopen_index' not in position else position[
                        'reopen_index']
                    reopen_price = position['open_price'] if 'reopen_price' not in position else position[
                        'reopen_price']
                    max_holding_days_reached = cur_index - reopen_index >= max_holding_days
                    stop_loss_reached = (reopen_price - cur_stock_data['close']) / reopen_price >= stop_loss
                    take_profit_reached = (cur_stock_data['close'] - reopen_price) / reopen_price >= take_profit
                    if max_holding_days_reached or stop_loss_reached or take_profit_reached:
                        # if not meet open signal again, close position if stop_loss | take_profit | max_holding_days reached
                        open_date = position['open_date']
                        close_date = _date
                        open_index = position['open_index']
                        open_price = position['open_price']
                        close_price = cur_stock_data['close'] - bid_ask_spread
                        volume = position['volume']
                        commission_fee = commission * volume * close_price
                        profit = (close_price - open_price) * volume - commission_fee
                        cur_closed_positions[symbol] = {
                            'open_date': open_date,
                            'close_date': close_date,
                            'open_price': open_price,
                            'close_price': close_price,
                            'volume': volume,
                            'profit': profit,
                            'commission_fee': commission_fee,
                            'spread_loss': bid_ask_spread * volume,
                            'close_cause': 'stop_loss' if stop_loss_reached else 'take_profit' if take_profit_reached else 'max_holding_days',
                        }
                        cur_capital += close_price * volume - commission_fee
                    else:
                        cur_positions[symbol] = copy.deepcopy(position)
            # open positions
            symbols_to_open = []
            for symbol in symbols_to_open_by_open_criterion_set:
                if symbol in cur_positions or symbol in pre_positions or symbol in cur_closed_positions:
                    continue
                symbols_to_open.append(symbol)
            total_capital = cur_capital + sum(
                [stocks[symbol].get_nearest_non_nan_data_by_date(_date)['close'] * data['volume'] for symbol, data in cur_positions.items()])

            for i in range(len(symbols_to_open)):
                available_capital = cur_capital - total_capital * (1 - capital_at_risk)
                average_capital = available_capital / (len(symbols_to_open) - i)
                # max_volume = int(average_capital / stocks_data[symbols_to_open[i]]['close'])
                max_volume = int(average_capital / stocks[symbols_to_open[i]].get_nearest_non_nan_data_by_date(_date)['close'])
                volume = max(100, max_volume // 100 * 100)

                # if volume * stocks_data[symbols_to_open[i]]['close'] > cur_capital:
                #     continue
                if volume * stocks[symbols_to_open[i]].get_nearest_non_nan_data_by_date(_date)['close'] > cur_capital:
                    continue

                # open_price = stocks_data[symbols_to_open[i]]['close'] + bid_ask_spread
                open_price = stocks[symbols_to_open[i]].get_nearest_non_nan_data_by_date(_date)['close'] + bid_ask_spread
                commission_fee = commission * volume * open_price
                cur_positions[symbols_to_open[i]] = {
                    'open_date': _date,
                    'open_index': cur_index,
                    'open_price': open_price,
                    'volume': volume,
                    'commission_fee': commission_fee,
                    'spread_loss': bid_ask_spread * volume,
                }
                cur_capital -= commission_fee + open_price * volume

            total_capital = cur_capital + sum(
                # [stocks_data[symbol]['close'] * data['volume'] for symbol, data in cur_positions.items()])
                [stocks[symbol].get_nearest_non_nan_data_by_date(_date)['close'] * data['volume'] for symbol, data in cur_positions.items()])
            res[_date]['capital'] = total_capital
            res[_date]['closed_positions'] = copy.deepcopy(cur_closed_positions)
            res[_date]['holding_positions'] = copy.deepcopy(cur_positions)
            cur_index += 1

        return res

    capital_flow = _simulate_trading()

    def _metrics():
        pure_capital_flow = list(map(lambda x: x[1]['capital'], sorted(capital_flow.items(), key=lambda x: x[0])))

        max_drawdown = ((pd.Series(pure_capital_flow).cummax() - pd.Series(pure_capital_flow)) / pd.Series(
            pure_capital_flow).cummax()).max()
        sharpe_ratio = np.mean(pure_capital_flow) / np.std(pure_capital_flow)
        sortino_ratio = np.mean(pure_capital_flow) / np.std(
            [x for x in pure_capital_flow if x < np.mean(pure_capital_flow)])
        res = {
            'max_drawdown': max_drawdown,
            'sharpe_ratio': sharpe_ratio,
            'sortino_ratio': sortino_ratio,
        }
        print(res)
        return res

    return {
        'capital_flow': capital_flow,
        'metrics': _metrics(),
    }


def _get_stocks_date_to_data_map(stocks: dict[str, Stock]) -> dict[date, dict]:
    res: dict[date, dict] = defaultdict(lambda: {
        'stocks': {},
    })
    for symbol, stock in stocks.items():
        for i in range(len(stock.date)):
            res[stock.date[i]]['stocks'][symbol] = {
                'open': stock.open[i],
                'high': stock.high[i],
                'low': stock.low[i],
                'close': stock.close[i],
                'volume': stock.volume[i],
            }
    return res


def _get_signals(stocks: dict[str, Stock], open_criterion: str, close_criterion: str) -> dict[date, dict]:
    """
     return: {
        '2019-01-01': {
            'symbols_to_open': list[str],
            'symbols_to_close': list[str],
         },
         '2019-01-02': ...
     }
    """
    res: dict[date, dict] = defaultdict(lambda: {
        'symbols_to_open': [],
        'symbols_to_close': [],
    })
    for symbol, stock in stocks.items():
        open_signals = _execute_criterion(stock, open_criterion)
        if close_criterion is None:
            close_signals = [False] * len(open_signals)
        else:
            close_signals = _execute_criterion(stock, close_criterion)
        dates = stock.date
        for i in range(len(dates)):
            if open_signals[i]:
                res[dates[i]]['symbols_to_open'].append(symbol)
            if close_signals[i]:
                res[dates[i]]['symbols_to_close'].append(symbol)
    return res


def _execute_criterion(stock: Stock, criterion: str) -> list[bool]:
    open = pd.Series(stock.open)
    high = pd.Series(stock.high)
    low = pd.Series(stock.low)
    close = pd.Series(stock.close)
    volume = pd.Series(stock.volume)

    res = eval(criterion)
    return list(res)


if __name__ == '__main__':
    stocks = stock_service.get_all_stocks()

    open_criterion = 'and_(and_(higher(macd_signal(close, 12, 26, 9), ago(macd_signal(close, 12, 26, 9), 1)), lower(ago(macd_signal(close, 12, 26, 9), 1), ago(macd_signal(close, 12, 26, 9), 2))), higher(ago(macd_signal(close, 12, 26, 9), 1), ago(macd_signal(close, 12, 26, 9), add(periods_since_nth_to_last_true(and_(higher(macd_signal(close, 12, 26, 9), ago(macd_signal(close, 12, 26, 9), 1)), lower(ago(macd_signal(close, 12, 26, 9), 1), ago(macd_signal(close, 12, 26, 9), 2))), 1), 1))))'
    close_criterion = 'cross_above(ma(close, 5), ma(close, 10))'
    res = run_test(
        stocks=stocks,
        position_type='long',
        open_criterion=open_criterion,
        close_criterion=close_criterion,
        stop_loss=0.2,
        take_profit=0.2,
        max_holding_days=20,
        capital_at_risk=0.8,
        commission=0.0003,
        bid_ask_spread=0.01,
        initial_capital=100000,
        start_date=date(2018, 1, 1),
        end_date=date(2021, 1, 1),
    )
    res = filter(lambda x: len(x['holding_positions']) > 0 or len(x['closed_positions']) > 0, res.values())
