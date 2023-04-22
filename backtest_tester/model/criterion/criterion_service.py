import numpy as np
import pandas as pd

from model.stock import Stock, get_all_stocks
from flask import Flask, request, jsonify

from dataclasses import dataclass
import json
from utils import my_pd, indicator
from utils.my_inspect import get_file_functions_map, FunctionInfo, get_file_functions_list
from types import MappingProxyType
from utils.tester import tester

from utils.my_typing import get_type_name
from model import criterion as criterion_service

@app.route('/api/backtest/user/<string:username>/criterion', methods=['POST'])
def save_criterion(username: str):
    # Return a JSON response
    data = request.get_json()
    criterion = data['criterion']

    id = criterion['id'] if 'id' in criterion else None
    name = criterion['name']
    description = criterion['description']
    params = criterion['params']
    variables = criterion['variables']
    final_criterion = criterion['return']

    # print('name:', name)
    # print('description:', description)
    # print('params:', params)
    # print('variables:', variables)
    # print('final_criterion:', final_criterion)

    variable_map = {}
    for variable in variables:
        variable_map[variable['name']] = variable
    criterion_service.save_criterion(final_criterion, _stocks['600000'], indicators, functions, variable_map, username,
                                     id, name, description)

    return {'message': 'save_criterion received'}


@app.route('/api/backtest/user/<string:username>/criterion', methods=['GET'])
def page_criterion(username: str):
    page = int(request.args.get('page'))
    size = int(request.args.get('size'))
    return jsonify(criterion_service.page_criterion(username, page, size))


@app.route('/api/backtest/criterion/<string:id>', methods=['GET'])
def get_criterion(id: str):
    return criterion_service.get_criterion(id)