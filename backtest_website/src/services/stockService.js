import axios from "axios";

const baseURL = 'http://127.0.0.1:5000/stocks';

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