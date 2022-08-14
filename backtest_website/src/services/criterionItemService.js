import axios from 'axios';

const baseURL = 'http://127.0.0.1:3000/server/criteria_item';
// paramTypes: ['Number', 'Exact Number', 'Bool', 'Integer'] // 
// paramTypes 允许Number，那么就应该允许Integer, 因为Exact Number肯定要被带入函数变成Series， 所以Integer肯定会是Series
// paramTypes 允许 Exact， 就该允许Integer
// 允许Number，不一定允许Exact， 看是不是必须Series

// returnTypes: ['Number', 'Bool', 'Integer', 或者数字123表示根据index] 
// returnType不包括Exact Number, 只有input return Exact Number， 通过parseint或 ===''判断
class CriterionItemService {
    NUMBER_STR = 'Number'
    EXACT_NUMBER_STR = 'Exact Number'
    BOOL_STR = 'Bool'
    INTEGER_STR = 'Integer'
    _INTEGER_OR_NUMBER = 'Number/Integer'
    _NUMBER_OR_EXACT_NUMBER = 'Number/Exact Number'
    _INTEGER_OR_EXACT_NUMBER = 'Integer/Exact Number'
    _ALL_TYPE_OF_NUMBER = 'Number/Integer/Exact Number'
    _BOOL_OR_NUMBER = 'Bool/Number'
    _INTEGER_BOOL_OR_NUMBER = 'Number/Integer/Bool'

