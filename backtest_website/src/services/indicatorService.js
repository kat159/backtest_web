import axios from 'axios';

const baseURL = 'http://127.0.0.1:5000';

class indicatorService {
    async calculateByFormula(symbol, formula) {
        // timePeriod = [startDate: timestamp, endDate: timestamp]
        return axios({
            method: 'post',
            url: baseURL + '/formula_calculator',
            data: {
                symbol: symbol,
                formula: formula,
            },
            headers: {          
                'Content-Type': 'application/json',
            }, 
        })
    }
}

export default new indicatorService();