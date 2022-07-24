# Original Author:     https://github.com/mpquant/MyTT

import numpy as np
import pandas as pd


def fillna(S, V):
    S[pd.isna(S)] = V
    return pd.Series(S).values

# ------------------ 0级：核心工具函数 --------------------------------------------


def RD(N, D=3): return np.round(N, D)  # 四舍五入取3位小数
def RET(S, N=1): return np.array(S)[-N]  # 返回序列倒数第N个值,默认返回最后一个
def ABS(S): return np.abs(S)  # 返回N的绝对值
def MAX(S1, S2): return np.maximum(S1, S2)  # 序列max
def MIN(S1, S2): return np.minimum(S1, S2)  # 序列min

def ROUND(S): return np.round(S, 0)

def MA(S, N):  # 求序列的N日平均值，返回序列
    return pd.Series(S).rolling(N).mean().values

def REF(S, N=1):  # 对序列整体下移动N,返回序列(shift后会产生NAN)
    # print(type(S[0]) is np.bool_, type(S[0]))
    # **注意： shift操作会把numpy.bool_ 变成bool， bool的取反操作会变成数字
    if (type(N) == int):
        res = pd.Series(S).shift(N).values
        if len(S) > 0 and (type(S[0]) is np.bool_ or type(S[0]) is bool):
            # 不同的操作可能产生不同类型的布尔值，有些操作会影响，比如python bool ~False不是True, numpy bool ~False是true
            # bool_s1 = [True, True, False, False]
            # bool_s2 = [True, False, False, True]
            # bool_s1 = pd.Series(bool_s1)
            # bool_s2 = pd.Series(bool_s2)
            # print(type(bool_s1.shift(1)[1]))  # bool
            # print(type(bool_s1[1]))           # numpy.bool_
            # print(bool_s1 & bool_s1.shift(1)) # 不影响这部分操作: [False, True, False, False], 但是有些会影响，看下面bool取反边数字
            res = fillna(res, False)
            # 把bool变成numpy.bool_, 不然做取反操作会出错，bool取反会变成数字
            res = np.array(res, dtype=bool)
        return res
    else:           #根据序列分别map
        N = pd.Series(N)
        indices = N.index - N               # 找到对应的index list
        return indices.map(S).values       # indices.map(values)

def VALAT(S, N):                            # return the value of S at Nth period
    if type(N) == int:
        N = pd.Series([N for i in range(len(S))])
    return pd.Series(N).map(pd.Series(S)).values

def DIFF(S, N=1):  # 前一个值减后一个值,前面会产生nan
    return pd.Series(S).diff(N)  # np.diff(S)直接删除nan，会少一行


def STD(S, N):  # 求序列的N日标准差，返回序列
    return pd.Series(S).rolling(N).std(ddof=0).values


def IF(S_BOOL, S_TRUE, S_FALSE):  # 序列布尔判断 return=S_TRUE if S_BOOL==True  else  S_FALSE
    return np.where(S_BOOL, S_TRUE, S_FALSE)


def SUM(S, N, min_periods=None):  # 对序列求N天累计和，返回序列    N=0对序列所有依次求和
    # 没有min_periods, SUM(S, 4) 前3个数会是NaN
    # min_periods=1， 不会产生NaN
    if min_periods == None:
        min_periods = N
    return pd.Series(S).rolling(N, min_periods=min_periods).sum().values if N > 0 else pd.Series(S).cumsum()


def HHV(S, N):             # HHV(C, 5)  # 最近5天收盘最高价
    return pd.Series(S).rolling(N).max().values


def LLV(S, N):             # LLV(C, 5)  # 最近5天收盘最低价
    return pd.Series(S).rolling(N).min().values


def EMA(S, N):  # 指数移动平均,为了精度 S>4*N  EMA至少需要120周期     alpha=2/(span+1)
    return pd.Series(S).ewm(span=N, adjust=False).mean().values


