from unicodedata import name
from flask import Flask, render_template, json, request
import os
from flask_cors import CORS, cross_origin
from test import formula_executor, run_test, signals, test_one_stock
from stock import *
import test_refactor
import test_refactor2
# request.form --> x-www-form-urlencoded (body)
# request.get_json --> raw json(body)
# request.args --> query params

# string "ID" should be lower case when request

# Configuration

app = Flask(__name__)
cors = CORS(app)

''' Database:
    host= 'localhost'
    user= 'root'
    pswd= 'root'
    dtbs= 'power_plant'

    app.config['MYSQL_HOST'] = host
    app.config['MYSQL_USER'] = user
    app.config['MYSQL_PASSWORD'] = pswd
    app.config['MYSQL_DB'] = dtbs
    app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

    mysql = MySQL(app)

    db_connection = db.connect_to_database(host, user, pswd, dtbs)
'''

STOCK_DATA_PATH = os.path.abspath('./stock_data')
STOCKS = get_all_stocks(STOCK_DATA_PATH)


@app.route('/', methods=['POST', 'GET'])
@cross_origin()
def index():
    return 'Hello'


@app.route('/backtest', methods=['POST', 'GET', 'OPTIONS'])
@cross_origin()
def backtest():
    if request.method == 'OPTIONS':
        return 'OPTIONS request received'
    elif request.method == 'POST':
        strategy = request.get_json()
        # test_report = test_refactor.IntegratedTester(strategy).run_test(STOCKS)
        # test_report = test_refactor.run_test(STOCKS, strategy)
        test_report = test_refactor2.IntegratedTester(strategy).run_test(STOCKS)
        print(strategy)
        test_report = json.dumps(test_report)
        # print(test_report)
        return test_report
    return 'Other type request received, nothing to do currently'

@app.route('/formula_calculator', methods=['GET', 'OPTIONS', 'POST'])
@cross_origin()
def formula_calculator():
    body = request.get_json()
    print(body)
    formula = body['formula']
    symbol = body['symbol']
    return json.dumps(list(formula_executor(STOCKS[symbol], formula)))


@app.route('/stocks', methods=['GET', 'OPTIONS', 'POST'])
@cross_origin()
def get_stock():
    params = dict(request.args)
    body = request.get_json()
    request_stock_symbols = \
        body['stockSymbols'] if 'stockSymbols' in body else []
    print(request_stock_symbols)
    time_period_timestamp = body['timePeriods'] if 'timePeriods' in body else [
        0, float('inf')]
    res = [
        {
            'symbol': symbol,
            'timestamp': list(STOCKS[symbol].timestamp),
            'close': list(STOCKS[symbol].close),
            'open': list(STOCKS[symbol].open),
            'high': list(STOCKS[symbol].high),
            'low': list(STOCKS[symbol].low),
            'volume': list(STOCKS[symbol].volume),
            'name': STOCKS[symbol].name
        } for symbol in request_stock_symbols
    ]
    return {
        'data': res
    }


if __name__ == '__main__':
    app.run(debug=True, port=5000)
