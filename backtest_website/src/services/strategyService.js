import axios from 'axios';
import moment from 'moment';

const baseURL = 'http://127.0.0.1:3000/strategies';

const backendDateFormat = 'YYYY-MM-DD'
const frontendDateFormat = 'YYYY/MM/DD'

class StrategyService {
    async getAll(userId) {
        return axios({
            method: 'get',
            url: baseURL,
            params: {userId: userId}
        })
    }

    async getById(strategyId) {
        return axios({
            method: 'get',
            url: baseURL + '/' + strategyId,
        })
    }

    toBackendFormat(values) {
        const userId = localStorage.getItem('userId')
        let {strategyName, description, closeCriteriaIdList, closeCriteriaLogic, openCriteriaIdList, openCriteriaLogic,
            bidAskSpread, capital, capitalAtRisk, holdingDays, positionType, timePeriod, commission } = values
        const data = {
            user_id: userId,
            description: description,
            name: strategyName,
            open_criterion_id_list: JSON.stringify(openCriteriaIdList),
            close_criterion_id_list: JSON.stringify(closeCriteriaIdList),
            holding_days: holdingDays,
            capital: capital,
            capital_at_risk: capitalAtRisk,
            commission: commission,
            bid_ask_spread: bidAskSpread,
            openCriteriaLogic: openCriteriaLogic,
            closeCriteriaLogic: closeCriteriaLogic,
            position_type: positionType,
            start_date: timePeriod[0].format(backendDateFormat),
            end_date: timePeriod[1].format(backendDateFormat)
        }
        return data;
    }

    fromBackendFormat(values) {
        let {id, name, description, open_criterion_id_list, close_criterion_id_list, holding_days,
            capital, capital_at_risk, commission, bid_ask_spread, openCriteriaLogic, closeCriteriaLogic,
            position_type, start_date, end_date} = values
        const data = {
            id : id,
            description: description,
            strategyName: name,
            openCriteriaIdList: JSON.parse(open_criterion_id_list),
            closeCriteriaIdList: JSON.parse(close_criterion_id_list),
            holdingDays: holding_days,
            capital: capital,
            capitalAtRisk: capital_at_risk,
            commission: commission,
            bidAskSpread: bid_ask_spread,
            openCriteriaLogic: openCriteriaLogic,
            closeCriteriaLogic: closeCriteriaLogic,
            positionType: position_type,
            timePeriod: [moment(start_date, frontendDateFormat), moment(end_date, frontendDateFormat)],
        }
        return data;
    }

    async addStrategy(values) {
        const data = this.toBackendFormat(values);
        if (!data.description) {
            data.description = '-';
        }
        return axios({
            method: 'post',
            url: baseURL,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    async daleteStrategy(strategyId) {
        return axios({
            method: 'delete',
            url: baseURL + '/' + strategyId
        })
    }

    async updateStrategy(strategyId, strategy) {
        // console.log('11111111', strategyId);
        const data = this.toBackendFormat(strategy);
        return axios({
            method: 'put',
            url: baseURL + '/' + strategyId,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    async suggestAllWithName(userId, curLeadingTextOfName) {
        return axios({
            method: 'post',
            url: baseURL+'/suggest',
            params: {userId: userId, leadingTextOfName: curLeadingTextOfName}, 
        }).then(
            res => {
                return res.data
            },
            err => {
                return {err_code: 1, message: 'uncleared error'}
            }
        )
    }

}

export default new StrategyService();