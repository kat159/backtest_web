const axios = require('axios');
const { DATE_FORMAT_BACKEND } = require('../config/config');
const { decodeCriterionById } = require('./criterionService');
const criterionService = require('./criterionService');

const baseURL = 'http://127.0.0.1:5000';

class BacktestService {
    async runTest(data) {
        return axios({
            method: 'post',
            url: baseURL + '/backtest',
            data: data,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    async formDataToBackendFormat(values) {
        const userId = localStorage.getItem('userId');
        const parseCriteria = async (criteriaIdList, criterionLogic) => {
            const criterionStrList = []
            for (const criterionId of criteriaIdList) {
                const res = await criterionService.getCriterionById(criterionId);
                // criterionStrList.push(res.criterion_str);
                // criterionStrList.push(decodeCriterionById(res.id))       // **不能直接引用方法！！ 这样this是undefined， 是不是因为class export的原因？？
                criterionStrList.push(await criterionService.decodeCriterionById(res.id))
            }
            return criterionStrList.join(' ' + criterionLogic + ' ')
        }
        let { closeCriteriaIdList, closeCriteriaLogic, openCriteriaIdList, openCriteriaLogic,
            bidAskSpread, capital, capitalAtRisk, holdingDays, positionType, timePeriod, commission } = values
        const openCriterionStr = (await parseCriteria(openCriteriaIdList, openCriteriaLogic)).replaceAll('and', '&').replaceAll('or', '|')
        // console.log('backtest_running: open_criterion_str =', openCriterionStr)
        const closeCriterionStr = (await parseCriteria(closeCriteriaIdList, closeCriteriaLogic)).replaceAll('and', '&').replaceAll('or', '|')
        timePeriod = timePeriod.map(m => m.format(DATE_FORMAT_BACKEND))
        const data = {
            userId: userId,
            positionType: positionType,
            openCriterionStr: openCriterionStr,
            closeCriterionStr: closeCriterionStr,
            holdingDays: holdingDays,
            testParams: {
                capital: capital,
                capitalAtRisk: capitalAtRisk,
                commission: commission,
                bidAskSpread: bidAskSpread,
                timePeriod: timePeriod
            }
        }
        return data
    }
    async runTestWithFormData(values) {
        const data = await this.formDataToBackendFormat(values);
        // console.log('test:', data)
        const res = await this.runTest(data)
        return res
    }
}

module.exports = new BacktestService();