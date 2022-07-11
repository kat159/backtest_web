from collections import Counter
from typing import *

def merge(d1, d2):
    d1.update(d2)
    return d1
    # approach 2
    # return {**t1, **t2}

def add_merge(d1, d2):
    D1, D2 = Counter(d1), Counter(d2)
    return dict(D1 + D2)

def key_counter(counter, dic):
    return add_merge(counter, Counter(dic.keys()))

def key_range_filter(d:Dict, lower, upper):
    return dict((k, v) for (k, v) in d.items() if lower <= k <= upper)

def div(dividend_d, divisor_d):
    return {k: dividend_d[k] / divisor_d[k] for k in dividend_d}

if __name__ == '__main__':
    s1 = [1, 2, 3]
    s2 = ['a', 'b', 'c']
    t1 = dict(zip(s2, s1))
    t2 = {'a':99, 'd':99}
    print(add_merge(t1, t2))
    counter = {}
    counter = key_counter(counter, t1)
    counter = key_counter(counter, t2)
    print(counter)
    
    d = {'a':1, 'b':2}
    a, b = d
    print(a, b)
    
    keys = ['a', 'b', 'c']
    dividends = [9, 6, 3]
    divisors = [4, 3, 2]
    d1 = dict(zip(keys, dividends))
    d2 = dict(zip(keys, divisors))
    res = div(d1, d2)
    print(res)