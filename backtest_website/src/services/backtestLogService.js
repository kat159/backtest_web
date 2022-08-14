import strategyService from './strategyService';
import axios from 'axios';
import {DATE_FORMAT_BACKEND} from '../config/config'
import moment from 'moment';
const baseURL = 'http://127.0.0.1:3000/server/backtest_logs';

class BacktestLogService {
    async add(data) {
        const {capitalFlow, metrics, strategyId, date, } = data
        const userId = localStorage.getItem('userId')
        const curDate = moment().format();
        const strategy = await strategyService.getById(strategyId)
        const strategyName = strategy.data.results[0].name
        // console.log(1111111, strategy)
        const body = {
            user_id : userId,
            date: curDate,
            return_rate: metrics.returnRate,
            strategy_id: strategyId,
            strategy_name: strategyName,
            capital_flow: JSON.stringify(capitalFlow),
            metrics: JSON.stringify(metrics),
            capital_flow_dates: JSON.stringify(date),
        }
        return axios({
            method: 'post',
            url: baseURL,
            data: body,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    async getAll() {
        const userId = localStorage.getItem('userId');
        return axios({
            method: 'get',
            url: baseURL,
            params: {userId: userId},
        }).then(
            res => {
                let {results} = res.data
                results = results.map((d) => {
                    const {return_rate, ...res} = {strategyId:d.strategy_id, strategyName: d.strategy_name, ...d, ...JSON.parse(d.metrics), key:d.id, date: moment(d.date).format('YYYY-MM-DD HH:mm:ss')}
                    return res
                })
                return results
            }
        )
    }
}

export default new BacktestLogService();