from flask import Flask, request, jsonify
from app import app
from model.criterion import criterion_service


@app.route('/api/backtest/user/<string:username>/criterion', methods=['POST'])
def save_criterion(username: str):
    # Return a JSON response
    data = request.get_json()
    criterion = data['criterion']

    id = criterion['id'] if 'id' in criterion else None
    name = criterion['name'] if 'name' in criterion else ''
    description = criterion['description'] if 'description' in criterion else ''
    params = criterion['params']
    variables = criterion['variables']
    final_criterion = criterion['return']


    variable_map = {}
    for variable in variables:
        variable_map[variable['name']] = variable
    res = criterion_service.save_criterion(final_criterion, variable_map, username, id, name, description)
    print(res)
    return jsonify(res)
    # return {'message': 'save_criterion received'}


@app.route('/api/backtest/user/<string:username>/criterion', methods=['GET'])
def page_criterion(username: str):
    page = int(request.args.get('page'))
    size = int(request.args.get('size'))
    return jsonify(criterion_service.page_criterion(username, page, size))

@app.route('/api/backtest/user/<string:username>/criterion/all', methods=['GET'])
def get_all_criterion(username: str):
    return jsonify(criterion_service.get_all_criterion(username))

@app.route('/api/backtest/criterion/<string:id>', methods=['GET'])
def get_criterion(id: str):
    return criterion_service.get_criterion(id)


@app.route('/api/backtest/criterion/<string:id>', methods=['DELETE'])
def delete_criterion(id: str):
    return criterion_service.delete_criterion(id)