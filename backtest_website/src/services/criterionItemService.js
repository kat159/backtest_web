const axios = require('axios')

const baseURL = 'http://127.0.0.1:3000/criteria_item';
// Types: ['Number', 'Exact Number', 'Bool', 'Any']
class CriterionItemService {
    getAll(userId) {
        const indicators = {
            'MA': {
                name: 'MA',
                type: 'Indicator',
                category: 'Trend',
                leadingText: 'MA',
                description: 'Moving Average',
                paramTypes: ['Number', 'Exact Number'],
                joinChar: ', ',
                returnType: 'Number'
            },
            'MACD': {
                name: 'MACD',
                type: 'Indicator',
                category: 'Trend',
                leadingText: 'MACD',
                description: 'Moving Average Convergence Divergence',
                usage: ['MACD(series, SHORT, LONG, M)',
                    'a: Type must be Series. Normally Closing price in common usage',
                    'b: Type could be Exact Number or Series. Normally'
                ],
                paramTypes: ['Number', 'Exact Number', 'Exact Number', 'Exact Number'],
                joinChar: ', ',
                returnType: 'Number'
            },
            'RSI': {
                name: 'RSI',
                type: 'Indicator',
                category: 'Oscillator',
                leadingText: 'RSI',
                description: 'Relative Strength Index',
                paramTypes: [],
                joinChar: ', ',
                returnType: 'Number'
            },
            'BOLL': {
                name: 'BOLL',
                type: 'Indicator',
                category: 'Volatility',
                leadingText: 'BOLL',
                description: 'Bollinger Bands',
                paramTypes: [],
                joinChar: ', ',
                returnType: 'Number'
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
                returnType: 'Number'
            },
            'Opening Price': {
                name: 'Opening Price',
                type: 'Market Data',
                category: 'Price',
                description: 'Opening Price',
                leadingText: 'OPEN',
                paramTypes: [],
                returnType: 'Number'
            },
            'Highest Price': {
                name: 'Highest Price',
                type: 'Market Data',
                category: 'Price',
                description: 'Highest Price',
                leadingText: 'HIGH',
                paramTypes: [],
                returnType: 'Number'
            },
            'Lowest Price': {
                name: 'Lowest Price',
                type: 'Market Data',
                category: 'Price',
                description: 'Lowest Price',
                leadingText: 'LOW',
                paramTypes: [],
                returnType: 'Number'
            },
        }
        const functions = {
            'Multiply': {
                name: 'Multiply',
                type: 'Function',
                category: 'Math',
                description: '',
                leadingText: '',
                paramTypes: ['Number', 'Number'],
                joinChar: ' * ',
                returnType: 'Number'
            },
            'Divide': {
                name: 'Divide',
                type: 'Function',
                category: 'Math',
                description: '',
                leadingText: '',
                paramTypes: ['Number', 'Number'],
                joinChar: ' / ',
                returnType: 'Number'
            },
            'Plus': {
                name: 'Plus',
                type: 'Function',
                category: 'Math',
                description: '',
                leadingText: '',
                paramTypes: ['Number', 'Number'],
                joinChar: ' + ',
                returnType: 'Number'
            },
            'Minus': {
                name: 'Minus',
                type: 'Function',
                category: 'Math',
                description: '',
                leadingText: '',
                paramTypes: ['Number', 'Number'],
                joinChar: ' - ',
                returnType: 'Number'
            },
            'Cross Above': {
                name: 'Cross Above',
                type: 'Function',
                category: 'Pattern',
                description: '',
                leadingText: 'CROSSABOVE',
                paramTypes: ['Number', 'Number'],
                joinChar: ', ',
                returnType: 'Bool'
            },
            'Cross Blow': {
                name: 'Cross Blow',
                type: 'Function',
                category: 'Pattern',
                description: '',
                leadingText: 'CROSSBELOW',
                paramTypes: ['Number', 'Number'],
                joinChar: ', ',
                returnType: 'Bool'
            },
            'Lower Than': {
                name: 'Lower Than',
                type: 'Function',
                category: 'Pattern',
                description: '',
                leadingText: '',
                paramTypes: ['Number', 'Number'],
                joinChar: ' < ',
                returnType: 'Bool'
            },
            'Higher Than': {
                name: 'Higher Than',
                type: 'Function',
                category: 'Pattern',
                description: '',
                leadingText: '',
                paramTypes: ['Number', 'Number'],
                joinChar: ' > ',
                returnType: 'Bool'
            },
            'Equal To': {
                name: 'Equal To',
                type: 'Function',
                category: 'Pattern',
                description: '',
                leadingText: '',
                paramTypes: ['Number', 'Number'],
                joinChar: ' = ',
                returnType: 'Bool'
            },
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
            'REF': {
                name: 'REF',
                type: 'Function',
                category: 'Reference',
                description: 'REF( A, B ) : return value of A at B days ago',
                leadingText: 'REF',
                paramTypes: ['Number', 'Number'],
                joinChar: ', ',
                returnType: 0,
            },
        }
        const itemDict = {
            ...indicators, ...marketData, ...functions,
        };
        const types = {
            'dummy': ['Market Data', 'Function', 'Indicator',]
        }
        const categories = {
            'Indicator': ['Trend', 'Oscillator', 'Volatility', 'Support/Resistance'],
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

module.exports = new CriterionItemService();