from asyncio import constants
from unicodedata import name
from flask import Flask, render_template, json, request
from flask_mysqldb import MySQL
import os
import db_connector as db
from model import plant, fuel, region, technology, facility_tech, fuel_usage
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
        print(test_report)
        return test_report
    return 'Other type request received, nothing to do currently'










@app.route('/facilities/<plant_id>', methods=['GET', 'PATCH', 'DELETE'])
def facilities_by_id(plant_id):
    res = ''
    if request.method == "GET":
        res = plant.find_by_id(plant_id)
    elif request.method == 'PATCH':
        res = plant.update(request.get_json(), plant_id)
    else:
        res = plant.delete(plant_id)
    return json.dumps(res)

@app.route('/facilities', methods=['POST','GET', ])
def facilities():
    if request.method == "GET":
        data = dict(request.args)
        res = plant.find(data)
        res = json.dumps(res)
        return res
    elif request.method == "POST":
        body = request.get_json()
        plant.create(body)
        return 'Success'

@app.route('/fuels/<id>', methods=['GET', 'PATCH', 'DELETE'])
def fuels_by_id(id):
    res = 'Received GET by id request'
    if request.method == "GET":
        res = fuel.find_by_id(id)
    elif request.method == 'PATCH':
        res = fuel.update(request.get_json(), id)
    else:
        res = fuel.delete(id)
    return json.dumps(res)

@app.route('/fuels', methods=['POST','GET', ])
def fuels():
    body = request.get_json()
    if request.method == "GET":
        res = fuel.find_all()
        return json.dumps(res)
    elif request.method == "POST":
        fuel.create(body)
        return 'Success'

@app.route('/technologies/<id>', methods=['GET', 'PATCH', 'DELETE'])
def technologies_by_id(id):
    res = 'Received GET by id request'
    if request.method == "GET":
        res = technology.find_by_id(id)
    elif request.method == 'PATCH':
        res = technology.update(dict(request.args), id)
    else:
        res = technology.delete(id)
    return json.dumps(res)

@app.route('/technologies', methods=['POST','GET', ])
def technologies():
    body = request.get_json()
    if request.method == "GET":
        res = technology.find_all()
        return json.dumps(res)
    elif request.method == "POST":
        technology.create(body)
        return 'Success'

@app.route('/regions/<id>', methods=['GET', 'PATCH', 'DELETE'])
def regions_by_id(id):
    res = 'Received GET by id request'
    if request.method == "GET":
        res = region.find_by_id(id)
    elif request.method == 'PATCH':
        res = region.update(dict(request.args), id)
    else:
        res = region.delete(id)
    return json.dumps(res)

@app.route('/regions', methods=['POST','GET', ])
def regions():
    body = request.get_json()
    if request.method == "GET":
        res = region.find_all()
        return json.dumps(res)
    elif request.method == "POST":
        region.create(body)
        return 'Success'

@app.route('/facility_techs', methods=['POST','GET', 'PATCH', 'DELETE'])
def facility_techs():
    body = request.get_json()
    params = dict(request.args)
    if request.method == "GET":
        if 'technology_id' in params and 'plant_id' in params:
            res = facility_tech.find_by_id(params['plant_id'], params['technology_id'])
        else:
            res = facility_tech.find_all()
        return json.dumps(res)
    elif request.method == "POST":
        res = facility_tech.create(body)
        return 'Success'
    elif request.method == "PATCH":
        res = facility_tech.update(body, params['plant_id'], params['technology_id'])
        return 'Success'
    else:
        res = facility_tech.delete(params['plant_id'], params['technology_id'])
        return 'Success'
    
@app.route('/fuel_usages', methods=['POST','GET', 'PATCH', 'DELETE'])
def fuel_usages():
    params = dict(request.args)
    body = request.get_json()
    if request.method == "GET":   
        if 'fuel_type_id' in params and 'plant_id' in params:
            res = fuel_usage.find_by_id(params['plant_id'], params['fuel_type_id'])
        else:
            res = fuel_usage.find_all()
        return json.dumps(res)
    elif request.method == "POST":
        fuel_usage.create(body)
        return 'Success'
    elif request.method == "PATCH":
        res = fuel_usage.update(body, params['plant_id'], params['fuel_type_id'])
        return 'Success'
    else:
        res = fuel_usage.delete(params['plant_id'], params['fuel_type_id'])
        return 'Success'

if __name__ == '__main__':
    app.run(debug=True)