def SMA(S, N, M=1):  # 中国式的SMA,至少需要120周期才精确 (雪球180周期)    alpha=1/(1+com)
    return pd.Series(S).ewm(com=N-M, adjust=True).mean().values


def AVEDEV(S, N):  # 平均绝对偏差  (序列与其平均值的绝对差的平均值)
    return pd.Series(S).rolling(N).apply(lambda x: (np.abs(x - x.mean())).mean()).values


def SLOPE(S, N, RS=False):  # 返S序列N周期回线性回归斜率 (默认只返回斜率,不返回整个直线序列)
    M = pd.Series(S[-N:])
    poly = np.polyfit(M.index, M.values, deg=1)
    Y = np.polyval(poly, M.index)
    if RS:
        return Y[1]-Y[0], Y
    return Y[1]-Y[0]


# ------------------   1级：应用层函数(通过0级核心函数实现） ----------------------------------
def COUNT(S_BOOL, N):                  # COUNT(CLOSE>O, N):  最近N天满足S_BOO的天数  True的天数
    return SUM(S_BOOL, N)


def EVERY(S_BOOL, N):                  # EVERY(CLOSE>O, 5)   最近N天是否都是True
    R = SUM(S_BOOL, N)
    return IF(R == N, True, False)


def LAST(S_BOOL, A, B):  # 从前A日到前B日一直满足S_BOOL条件
    if A < B:
        A = B  # 要求A>B    例：LAST(CLOSE>OPEN,5,3)  5天前到3天前是否都收阳线
    return S_BOOL[-A:-B].sum() == (A-B)  # 返回单个布尔值


def EXIST(S_BOOL, N=5):                # EXIST(CLOSE>3010, N=5)  n日内是否存在一天大于3000点
    R = SUM(S_BOOL, N)
    return IF(R > 0, True, False)

# ****需要pd.array 而不是pd.Series

def WHERE(S, B):                       # return S if B else NaN
    S = pd.Series(S)
    B = pd.Series(B)
    return S.where(B).values

def WHENLAST(B):                        # return the closest index of the last time when B is True
    return pd.Series(B.index).where(B).ffill().values

def PERIODSLAST(S_BOOL):  # 上一次条件成立到当前的周期
    # where false的地方会产生nan， 再利用**ffill**向前填充nan， 最后当前index减去前面结果，就是最近的
    S_BOOL = pd.Series(S_BOOL)
    return (S_BOOL.index - pd.Series(S_BOOL.index).where(S_BOOL).ffill()).values

# def PERIODSLAST(S_BOOL):  # 上一次条件成立到当前的周期
#     # PERIODSLAST(CLOSE/REF(CLOSE)>=1.1) 上一次涨停到今天的天数
#     M = np.argwhere(S_BOOL)
#     return len(S_BOOL)-int(M[-1])-1 if M.size > 0 else -1


def FORCAST(S, N):  # 返S序列N周期回线性回归后的预测值
    K, Y = SLOPE(S, N, RS=True)
    return Y[-1]+K


def CROSS(S1, S2):  # 判断向上金叉穿越 CROSS(MA(C,5),MA(C,10))     判断向下死叉穿越 CROSS(MA(C,10),MA(C,5))
    CROSS_BOOL = IF(S1 > S2, True, False)
    # 上穿：昨天0 今天1   下穿：昨天1 今天0
    return (COUNT(CROSS_BOOL > 0, 2) == 1)*CROSS_BOOL


def CROSSABOVE(S1, S2):
    return CROSS(S1, S2)


def CROSSBELOW(S1, S2):
    return CROSS(S2, S1)

# ------------------   2级：技术指标函数(全部通过0级，1级函数实现） ------------------------------


def MACD(CLOSE, SHORT=12, LONG=26, M=9):             # EMA的关系，S取120日，和雪球小数点2位相同
    DIF = EMA(CLOSE, SHORT)-EMA(CLOSE, LONG)
    return RD(DIF)


