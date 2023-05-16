import json

from model import db
from model.stock.stock_service import get_all_stocks
from utils.my_inspect import *
from utils.my_typing import *
from utils import my_pd, indicator

VARIABLE = 'variable'
PARAM = 'param'
FUNCTION = 'function'
INDICATOR = 'indicator'
DATA = 'data'
INPUT = 'input'

stocks = get_all_stocks()
functions: MappingProxyType[str, FunctionInfo] = MappingProxyType(get_file_functions_map(my_pd))
indicators: MappingProxyType[str, FunctionInfo] = MappingProxyType(get_file_functions_map(indicator))


def save_criterion(
        final_criterion,
        variables,
        username,
        id=None,
        name='',
        description=''):
    def test_criterion():
        stock = stocks['600000']

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
                                'expected_type': get_type_name(param_type_map[param['name']]),
                                # 'actual_type': 'Series[Number]' if is_number_series(res) else 'Series[Integer]' if is_int_series(res) else 'Series[Bool]' if is_bool_series(res) else 'Number' if is_number(res) else 'Integer' if is_int(res) else 'Bool' if is_bool(res) else 'Unknown',
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

        return helper(final_criterion)

    def decode_final_criterion():
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

        #
        return res

    res = test_criterion()
    print(res)
    if isinstance(res, dict):  # error dict
        return res
    elif not is_bool_series(res):
        return {
            'error': 'Invalid return type, expected Series[Bool]',
            '_nodeId': 'final_criterion'
        }
    else:
        final_criterion_json = json.dumps(final_criterion)
        variables_json = json.dumps(variables)
        final_criterion_executable_str = decode_final_criterion()






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
    if res is None or len(res) == 0:
        return 'null'
    else:
        return res[0]


def delete_criterion(id):
    db.update('DELETE FROM criterion WHERE id = %s', id)
    return {
        'success': True
    }


def get_all_criterion(username):
    res = db.get('SELECT id, name, description FROM criterion WHERE username = %s', username)
    return res


def page_criterion(username, page, page_size):
    while 1:
        data = db.get('SELECT * FROM criterion WHERE username = %s LIMIT %s OFFSET %s',
                      (username, page_size, (page - 1) * page_size))
        if len(data) == 0:
            if page == 1:
                data = []
                break
            else:
                page -= 1
        else:
            break
    total = db.get('SELECT COUNT(*) AS total FROM criterion WHERE username = %s', username)[0]['total']
    return {
        'data': data,
        'total': total,
        'page': page,
    }


def get_criterion_result(id):
    criterion = get_criterion(id)
