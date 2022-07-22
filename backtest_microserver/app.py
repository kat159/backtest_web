from asyncio import constants
from unicodedata import name
from flask import Flask, render_template, json, request
from flask_mysqldb import MySQL
import os
import db_connector as db
from flask_cors import CORS, cross_origin
from test import run_test, test_one_stock
from stock import *

# request.form --> x-www-form-urlencoded (body)
# request.get_json --> raw json(body)
# request.args --> query params

# string "ID" should be lower case when request

# Configuration

app = Flask(__name__)
cors = CORS(app)

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

STOCK_DATA_PATH = os.path.abspath('./stock_data')
STOCKS = get_all_stocks(STOCK_DATA_PATH)

# Routes 

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
        test_report = run_test(STOCKS, strategy)
        test_report = json.dumps(test_report)
        # print(test_report)
        return test_report
    return 'Other type request received, nothing to do currently'


if __name__ == '__main__':
    app.run(debug=True)