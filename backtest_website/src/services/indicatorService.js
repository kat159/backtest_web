import axios from 'axios';
import { SERVER_IP } from '../config/config';

const baseURL = SERVER_IP + '/server/indicators';

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