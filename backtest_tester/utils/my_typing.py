from functools import wraps
from typing import Dict
import numpy as np
import pandas as pd
from functools import wraps
from typing import Union


class _Series:
    def __getitem__(self, types):
        if isinstance(types, int):
            types = (types,)
        value = 1 << 31
        for t in types:
            value |= t
        return value


All = 1 << 0
Number = 1 << 1
Integer = 1 << 2
PosInt = 1 << 3
NonNegInt = 1 << 4
Bool = 1 << 5

Series = _Series()


def type_check(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        annotations = f.__annotations__
        arg_types = {k: type(v) for k, v in zip(annotations.keys(), args)}
        arg_types.update({k: type(v) for k, v in kwargs.items()})
        print('=========type check===========')
        for arg, expected_type in annotations.items():
            if arg not in arg_types:
                continue
            actual_type = arg_types[arg]
            print(f'{arg}: {actual_type} -> {expected_type}')
        result = f(*args, **kwargs)
        # print(f'result:\n{result} -> {annotations["return"]}')
        print(annotations)
        return_type = annotations["return"]
        if isinstance(return_type, dict):
            print('dict:', return_type[1])
            return_type[111] = 222
        else:
            print('not dict:', return_type['default'])
        return result

    return wrapper