def MACD_SIGNAL(CLOSE, SHORT=12, LONG=26, M=9):             # EMA的关系，S取120日，和雪球小数点2位相同
    DIF = EMA(CLOSE, SHORT)-EMA(CLOSE, LONG)
    DEA = EMA(DIF, M)
    return RD(DEA)


def KDJ_K(CLOSE, HIGH, LOW, N=9, M1=3, M2=3):           # KDJ指标
    RSV = (CLOSE - LLV(LOW, N)) / (HHV(HIGH, N) - LLV(LOW, N)) * 100
    K = EMA(RSV, (M1*2-1))
    return K


def KDJ_D(CLOSE, HIGH, LOW, N=9, M1=3, M2=3):           # KDJ指标
    RSV = (CLOSE - LLV(LOW, N)) / (HHV(HIGH, N) - LLV(LOW, N)) * 100
    K = EMA(RSV, (M1*2-1))
    D = EMA(K, (M2*2-1))
    return D


def KDJ_J(CLOSE, HIGH, LOW, N=9, M1=3, M2=3):           # KDJ指标
    RSV = (CLOSE - LLV(LOW, N)) / (HHV(HIGH, N) - LLV(LOW, N)) * 100
    K = EMA(RSV, (M1*2-1))
    D = EMA(K, (M2*2-1))
    J = K*3-D*2
    return J

# def MACD(CLOSE,SHORT=12,LONG=26,M=9):             # EMA的关系，S取120日，和雪球小数点2位相同
#     DIF = EMA(CLOSE,SHORT)-EMA(CLOSE,LONG);
#     DEA = EMA(DIF,M);      MACD=(DIF-DEA)*2
#     return RD(DIF),RD(DEA),RD(MACD)

# def KDJ(CLOSE,HIGH,LOW, N=9,M1=3,M2=3):           # KDJ指标
#     RSV = (CLOSE - LLV(LOW, N)) / (HHV(HIGH, N) - LLV(LOW, N)) * 100
#     K = EMA(RSV, (M1*2-1));    D = EMA(K,(M2*2-1));        J=K*3-D*2
#     return K, D, J


def RSI(CLOSE, N=24):                           # RSI指标,和通达信小数点2位相同
    DIF = CLOSE-REF(CLOSE, 1)
    return RD(SMA(MAX(DIF, 0), N) / SMA(ABS(DIF), N) * 100)


def WR(CLOSE, HIGH, LOW, N=10, N1=6):  # W&R 威廉指标
    WR = (HHV(HIGH, N) - CLOSE) / (HHV(HIGH, N) - LLV(LOW, N)) * 100
    WR1 = (HHV(HIGH, N1) - CLOSE) / (HHV(HIGH, N1) - LLV(LOW, N1)) * 100
    return RD(WR), RD(WR1)


def BIAS(CLOSE, L1=6, L2=12, L3=24):              # BIAS乖离率
    BIAS1 = (CLOSE - MA(CLOSE, L1)) / MA(CLOSE, L1) * 100
    BIAS2 = (CLOSE - MA(CLOSE, L2)) / MA(CLOSE, L2) * 100
    BIAS3 = (CLOSE - MA(CLOSE, L3)) / MA(CLOSE, L3) * 100
    return RD(BIAS1), RD(BIAS2), RD(BIAS3)


def BOLL(CLOSE, N=20, P=2):  # BOLL指标，布林带
    MID = MA(CLOSE, N)
    UPPER = MID + STD(CLOSE, N) * P
    LOWER = MID - STD(CLOSE, N) * P
    return RD(UPPER), RD(MID), RD(LOWER)


def PSY(CLOSE, N=12, M=6):
    PSY = COUNT(CLOSE > REF(CLOSE, 1), N)/N*100
    PSYMA = MA(PSY, M)
    return RD(PSY), RD(PSYMA)


