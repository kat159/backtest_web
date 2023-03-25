import inspect
import sys
import types
import typing
from types import MappingProxyType
# from builtins import function
from typing import List

import pandas as pd

from utils.my_typing import get_type_name, get_base_types, get_series_generic_types

# Specify the name of the Python file to inspect
filename = 'my_pd'


class FunctionInfo:
    class ParamInfo:
        def __init__(self, name: str, types_: type):
            self.name = name
            self.type = types_

    def __init__(self,
                 name: str,
                 func: types.FunctionType,
                 params: list[ParamInfo],
                 return_type: type,
                 comments: str):
        self.name = name
        self.func = func
        self.params = params
        self.return_type = return_type
        self.comments = comments


def get_file_functions_list(module: types.ModuleType) -> list[dict]:
    functions = get_file_functions_map(module)
    res = []
    for name, func_info in functions.items():
        for param in func_info.params:
            print('-------------------------')
            print('name:', param.name)
            print('type:', param.type)
            print('type name:', get_type_name(param.type))
            print('base types:', get_base_types(param.type))
            print('generic types:', get_series_generic_types(param.type))

        res.append({
            'name': name,
            'params': [{
                'name': param.name,
                'types': get_type_name(param.type),
                'selectable': len(get_series_generic_types(param.type)) > 0,
                'inputable': len(get_base_types(param.type)) > 0
            } for param in func_info.params],
            'return_type': get_type_name(func_info.return_type),
            'comments': func_info.comments,
            'type': 'builtin',
        })
    return res


def get_file_functions_map(module: types.ModuleType) -> MappingProxyType[str, FunctionInfo]:
    module_name = module.__name__
    functions_info = {}
    for name, func in inspect.getmembers(module, inspect.isfunction):
        if func.__module__ != module_name:
            continue
        sig = inspect.signature(func)
        comments = inspect.getdoc(func)

        return_type = sig.return_annotation

        params = [FunctionInfo.ParamInfo(param_name, param.annotation) for param_name, param in sig.parameters.items()]
        functions_info[name] = (FunctionInfo(name, func, params, return_type, comments))
    return types.MappingProxyType(functions_info)
    # # param_names = []
    # # param_types = []
    # # param_defaults = []
    # for param in sig.parameters.values():
    #     print(type(param))
    #     param_names.append(param.name)
    #     if param.annotation != inspect.Parameter.empty:
    #         param_types.append(param.annotation)
    #     else:
    #         param_types.append(None)
    #     if param.default != inspect.Parameter.empty:
    #         param_defaults.append(param.default)
    #     else:
    #         param_defaults.append(None)
    # return_type = sig.return_annotation
    #
    #
    # # Print the function information
    # print(f'Function name: {name}')
    # print(f'Parameters: {", ".join(param_names)}')
    # print(f'Parameter types: {", ".join(str(t) for t in param_types)}')
    # print(f'Parameter defaults: {", ".join(str(d) for d in param_defaults)}')
    # print(f'Return type: {return_type}')
    # print(f'Comments: {comments}')
    # print()

# get_file_functions_map(filename)
