import numpy as np
import pandas as pd

from model.stock import Stock, get_all_stocks
from flask import Flask, request, jsonify

from dataclasses import dataclass
import json
from utils import my_pd, indicator
from utils.my_inspect import get_file_functions_map, FunctionInfo, get_file_functions_list
from types import MappingProxyType

from utils.my_typing import get_type_name

app = Flask(__name__)


@app.after_request
def set_cors_headers(response):
    # Set CORS headers
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


_stocks: dict[str, Stock] = get_all_stocks(r'C:\Users\insect\Desktop\stock_data_test')
_stocks_info = [{
    'name': stock.name,
    'symbol': stock.symbol,
} for stock in _stocks.values()]

functions: MappingProxyType[str, FunctionInfo] = MappingProxyType(get_file_functions_map(my_pd))
indicators: MappingProxyType[str, FunctionInfo] = MappingProxyType(get_file_functions_map(indicator))

def get_stocks() -> dict[str, Stock]:
    return _stocks.copy()


@app.route('/api/backtest/run-test', methods=['POST'])
def run_test():
    # Return a JSON response
    return {'message': 'Person object received'}


@app.route('/api/backtest/stock', methods=['GET'])
def get_stocks_info():
    return jsonify(_stocks_info)

@app.route('/api/backtest/indicator', methods=['GET'])
def get_indicators():
    _indicators_info = get_file_functions_list(indicator)
    return jsonify(_indicators_info)


@app.route('/api/backtest/function', methods=['GET'])
def get_functions():
    _functions_info = get_file_functions_list(my_pd)
    return jsonify(_functions_info)


@app.route('/api/backtest/stock/<string:symbol>', methods=['POST'])
def get_stock(symbol: str):
    stock = _stocks[symbol]

    request_indicators = request.json['indicators']
    print(request_indicators)
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
    # Return the stock as JSON
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
    })


if __name__ == '__main__':
    app.run(host='localhost', port=40000, debug=True)
