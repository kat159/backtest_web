from datetime import datetime

import numpy as np
import pandas as pd

from model.stock.stock import Stock
from model.stock.stock_service import get_all_stocks

from flask import Flask, request, jsonify

from dataclasses import dataclass
import json

from model.strategy import strategy_service
from utils import my_pd, indicator
from utils.my_inspect import get_file_functions_map, FunctionInfo, get_file_functions_list
from types import MappingProxyType
from utils.tester import tester

from utils.my_typing import get_type_name
from model.criterion import criterion_service
from app import app

_stocks: dict[str, Stock] = get_all_stocks()
_stocks_info = [{
    'name': stock.name,
    'symbol': stock.symbol,
} for stock in _stocks.values()]

functions: MappingProxyType[str, FunctionInfo] = MappingProxyType(get_file_functions_map(my_pd))
indicators: MappingProxyType[str, FunctionInfo] = MappingProxyType(get_file_functions_map(indicator))

@app.route('/api/backtest/stock', methods=['GET'])
def get_stocks_info():
    return jsonify(_stocks_info)


@app.route('/api/backtest/stock/<string:symbol>', methods=['POST'])
def get_stock(symbol: str):
    stock = _stocks[symbol]

    request_indicators = request.json['indicators']
    criterion_id = request.json['criterionId']

    start_date_str = request.json['startDate'] if 'startDate' in request.json else None
    end_date_str = request.json['endDate'] if 'endDate' in request.json else None
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
    stock = stock.slice_by_date(start_date, end_date)

    indicators_res = []
    if request_indicators:
        for request_indicator in request_indicators:
            indicator_name = request_indicator['name']
            indicator_type = request_indicator['type']
            if indicator_type == 'builtin':
                func = indicators[indicator_name].func
                params = indicators[indicator_name].params
                func_kwargs = {}
                for param in params:
                    if hasattr(stock, param.name):
                        func_kwargs[param.name] = pd.Series(getattr(stock, param.name))

                pandas_series = func(**func_kwargs)
                res = list(map(lambda x: None if pd.isnull(x) else x, pandas_series))
                indicators_res.append({
                    'name': indicator_name,
                    'type': indicator_type,
                    'data': res,
                })

    criterion_res = []
    if criterion_id:
        criterion = criterion_service.get_criterion(criterion_id)
        if criterion is not None:
            executable_criterion = criterion['final_criterion_executable_str']
            criterion_res = strategy_service._execute_criterion(stock, executable_criterion)


    return jsonify({
        'name': stock.name,
        'symbol': stock.symbol,
        'close': stock.close,
        'open': stock.open,
        'high': stock.high,
        'low': stock.low,
        'volume': stock.volume,
        'turn_volume': stock.turn_volume,
        'date': stock.date,
        'timestamp': stock.timestamp,
        'indicators': indicators_res,
        'criterion_res': criterion_res,
    })
