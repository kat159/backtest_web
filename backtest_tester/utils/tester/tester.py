from utils.my_inspect import *
from utils.my_typing import is_int_str, is_float_str, match_type

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
        variables):
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
    # print('res:', list(res))
    # print('res:', res)
    decode_final_criterion(final_criterion, stock, indicators, functions, variables)


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