def CCI(CLOSE, HIGH, LOW, N=14):
    TP = (HIGH+LOW+CLOSE)/3
    return (TP-MA(TP, N))/(0.015*AVEDEV(TP, N))


def ATR(CLOSE, HIGH, LOW, N=20):  # 真实波动N日平均值
    TR = MAX(MAX((HIGH - LOW), ABS(REF(CLOSE, 1) - HIGH)),
             ABS(REF(CLOSE, 1) - LOW))
    return MA(TR, N)


def BBI(CLOSE, M1=3, M2=6, M3=12, M4=20):  # BBI多空指标
    return (MA(CLOSE, M1)+MA(CLOSE, M2)+MA(CLOSE, M3)+MA(CLOSE, M4))/4


def DMI(CLOSE, HIGH, LOW, M1=14, M2=6):  # 动向指标：结果和同花顺，通达信完全一致
    TR = SUM(MAX(MAX(HIGH - LOW, ABS(HIGH - REF(CLOSE, 1))),
             ABS(LOW - REF(CLOSE, 1))), M1)
    HD = HIGH - REF(HIGH, 1)
    LD = REF(LOW, 1) - LOW
    DMP = SUM(IF((HD > 0) & (HD > LD), HD, 0), M1)
    DMM = SUM(IF((LD > 0) & (LD > HD), LD, 0), M1)
    PDI = DMP * 100 / TR
    MDI = DMM * 100 / TR
    ADX = MA(ABS(MDI - PDI) / (PDI + MDI) * 100, M2)
    ADXR = (ADX + REF(ADX, M2)) / 2
    return PDI, MDI, ADX, ADXR


def TAQ(HIGH, LOW, N):  # 唐安奇通道(海龟)交易指标，大道至简，能穿越牛熊
    UP = HHV(HIGH, N)
    DOWN = LLV(LOW, N)
    MID = (UP+DOWN)/2
    return UP, MID, DOWN


def KTN(CLOSE, HIGH, LOW, N=20, M=10):  # 肯特纳交易通道, N选20日，ATR选10日
    MID = EMA((HIGH+LOW+CLOSE)/3, N)
    ATRN = ATR(CLOSE, HIGH, LOW, M)
    UPPER = MID+2*ATRN
    LOWER = MID-2*ATRN
    return UPPER, MID, LOWER


def TRIX(CLOSE, M1=12, M2=20):  # 三重指数平滑平均线
    TR = EMA(EMA(EMA(CLOSE, M1), M1), M1)
    TRIX = (TR - REF(TR, 1)) / REF(TR, 1) * 100
    TRMA = MA(TRIX, M2)
    return TRIX, TRMA


def VR(CLOSE, VOL, M1=26):  # VR容量比率
    LC = REF(CLOSE, 1)
    return SUM(IF(CLOSE > LC, VOL, 0), M1) / SUM(IF(CLOSE <= LC, VOL, 0), M1) * 100


def EMV(HIGH, LOW, VOL, N=14, M=9):  # 简易波动指标
    VOLUME = MA(VOL, N)/VOL
    MID = 100*(HIGH+LOW-REF(HIGH+LOW, 1))/(HIGH+LOW)
    EMV = MA(MID*VOLUME*(HIGH-LOW)/MA(HIGH-LOW, N), N)
    MAEMV = MA(EMV, M)
    return EMV
    # return EMV,MAEMV


def DPO(CLOSE, M1=20, M2=10, M3=6):  # 区间震荡线
    DPO = CLOSE - REF(MA(CLOSE, M1), M2)
    MADPO = MA(DPO, M3)
    return DPO,
    return DPO, MADPO


def BRAR(OPEN, CLOSE, HIGH, LOW, M1=26):  # BRAR-ARBR 情绪指标
    AR = SUM(HIGH - OPEN, M1) / SUM(OPEN - LOW, M1) * 100
    BR = SUM(MAX(0, HIGH - REF(CLOSE, 1)), M1) / \
        SUM(MAX(0, REF(CLOSE, 1) - LOW), M1) * 100
    return AR, BR


