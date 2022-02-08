from typing import List


import numpy as np
import pandas as pd

def metrics(capital_flow):
    return {
        'currentCapital': round(capital_flow[len(capital_flow) - 1], 2),
        'returnRate': round((capital_flow[len(capital_flow) - 1] / capital_flow[0] - 1) * 100, 2),
        'sharpe': round(sharpe(capital_flow), 2),
        'maxDrawdown': round(max_drawdown(capital_flow) * 100, 2),
        'standardDeviation': round(std(capital_flow / capital_flow[0]) * 100, 2)
    }

def sharpe(capital_flow, risk_free_return=0.02):
    returns = capital_flow - capital_flow.shift(1)
    avg = np.mean(returns)
    std = np.std(returns)
     
    annual_return = avg * 252
    annual_vol = std * np.sqrt(252) 
    
    sharpe = (annual_return - risk_free_return) / (annual_vol if annual_vol else 1)
    
    return sharpe

def max_drawdown(capital_flow):
    j = np.argmax(np.maximum.accumulate(capital_flow) - capital_flow)
    if j == 0: return 0
    i = np.argmax(capital_flow[:j])
    d = (capital_flow[i] - capital_flow[j]) / capital_flow[i]
    return d
    
def std(capital_flow):
    return np.std(capital_flow - capital_flow.shift(1))

