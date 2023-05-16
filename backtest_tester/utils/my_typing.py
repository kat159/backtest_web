import types
from functools import wraps
from typing import Dict, TypeVar, Generic, get_args, NewType
import numpy as np
import pandas as pd
from functools import wraps
from typing import *
import re

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


def match_type(type_, s):
    # multi-types not allowed, e.g. Series[Number | Bool], Number | Bool not allowed, only like Number | Series[Number] allowed

    if get_origin(type_) is Union:
        return any(match_type(t, s) for t in get_args(type_))
    elif get_origin(type_) is Series:
        args = get_args(type_)

        def _match_base(base_type):
            if base_type is AllTypes:
                return True
            elif base_type is AllBaseTypes:
                return True
            elif base_type is Bool:
                return is_bool_series(s)
            elif base_type is Number:
                return is_number_series(s)
            elif base_type is Integer:
                return is_int_series(s)
            elif base_type is NonNegInt:
                return is_non_neg_int_series(s)
            elif base_type is PosInt:
                return is_pos_int_series(s)
            else:
                raise ValueError('unknown type')

        for t in args:
            if get_origin(t) is Union:
                for base_type in get_args(t):
                    if _match_base(base_type):
                        return True
                return False
            else:
                return _match_base(t)
    else:
        if type_ is AllTypes:
            return True
        elif type_ is AllBaseTypes:
            return True
        elif type_ is Bool:
            return is_bool(s)
        elif type_ is Integer:
            return is_int(s)
        elif type_ is Number:
            return is_number(s)
        elif type_ is PosInt:
            return is_pos_int(s)
        elif type_ is NonNegInt:
            return is_non_neg_int(s)
        else:
            raise ValueError(f'Internal error: Unknown type: {type_}')


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
        return tuple(filter(lambda t: is_base_type(t), get_args(type_)))
    elif get_origin(type_) is Series:  # s: Series[..]
        return ()
    else:
        return (type_,)

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


def is_int_str(s):
    if not isinstance(s, str):
        return False
    try:
        int(s)  # int('1.1') will throw exception
        return True
    except ValueError:
        return False


def is_float_str(s):
    if not isinstance(s, str):
        return False
    try:
        float(s)
        return True
    except ValueError:
        return False


def is_number(x):
    if isinstance(x, pd.Series):
        return False
    return isinstance(x, int) or isinstance(x, float) or pd.isnull(x) or (isinstance(x, str) and is_float_str(x))


def is_number_series(s):
    return isinstance(s, pd.Series) and s.apply(is_number).all()


def is_int(x):
    if isinstance(x, pd.Series):
        return False
    return isinstance(x, int) \
        or isinstance(x, np.int64) \
        or isinstance(x, np.int32) \
        or pd.isnull(x) \
        or (isinstance(x, str) and is_int_str(x)) \
        or (isinstance(x, float) and x.is_integer())


def is_int_series(s):
    return isinstance(s, pd.Series) and s.apply(is_int).all()


def is_non_neg_int(x):
    if isinstance(x, pd.Series):
        return False
    return pd.isnull(x) \
        or (isinstance(x, str) and is_int_str(x) and int(x) >= 0) \
        or (is_int(x) and x >= 0)


def is_non_neg_int_series(s):
    return isinstance(s, pd.Series) and s.apply(is_non_neg_int).all()


def is_pos_int(x):
    if isinstance(x, pd.Series):
        return False
    return pd.isnull(x) \
        or (isinstance(x, str) and is_int_str(x) and int(x) > 0) \
        or (is_int(x) and x > 0)
    # return (isinstance(x, int) and x > 0) or pd.isnull(x) or (isinstance(x, str) and is_int_str(x) and int(x) > 0) or (isinstance(x, float) and x.is_integer() and x > 0)


def is_pos_int_series(s):
    return isinstance(s, pd.Series) and s.apply(is_pos_int).all()


def is_bool(x):
    if isinstance(x, pd.Series):
        return False
    return isinstance(x, bool) or pd.isnull(x) or np.issubdtype(type(x), np.bool_)


def is_bool_series(s):
    return isinstance(s, pd.Series) and s.apply(is_bool).all()
