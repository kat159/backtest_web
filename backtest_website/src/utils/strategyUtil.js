import criterionService from "../services/criterionService"

const userId = localStorage.getItem('userId')
const backendDateFormat = 'YYYY-MM-DD'

class StrategyUtil {
    async formDataToBackendFormat(values) {
        const parseCriteria = async (criteriaIdList, criterionLogic) => {
            const criterionStrList = []
            for (const criterionName of criteriaIdList) {
                const res = await criterionService.getCriterionWithName(userId, criterionName)
                criterionStrList.push(res.criterion_str);
            }
            return criterionStrList.join(' ' + criterionLogic + ' ')
        }
        let {closeCriteriaIdList, closeCriteriaLogic, openCriteriaIdList, openCriteriaLogic,
            bidAskSpread, capital, capitalAtRisk, holdingDays, positionType, timePeriod, commission} = values
        const openCriterionStr = (await parseCriteria(openCriteriaIdList, openCriteriaLogic)).replaceAll('and', '&').replaceAll('or', '|')
        const closeCriterionStr = (await parseCriteria(closeCriteriaIdList, closeCriteriaLogic)).replaceAll('and', '&').replaceAll('or', '|')
        timePeriod = timePeriod.map(m => m.format(backendDateFormat))

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
}

module.exports = new StrategyUtil();