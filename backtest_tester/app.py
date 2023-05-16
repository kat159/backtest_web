import datetime

from flask import Flask, request, jsonify

from model import db
from utils import my_pd, indicator
from utils.date import to_date
from utils.my_inspect import get_file_functions_map, FunctionInfo, get_file_functions_list
from types import MappingProxyType

app = Flask(__name__)

functions: MappingProxyType[str, FunctionInfo] = MappingProxyType(get_file_functions_map(my_pd))
indicators: MappingProxyType[str, FunctionInfo] = MappingProxyType(get_file_functions_map(indicator))


@app.after_request
def set_cors_headers(response):
    # Set CORS headers
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


@app.route('/api/backtest/signup', methods=['POST'])
def signup():
    print('signup', request.json)
    username = request.json['username']
    res = db.get('SELECT * FROM user WHERE username = %s', username)
    print(res)
    if res is None or len(res) == 0:
        db.update('INSERT INTO user (username) VALUES (%s)', username)
    return jsonify({'success': True})

@app.route('/api/backtest/indicator', methods=['GET'])
def get_indicators():
    _indicators_info = get_file_functions_list(indicator)
    return jsonify(_indicators_info)


@app.route('/api/backtest/function', methods=['GET'])
def get_functions():
    _functions_info = get_file_functions_list(my_pd)
    return jsonify(_functions_info)


@app.route('/api/backtest/run-test', methods=['POST'])
def run_test():
    data = request.get_json()

    strategy = data['strategy']
    '''
        data: {'strategy': {'openCriterionId': 18, 'closeCriterionId': 21, 'stopLoss': 20, 'takeProfit': 20, 'maxHoldingDays': 10, 'capitalAtRisk': 80, 'capital': 100000, 'commission': 0.03, 'bidAskSpread': 0.01, 'testDateRange': ['2019-12-31T16:00:00.000Z', '2020-12-30T16:00:00.000Z'], 'startDate': '2020-01-01', 'endDate': '2020-12-31'}}
    '''
    stocks = stock_service.get_all_stocks()
    position_type = strategy['positionType'] if 'positionType' in strategy else 'long'
    open_criterion = criterion_service.get_criterion(strategy['openCriterionId'])['final_criterion_executable_str']
    close_criterion = criterion_service.get_criterion(strategy['closeCriterionId'])['final_criterion_executable_str']
    stop_loss = strategy['stopLoss'] if 'stopLoss' in strategy else 0
    take_profit = strategy['takeProfit'] if 'takeProfit' in strategy else 0
    max_holding_days = strategy['maxHoldingDays'] if 'maxHoldingDays' in strategy else 0
    capital_at_risk = strategy['capitalAtRisk'] if 'capitalAtRisk' in strategy else 0
    initial_capital = strategy['capital'] if 'capital' in strategy else 0
    bid_ask_spread = strategy['bidAskSpread'] if 'bidAskSpread' in strategy else 0
    commission = strategy['commission'] if 'commission' in strategy else 0
    start_date = to_date(strategy['startDate'], '%Y-%m-%d') if 'startDate' in strategy else datetime.date(2000, 1, 1)
    end_date = to_date(strategy['endDate'], '%Y-%m-%d') if 'endDate' in strategy else datetime.date(2020, 12, 31)

    res = strategy_service.run_test(
        stocks,
        position_type,
        open_criterion,
        close_criterion,
        stop_loss / 100,
        take_profit / 100,
        max_holding_days,
        capital_at_risk / 100,
        bid_ask_spread,
        commission / 100,
        initial_capital,
        start_date,
        end_date,
    )
    capital_flow = res['capital_flow']
    metrics = res['metrics']
    # change key from datetime.date to str
    capital_flow = {str(k): v for k, v in capital_flow.items()}
    return jsonify({
        'capital_flow': capital_flow,
        'metrics': metrics,
    })


from model.criterion import criterion_controller, criterion_service
from model.stock import stock_controller, stock, stock_service
from model.strategy import strategy_controller, strategy_service
from model.user import user_controller


# if __name__ == '__main__':
#     app.run(port=40000, debug=True)