    getAll(userId) {
        const indicators = {
            // Trend
            'MA': {
                name: 'MA',
                type: 'Indicator',
                category: 'Trend',
                leadingText: 'MA',
                description: 'Moving Average',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR
            },
            'EMA': {
                name: 'EMA',
                type: 'Indicator',
                category: 'Trend',
                leadingText: 'EMA',
                description: 'Exponential Moving Average',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR
            },
            'SMA': {
                name: 'SMA',
                type: 'Indicator',
                category: 'Trend',
                leadingText: 'SMA',
                description: 'Simple Moving Average',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR
            },
            'MACD': {
                name: 'MACD',
                type: 'Indicator',
                category: 'Trend',
                leadingText: 'MACD',
                description: 'Typical Moving Average Convergence Divergence',
                usage: 'MACD(CLOSE, 12, 26, 9)',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR
            },
            'MACD_SIGNAL': {
                name: 'MACD_SIGNAL',
                type: 'Indicator',
                category: 'Trend',
                leadingText: 'MACD_SIGNAL',
                description: 'Return the signal line of Moving Average Convergence Divergence',
                usage: 'MACD(CLOSE, 12, 26, 9)',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR
            },
            'BBI': {
                name: 'BBI',
                type: 'Indicator',
                category: 'Trend',
                leadingText: 'BBI',
                description: 'Bull and Bear Index',
                usage: 'BBI(CLOSE, 3, 6, 12, 20)',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR
            },
            // Oscillator
            'RSI': {
                name: 'RSI',
                type: 'Indicator',
                category: 'Oscillator',
                leadingText: 'RSI',
                description: 'Relative Strength Index',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                usage: 'RSI(CLOSE, 24)',
            },
            'EMV': {
                name: 'EMV',
                type: 'Indicator',
                category: 'Oscillator',
                leadingText: 'EMV',
                description: 'Ease of Movement Value',
                paramTypes: [this._INTEGER_OR_NUMBER, this.NUMBER_STR, this.NUMBER_STR, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                usage: 'EMV(HIGH, LOW, VOL, 14, 9)',
            },
            'DPO': {
                name: 'DPO',
                type: 'Indicator',
                category: 'Oscillator',
                leadingText: 'DPO',
                description: 'Detrended Price Oscillator',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                usage: 'DPO(CLOSE, 20, 10, 6)',
            },
            // Volatility
            'BOLL': {
                name: 'BOLL',
                type: 'Indicator',
                category: 'Volatility',
                leadingText: 'BOLL',
                description: 'Bollinger Bands',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                usage: 'BOLL(CLOSE, 20, 2)'
            },
            'KDJ_K': {
                name: 'KDJ_K',
                type: 'Indicator',
                category: 'Volatility',
                leadingText: 'KDJ_K',
                description: 'the K line of KDJ',
                paramTypes: [this._INTEGER_OR_NUMBER, this.NUMBER_STR, this.NUMBER_STR, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                usage: 'KDJ_K(CLOSE, HIGH, LOW, 9, 3, 3)'
            },
            'KDJ_D': {
                name: 'KDJ_D',
                type: 'Indicator',
                category: 'Volatility',
                leadingText: 'KDJ_D',
                description: 'the D line of KDJ',
                paramTypes: [this._INTEGER_OR_NUMBER, this.NUMBER_STR, this.NUMBER_STR, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                usage: 'KDJ_D(CLOSE, HIGH, LOW, 9, 3, 3)'
            },
            'KDJ_J': {
                name: 'KDJ_J',
                type: 'Indicator',
                category: 'Volatility',
                leadingText: 'KDJ_J',
                description: 'the J line of KDJ',
                paramTypes: [this._INTEGER_OR_NUMBER, this.NUMBER_STR, this.NUMBER_STR, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                usage: 'KDJ_J(CLOSE, HIGH, LOW, 9, 3, 3)'
            },
            'ATR': {
                name: 'ATR',
                type: 'Indicator',
                category: 'Volatility',
                leadingText: 'ATR',
                description: 'Average True Range',
                paramTypes: [this._INTEGER_OR_NUMBER, this.NUMBER_STR, this.NUMBER_STR, this._INTEGER_OR_EXACT_NUMBER,],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                usage: 'ATR(CLOSE, HIGH, LOW, 20)'
            },
            'VR': {
                name: 'VR',
                type: 'Indicator',
                category: 'Volatility',
                leadingText: 'VR',
                description: 'The volatility ratio',
                paramTypes: [this._INTEGER_OR_NUMBER, this.NUMBER_STR, this._INTEGER_OR_EXACT_NUMBER,],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                usage: 'VR(CLOSE, VOL, 26)'
            },
            // Others
            'PSY': {
                name: 'PSY',
                type: 'Indicator',
                category: 'Others',
                leadingText: 'PSY',
                description: 'Psychological line, PSY(S, N): return the ratio of the number of periods where S was rising to the total periods, in N periods',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                usage: 'PSY(CLOSE, 12, 6)',
            },
            'BLJJ': {
                name: 'BLJJ',
                type: 'Indicator',
                category: 'Others',
                leadingText: 'BLJJ',
                description: '',
                paramTypes: [this._INTEGER_OR_NUMBER, this.NUMBER_STR, this.NUMBER_STR, ],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                usage: 'BLJJ(CLOSE, HIGH, LOW)',
            },
        }
        const marketData = {
            'Closing Price': {
                name: 'Closing Price',
                type: 'Market Data',
                category: 'Price',
                description: 'Closing Price',
                leadingText: 'CLOSE',
                paramTypes: [],
                returnType: this.NUMBER_STR
            },
            'Opening Price': {
                name: 'Opening Price',
                type: 'Market Data',
                category: 'Price',
                description: 'Opening Price',
                leadingText: 'OPEN',
                paramTypes: [],
                returnType: this.NUMBER_STR
            },
            'Highest Price': {
                name: 'Highest Price',
                type: 'Market Data',
                category: 'Price',
                description: 'Highest Price',
                leadingText: 'HIGH',
                paramTypes: [],
                returnType: this.NUMBER_STR
            },
            'Lowest Price': {
                name: 'Lowest Price',
                type: 'Market Data',
                category: 'Price',
                description: 'Lowest Price',
                leadingText: 'LOW',
                paramTypes: [],
                returnType: this.NUMBER_STR
            },
        }
        const functions = {
            // Math
            'Multiply': {
                name: 'Multiply',
                type: 'Function',
                category: 'Math',
                description: '',
                leadingText: '',
                paramTypes: [this._ALL_TYPE_OF_NUMBER, this._ALL_TYPE_OF_NUMBER],
                joinChar: ' * ',
                returnType: '+-*/'
            },
            'Divide': {
                name: 'Divide',
                type: 'Function',
                category: 'Math',
                description: '',
                leadingText: '',
                paramTypes: [this._ALL_TYPE_OF_NUMBER, this._ALL_TYPE_OF_NUMBER],
                joinChar: ' / ',
                returnType: '+-*/'
            },
            'Plus': {
                name: 'Plus',
                type: 'Function',
                category: 'Math',
                description: '',
                leadingText: '',
                paramTypes: [this._ALL_TYPE_OF_NUMBER, this._ALL_TYPE_OF_NUMBER],
                joinChar: ' + ',
                returnType: '+-*/'
            },
            'Minus': {
                name: 'Minus',
                type: 'Function',
                category: 'Math',
                description: '',
                leadingText: '',
                paramTypes: [this._ALL_TYPE_OF_NUMBER, this._ALL_TYPE_OF_NUMBER],
                joinChar: ' - ',
                returnType: '+-*/'
            },
            'Round': {
                name: 'Round',
                type: 'Function',
                category: 'Math',
                description: 'ROUND(S) return the nearest integer of S',
                leadingText: 'ROUND',
                paramTypes: [this._INTEGER_OR_NUMBER],
                joinChar: ', ',
                returnType: this.INTEGER_STR,
                translate: ['the nearest integer of', 0]
            },
            'Count': {
                name: 'Count',
                type: 'Function',
                category: 'Math',
                description: 'COUNT(B, N) count the number of periods when B is true in N periods',
                leadingText: 'COUNT',
                paramTypes: [this.BOOL_STR, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.INTEGER_STR,
                translate: ['the number of periods when', 0, 'is true in', 1, 'periods']
            },
            'Sum In N Periods': {
                name: 'Sum In N Periods',
                type: 'Function',
                category: 'Math',
                description: 'SUM(S, N): return accumulated sum of S in N periods',
                leadingText: 'SUM',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: 0,
                translate: ['the accumulated sum of', 0, 'in', 1, 'periods'],
            },
            'Highest Value in N Periods': {
                name: 'Highest Value in N Periods',
                type: 'Function',
                category: 'Math',
                description: 'HHV(S, N): return highest value of S in N periods',
                leadingText: 'HHV',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: 0,
                translate: ['the highest value of', 0, 'in', 1, 'periods'],
            },
            'Lowest Value in N Periods': {
                name: 'Lowest Value in N Periods',
                type: 'Function',
                category: 'Math',
                description: 'LLV(S, N): return Lowest value of S in N periods',
                leadingText: 'LLV',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: 0,
                translate: ['the Lowest value of', 0, 'in', 1, 'periods'],
            },
            'Standard Deviation': {
                name: 'Standard Deviation',
                type: 'Function',
                category: 'Math',
                description: 'STD(S, N): Return the standard deviation in N periods',
                leadingText: 'STD',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                translate: ['the standard deviation of', 0, 'in', 1, 'periods'],
            },
            'Average Standard Deviation': {
                name: 'Average Standard Deviation',
                type: 'Function',
                category: 'Math',
                description: 'AVEDEV(S, N): Returns the average of the absolute deviations of S from their mean in N periods',
                leadingText: 'AVEDEV',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                translate: ['the average of the absolute deviations of', 0, 'from their mean in', 1, 'periods'],
            },
            'Linear Regression Slope': {
                name: 'Linear Regression Slope',
                type: 'Function',
                category: 'Math',
                description: 'SLOPE(S, N): Return the slope of linear regression of S in N periods',
                usage: 'SLOPE(Number, Number / Exact Number)',
                leadingText: 'SLOPE',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
                translate: ['the slope of linear regression of', 0, 'in', 1, 'periods'],
            },
            // Pattern 
            'Cross Above': {
                name: 'Cross Above',
                type: 'Function',
                category: 'Pattern',
                description: 'CROSSABOVE(S1, S2), return True if S1 cross above S2',
                leadingText: 'CROSSABOVE',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_NUMBER],
                joinChar: ', ',
                returnType: 'Bool',
            },
            'Cross Blow': {
                name: 'Cross Blow',
                type: 'Function',
                category: 'Pattern',
                description: 'CROSSABOVE(S1, S2), return True if S1 cross blow S2',
                leadingText: 'CROSSBELOW',
                paramTypes: [this._INTEGER_OR_NUMBER, this._INTEGER_OR_NUMBER],
                joinChar: ', ',
                returnType: 'Bool',
            },
            'Lower Than': {
                name: 'Lower Than',
                type: 'Function',
                category: 'Pattern',
                description: '',
                leadingText: '',
                paramTypes: [this._ALL_TYPE_OF_NUMBER, this._ALL_TYPE_OF_NUMBER],
                joinChar: ' < ',
                returnType: 'Bool'
            },
            'Higher Than': {
                name: 'Higher Than',
                type: 'Function',
                category: 'Pattern',
                description: '',
                leadingText: '',
                paramTypes: [this._ALL_TYPE_OF_NUMBER, this._ALL_TYPE_OF_NUMBER],
                joinChar: ' > ',
                returnType: 'Bool'
            },
            'Equal To': {
                name: 'Equal To',
                type: 'Function',
                category: 'Pattern',
                description: '',
                leadingText: '',
                paramTypes: [this._ALL_TYPE_OF_NUMBER, this._ALL_TYPE_OF_NUMBER],
                joinChar: ' = ',
                returnType: 'Bool'
            },
            // Logic
            'and': {
                name: 'and',
                type: 'Function',
                category: 'Logic',
                description: '',
                leadingText: '',
                paramTypes: ['Bool', 'Bool'],
                joinChar: ' and ',
                returnType: 'Bool',
            },
            'or': {
                name: 'or',
                type: 'Function',
                category: 'Logic',
                description: '',
                leadingText: '',
                paramTypes: ['Bool', 'Bool'],
                joinChar: ' or ',
                returnType: 'Bool',
            },
            'if': {
                name: 'if',
                type: 'Function',
                category: 'Logic',
                description: 'IF( A, B, C ): return B if A is True else C',
                leadingText: 'IF',
                paramTypes: [this.BOOL_STR, this._ALL_TYPE_OF_NUMBER, this._ALL_TYPE_OF_NUMBER],
                joinChar: ', ',
                returnType: this.NUMBER_STR,
            },
            // Reference
            'REF': {
                name: 'REF',
                type: 'Function',
                category: 'Reference',
                description: 'REF(S, N) : return value of S at N periods ago',
                leadingText: 'REF',
                paramTypes: [this._INTEGER_BOOL_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: 0,
            },
            'VALAT': {
                name: 'VALAT',
                type: 'Function',
                category: 'Reference',
                description: 'VALAT(S, N) : return the value of S at Nth period',
                leadingText: 'VALAT',
                paramTypes: [this._INTEGER_BOOL_OR_NUMBER, this._INTEGER_OR_EXACT_NUMBER],
                joinChar: ', ',
                returnType: 0,
            },
            'WHERE': {
                name: 'WHERE',
                type: 'Function',
                category: 'Reference',
                description: 'WHERE(S, B) : return S if B is True',
                leadingText: 'WHERE',
                paramTypes: [this._INTEGER_BOOL_OR_NUMBER, this.BOOL_STR],
                joinChar: ', ',
                returnType: 0,
            },
            'WHENLAST': {
                name: 'WHENLAST',
                type: 'Function',
                category: 'Reference',
                description: 'WHENLAST(B) : return the closest index of the last time when B is True',
                leadingText: 'WHENLAST',
                paramTypes: [this.BOOL_STR],
                joinChar: ', ',
                returnType: this.INTEGER_STR,
            },
            'PERIODSLAST': {
                name: 'PERIODSLAST',
                type: 'Function',
                category: 'Reference',
                description: 'PERIODSLAST(B) : return the number of periods from now to the closest time when B is True',
                leadingText: 'PERIODSLAST',
                paramTypes: [this.BOOL_STR],
                joinChar: ', ',
                returnType: this.INTEGER_STR,
            },
        }
        const itemDict = {
            ...indicators, ...marketData, ...functions,
        };
        const types = {
            'dummy': ['Market Data', 'Function', 'Indicator',]
        }
        const categories = {
            'Indicator': ['Trend', 'Oscillator', 'Volatility', 'Others'],
            'Market Data': ['Price', 'Volume'],
            'Function': ['Pattern', 'Math', 'Logic', 'Reference',],
        }
        const items = {}
        for (const k in categories) {
            for (const category of categories[k]) {
                items[category] = []
            }
        }
        for (const key of Object.keys(itemDict)) {
            const item = itemDict[key]
            if (key !== item.name) {
                console.log('error1: name not matched. ', key, item.name);
            }
            items[item.category].push(item.name)
        }
        return { itemClassificationList: [types, categories, items], itemDict: itemDict }
    }
}

export default new CriterionItemService();