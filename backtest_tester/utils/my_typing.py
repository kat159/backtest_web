import types
from functools import wraps
from typing import Dict, TypeVar, Generic, get_args, NewType
import numpy as np
import pandas as pd
from functools import wraps
from typing import *

# all the allowed types: int / float / bool / np.nan / None

# Bool = 1 << 5  # bool
# PosInt = 1 << 4  # int / np.nan / None
# NonNegInt = 1 << 3 | PosInt  # int / np.nan / None
# Integer = 1 << 2 | NonNegInt  # int / np.nan / None
# Number = 1 << 1 | Integer  # float / int / np.nan / None
#
# AllNumTypes = Number | Integer | PosInt | NonNegInt
# AllTypes = Number | Integer | PosInt | NonNegInt | Bool

T = TypeVar('T')


class Series(Generic[T], pd.Series):
    pass


Bool = NewType('Bool', Union[bool])

PosInt = NewType('Positive Integer', Union[int, float])
NonNegInt = NewType('Non-negative Integer', PosInt)
Integer = NewType('Integer', NonNegInt)
Number = NewType('Number', Integer)

AllBaseTypes = NewType('Bool | Number', Union[Bool, Number])
AllTypes = NewType('Any', Union[Bool, Number, Series[Number], Series[Bool]])


def can_be_series(type_):
    if get_origin(type_) is Series:
        return True
    elif get_origin(type_) is Union:
        return any(can_be_series(t) for t in get_args(type_))
    else:
        return False


def get_series_generic_types(type_):
    if get_origin(type_) is Series:
        args = get_args(type_)
        if get_origin(args[0]) is Union:
            return get_args(args[0])
        return args
    elif get_origin(type_) is Union:
        res = []
        for t in get_args(type_):
            res.extend(get_series_generic_types(t))
        return res
        # return tuple([get_series_generic_types(t) for t in get_args(type_)])
    else:
        return ()


def get_type_name(type_):
    if get_origin(type_) is Union:
        return ' | '.join(get_type_name(t) for t in get_args(type_))
    elif get_origin(type_) is Series:
        return 'Series[{}]'.format(get_type_name(get_args(type_)[0]))
    else:
        return type_.__name__


def is_base_type(type_):
    return get_origin(type_) is not Union and get_origin(type_) is not Series


def get_base_types(type_):
    if get_origin(type_) is Union:  # s: Number | Series[Number]  / s: Number | Bool | Series[Number] | Series[Bool]
        print('===================')
        print('union:', type_)
        print('args', get_args(type_))
        print('===================')
        return tuple(filter(lambda t: is_base_type(t), get_args(type_)))
    elif get_origin(type_) is Series:  # s: Series[..]
        return ()
    else:
        return (type_,)


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
        print('==return type==')
        if isinstance(return_type, dict):
            print('dict:', return_type)
            return_type[111] = 222
        elif isinstance(return_type, types.MappingProxyType):
            print('mapping proxy:', return_type)
        else:
            print('not dict:', get_args(return_type))  # utils.my_typing.Series[62]  --> how to retrieve 62?
        return result

    return wrapper


def to_bool(s: Series[AllTypes] | AllTypes) -> Series[Bool] | Bool:
    """
        np.nan -> False
        False -> False
        True -> True
        others: throw exception
    """

    def convert_single(x):
        if pd.isnull(x):
            return False
        elif isinstance(x, bool):
            return x
        elif isinstance(x, int):
            raise Exception('invalid type: expected bool, got int')
        elif isinstance(x, float):
            raise Exception('invalid type: expected bool, got float')
        else:
            raise Exception('invalid type: expected bool, got {}'.format(type(x)))

    if not isinstance(s, pd.Series):
        return convert_single(s)

    return s.apply(convert_single)


# check & convert if valid
def to_int(s: Series[AllTypes] | AllTypes) -> Series[Integer] | Integer:
    def convert_single(x):
        if pd.isnull(x):
            return np.nan
        elif isinstance(x, int):
            return x
        elif isinstance(x, float):
            return round(x, 0)
        elif isinstance(x, bool):
            raise Exception('invalid type: expected int, got bool')
        else:
            raise Exception('invalid type: expected int, got {}'.format(type(x)))

    if not isinstance(s, pd.Series):
        return convert_single(s)

    return s.apply(convert_single).astype('Int64')


# check & convert if valid
def to_non_neg_int(s: Series[AllTypes] | AllTypes) -> Series[NonNegInt] | NonNegInt:
    def convert_single(x):
        res = None
        if pd.isnull(x):
            res = np.nan
        elif isinstance(x, int):
            res = x
        elif isinstance(x, float):
            res = round(x, 0)
        elif isinstance(x, bool):
            raise Exception('invalid type: expected non-negative int, got bool')
        else:
            raise Exception('invalid type: expected non-negative int, got {}'.format(type(x)))
        if not pd.isnull(res) and res < 0:
            raise Exception('invalid value: expected non-negative int, got {}'.format(res))
        return res

    if not isinstance(s, pd.Series):
        return convert_single(s)

    return s.apply(convert_single)


# check & convert if valid
def to_pos_int(s: Series[AllTypes] | AllTypes) -> Series[PosInt] | PosInt:
    def convert_single(x):
        res = None
        if pd.isnull(x):
            res = np.nan
        elif isinstance(x, int):
            res = x
        elif isinstance(x, float):
            res = round(x, 0)
        elif isinstance(x, bool):
            raise Exception('invalid type: expected positive int, got bool')
        else:
            raise Exception('invalid type: expected positive int, got {}'.format(type(x)))
        if not pd.isnull(res) and res <= 0:
            raise Exception('invalid value: expected positive int, got {}'.format(res))
        return res

    if not isinstance(s, pd.Series):
        return convert_single(s)

    return s.apply(convert_single)


# check & convert if valid
def to_number(s: Series[AllTypes] | AllTypes) -> Series[Number] | Number:
    def convert_single(x):
        if pd.isnull(x):
            return np.nan
        elif isinstance(x, int):
            return x
        elif isinstance(x, float):
            return x
        elif isinstance(x, bool):
            raise Exception('invalid type: expected number, got bool')
        else:
            raise Exception('invalid type: expected number, got {}'.format(type(x)))

    if not isinstance(s, pd.Series):
        return convert_single(s)

    return s.apply(convert_single)
