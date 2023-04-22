import json

from model import db
from utils.my_inspect import *
from utils.my_typing import *

VARIABLE = 'variable'
PARAM = 'param'
FUNCTION = 'function'
INDICATOR = 'indicator'
DATA = 'data'
INPUT = 'input'


def save_criterion(
        final_criterion,
        stock,
        indicators: MappingProxyType[str, FunctionInfo],
        functions: MappingProxyType[str, FunctionInfo],
        variables,
        username,
        id=None,
        name='',
        description=''):
    def helper(criterion):
        if criterion['_type'] == VARIABLE:
            return helper(variables[criterion['name']]['value'])
        elif criterion['_type'] == FUNCTION or criterion['_type'] == INDICATOR:
            func = functions[criterion['name']] if criterion['_type'] == FUNCTION else indicators[criterion['name']]
            param_type_map = dict(zip([param.name for param in func.params], [param.type for param in func.params]))
            params = criterion['params']
            func_kwargs = {}
            for param in params:
                res = helper(param['value'])
                if isinstance(res, dict):  # error json
                    if 'error' in res:
                        if '_nodeId' not in res:
                            res['_nodeId'] = param['_nodeId']
                        return res
                    else:
                        return {'error': 'Internal error: unknown return dict', '_nodeId': param['_nodeId']}
                else:  # calculation of param success
                    if not match_type(param_type_map[param['name']], res):
                        return {
                            'error': 'Type mismatch',
                            '_nodeId': param['_nodeId'],
                            'error_func': func.name,
                            'error_param': param['name'],
                            'expected_type': param_type_map[param['name']],
                            'actual_type': type(res).__name__,
                            'param_data': res
                        }
                    func_kwargs[param['name']] = res
            return func.func(**func_kwargs)
        elif criterion['_type'] == DATA:
            return pd.Series(getattr(stock, criterion['name']))
        elif criterion['_type'] == INPUT:
            val = criterion['value']
            if is_int_str(val):
                return int(val)
            elif is_float_str(val):
                return float(val)
            else:
                return {
                    'error': 'invalid input: ' + val
                }
        else:
            return {
                'error': 'Internal error: invalid criterion type'
            }

    res = helper(final_criterion)
    if isinstance(res, dict):  # error dict
        return res
    elif not is_bool_series(res):
        return {
            'error': 'Invalid return type, expected Series[Bool]'
        }
    else:
        final_criterion_json = json.dumps(final_criterion)
        variables_json = json.dumps(variables)
        final_criterion_executable_str = \
            decode_final_criterion(final_criterion, stock, indicators, functions, variables)
        print('username:', type(username))
        print('name:', type(name), name)
        print('description:', type(description), description)
        print('final_criterion_json:', type(final_criterion_json))
        print('variables_json:', type(variables_json))
        print('final_criterion_executable_str:', type(final_criterion_executable_str), final_criterion_executable_str)
        if id is None:
            db.update(
                'INSERT INTO criterion (name, username, description, final_criterion_json, variables_json, final_criterion_executable_str) VALUES (%s, %s, %s, %s, %s, %s)',
                (name, username, description, final_criterion_json, variables_json, final_criterion_executable_str))
        else:
            db.update(
                'UPDATE criterion SET name = %s, description = %s, final_criterion_json = %s, variables_json = %s, final_criterion_executable_str = %s WHERE id = %s',
                (name, description, final_criterion_json, variables_json, final_criterion_executable_str, id))
        return {
            'success': True,
        }


def get_criterion(id):
    res = db.get('SELECT * FROM criterion WHERE id = %s', id)
    if len(res) == 0:
        return 'null'
    else:
        return res[0]


def delete_criterion(id):
    db.update('DELETE FROM criterion WHERE id = %s', id)
    return {
        'success': True
    }


def page_criterion(username, page, page_size):
    data = db.get('SELECT * FROM criterion WHERE username = %s LIMIT %s OFFSET %s',
                  (username, page_size, (page - 1) * page_size))
    total = db.get('SELECT COUNT(*) AS total FROM criterion WHERE username = %s', username)[0]['total']
    return {
        'data': data,
        'total': total
    }


def decode_final_criterion(
        final_criterion,
        stock,
        indicators: MappingProxyType[str, FunctionInfo],
        functions: MappingProxyType[str, FunctionInfo],
        variables):
    def helper(criterion):
        if criterion['_type'] == VARIABLE:
            return helper(variables[criterion['name']]['value'])
        elif criterion['_type'] == FUNCTION or criterion['_type'] == INDICATOR:
            func = functions[criterion['name']] if criterion['_type'] == FUNCTION else indicators[criterion['name']]
            param_type_map = dict(zip([param.name for param in func.params], [param.type for param in func.params]))
            params = criterion['params']
            func_kwargs = []
            for param in params:
                res = helper(param['value'])
                func_kwargs.append(res)
            return func.name + '(' + ', '.join(func_kwargs) + ')'
        elif criterion['_type'] == DATA:
            return criterion['name']
        elif criterion['_type'] == INPUT:
            return criterion['value']
        else:
            return {
                'error': 'Internal error: invalid criterion type'
            }

    res = helper(final_criterion)
    # print('decoded final criterion:', res)
    # print('res:', res)
    return res
