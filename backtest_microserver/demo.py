from numpy import nan, rint
import pandas as pd
from MyTT1.MyTT import *

s = [1, 1, 3, 4]
s = pd.Series(s)
print(EMA(s, 1))
# print(s.shift(-1) - s)
# print(-s)
bool_s1 = [True, True, False, False]
bool_s2 = [True, False, False, True]
bool_s1 = pd.Series(bool_s1)
bool_s2 = pd.Series(bool_s2)



print(~(bool_s1 | bool_s2))

# bool_s1 = bool_s1.shift(1)
# print(type(bool_s1))
# bool_s1[0] = False
# bool_s1 = pd.Series(bool_s1)
# print(type(bool_s1[1]))
# print(type(np.array(bool_s1, dtype=bool)[1]))

# print(type(bool_s1.shift(1)[1]))
# print(type(bool_s1[1]))
# print(~REF(bool_s1))
# print(~bool_s1)
# print(~bool_s1.values)
# # print(type(bool_s1.shift(1)[1]) == type(bool_s1[1]))
# print(bool_s1 & bool_s1.shift(1))