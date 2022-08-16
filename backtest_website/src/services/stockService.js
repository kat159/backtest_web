import axios from "axios";
import { SERVER_IP } from '../config/config';

const baseURL = SERVER_IP + '/server/stocks';

class StockService {
    async getBySymbols(symbols=[], timePeriod=undefined) {
        // timePeriod = [startDate: timestamp, endDate: timestamp]
        return axios({
            method: 'post',
            url: baseURL,
            data: timePeriod ? {
                stockSymbols: '["600000"]',
                timePeriods: timePeriod
            } : {stockSymbols: symbols,}, 
            headers: {          
                'Content-Type': 'application/json',
            }, 
        })
    }
}

export default new StockService();