def DMA(CLOSE, N1=10, N2=50, M=10):  # 平行线差指标
    DIF = MA(CLOSE, N1)-MA(CLOSE, N2)
    DIFMA = MA(DIF, M)
    return DIF, DIFMA


def MTM(CLOSE, N=12, M=6):  # 动量指标
    MTM = CLOSE-REF(CLOSE, N)
    MTMMA = MA(MTM, M)
    return MTM, MTMMA


def MASS(HIGH, LOW, N1=9, N2=25, M=6):                   # 梅斯线
    MASS = SUM(MA(HIGH-LOW, N1)/MA(MA(HIGH-LOW, N1), N1), N2)
    MA_MASS = MA(MASS, M)
    return MASS, MA_MASS


def ROC(CLOSE, N=12, M=6):  # 变动率指标
    ROC = 100*(CLOSE-REF(CLOSE, N))/REF(CLOSE, N)
    MAROC = MA(ROC, M)
    return ROC, MAROC


def EXPMA(CLOSE, N1=12, N2=50):  # EMA指数平均数指标
    return EMA(CLOSE, N1), EMA(CLOSE, N2)


def OBV(CLOSE, VOL):  # 能量潮指标
    return SUM(IF(CLOSE > REF(CLOSE, 1), VOL, IF(CLOSE < REF(CLOSE, 1), -VOL, 0)), 0)/10000


def MFI(CLOSE, HIGH, LOW, VOL, N=14):  # MFI指标是成交量的RSI指标
    TYP = (HIGH + LOW + CLOSE)/3
    V1 = SUM(IF(TYP > REF(TYP, 1), TYP*VOL, 0), N) / \
        SUM(IF(TYP < REF(TYP, 1), TYP*VOL, 0), N)
    return 100-(100/(1+V1))


def ASI(OPEN, CLOSE, HIGH, LOW, M1=26, M2=10):  # 振动升降指标
    LC = REF(CLOSE, 1)
    AA = ABS(HIGH-LC)
    BB = ABS(LOW-LC)
    CC = ABS(HIGH-REF(LOW, 1))
    DD = ABS(LC-REF(OPEN, 1))
    R = IF((AA > BB) & (AA > CC), AA+BB/2+DD/4,
           IF((BB > CC) & (BB > AA), BB+AA/2+DD/4, CC+DD/4))
    X = (CLOSE-LC+(CLOSE-OPEN)/2+LC-REF(OPEN, 1))
    SI = 16*X/R*MAX(AA, BB)
    ASI = SUM(SI, M1)
    ASIT = MA(ASI, M2)
    return ASI, ASIT


def BLJJ(CLOSE, HIGH, LOW):
    def helper(close, high, low, close_weight, high_weight, low_weight,
               first_EMA_params,
               accuracy,
               do_second_slope,
               second_EMA_params):
        # var1
        BLJJ_list = (close * close_weight + high * high_weight + low *
                    low_weight) / (close_weight + high_weight + low_weight)
        # var2
        for param in first_EMA_params:
            BLJJ_list = EMA(BLJJ_list, param)
        # J
        BLJJ_list = DIFF(BLJJ_list) / REF(BLJJ_list, 1) * accuracy
        # second slope
        if do_second_slope:
            BLJJ_list = DIFF(BLJJ_list)
            for param in second_EMA_params:
                BLJJ_list = EMA(BLJJ_list, param)
        BLJJ_list[np.isnan(BLJJ_list)] = 0       
        return BLJJ_list
    closeW, highW, lowW = 2, 1, 1
    firstEMA = [2, 2, 2, 2, 2, 2, 2]
    accuracy = 1000
    do_second_slope = True
    secondEMA = [2, 2, 1]
    return helper(CLOSE, HIGH, LOW, closeW, highW, lowW, firstEMA, accuracy, do_second_slope, secondEMA)


