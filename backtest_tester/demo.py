import collections
import types

import pandas as pd
from utils.my_pd import *

if __name__ == '__main__':
    s1 = pd.Series([True, False, False, True, True, False, False, True, False, False, False])
    s2 = pd.Series([1 for i in range(11)])
    n = 3

    true_idx = s1[s1]
    print(true_idx)

    res = shift(s1, n)
    shift(n=n, s=s1)
