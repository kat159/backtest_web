const axios = require('axios');
const criterionItemService = require('./criterionItemService');
const baseURL = 'http://127.0.0.1:3000/criteria';

const {itemDict} = criterionItemService.getAll()

class CriterionService {
    async getAll(userId) {
        return axios({
            method: 'get',
            url: baseURL,
            params: {userId: userId}
        }).then(
            res => {
                console.log(res)
                const {err_code, results, } = res.data
                for (const criterion of results) {
                    criterion.criterion_arr = JSON.parse(criterion.criterion_arr)
                    criterion.temporary_criterion_list = JSON.parse(criterion.temporary_criterion_list)
                }
                return res
            }, 
            err => {

            }
        )
    }
    async addCriterion(userId, criterionName, criterionStr, nestedCriterion, temporaryCriterionList) {
        const criterion = {
            user_id: userId,
            name: criterionName,
            criterion_str: criterionStr,
            criterion_arr: JSON.stringify(nestedCriterion),
            temporary_criterion_list: JSON.stringify(temporaryCriterionList)
        }
        return axios({
            method: 'post',
            url: baseURL,
            data: JSON.stringify(criterion),
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    async updateCriterion(criterionId, userId, criterionName, criterionStr, nestedCriterion, temporaryCriterionList) {
        const criterion = {
            name: criterionName,
            user_id: userId,
            criterion_str: criterionStr,
            criterion_arr: JSON.stringify(nestedCriterion),
            temporary_criterion_list: JSON.stringify(temporaryCriterionList)
        }
        return axios({
            method: 'put',
            url: baseURL + '/' + criterionId,
            data: criterion,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    async getCriterionWithName(userId, criterionName) {
        return axios({
            method: 'get',
            url: baseURL,
            params: {userId: userId, criterionName: criterionName}
        }).then(
            res => {
                const {err_code, results, } = res.data
                const data = results[0]
                data.criterion_arr = JSON.parse(data.criterion_arr)
                data.temporary_criterion_list = JSON.parse(data.temporary_criterion_list)
                return data
            }, 
            err => {

            }
        )
    }
    async getCriterionById(id) {
        return axios({
            method: 'get',
            url: baseURL + "/" + id,
        }).then(
            res => {
                const {err_code, results, } = res.data
                const data = results[0]
                data.criterion_arr = JSON.parse(data.criterion_arr)
                data.temporary_criterion_list = JSON.parse(data.temporary_criterion_list)
                return data
            }, 
            err => {

            }
        )
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
    async deleteById(id) {
        return axios({
            method: 'delete',
            url: baseURL + '/' + id,
        })
    }
    async decodeCriterionById(id) {         // return: explicitly decoded criterion string
        // console.log(this)
        const criterion = await this.getCriterionById(id);
        console.log(222, id, criterion)
        const {criterion_arr, temporary_criterion_list, } = criterion
        return this.stringfyCriterion(criterion_arr, temporary_criterion_list, true)
    }

    isTemporaryCriterion(itemId) {
        return itemId.indexOf('tempItem#') >= 0
    }
    getTemporaryCriterionById(id, temporaryCriterionList) {                 // 找不到返回undefined
        for (const item of temporaryCriterionList) {
            if (item.id === id) {
                return item
            }
        }
        return undefined
    }
    stringfyCriterion(nestedCriterion, temporaryCriterionList, expandTempItem=false) {  // no validity check, replace empty array with __
        const helper = (curNestedCriterion) => {
            if (curNestedCriterion.length === 0) { // 有未填的空
                return '__';
            }
            if (curNestedCriterion[0] === '') {     // unfilled Exact Number
                return '__';
            }
            if (!isNaN(parseInt(curNestedCriterion[0]))) {  // Exact Number
                return curNestedCriterion[0]
            }
            if (this.isTemporaryCriterion(curNestedCriterion[0])) {  // temp item id
                const tempItem = this.getTemporaryCriterionById(curNestedCriterion[0], temporaryCriterionList)
                if (expandTempItem) {
                    return helper(tempItem.nestedCriterion)
                }
                return tempItem.name
            }
            const itemName = curNestedCriterion[0];
            const itemInfo = itemDict[itemName];
            const { leadingText, paramTypes, joinChar, returnType } = itemInfo
            if (paramTypes.length === 0) {  // 不需要param
                return leadingText
            }
            let resStr = '';
            resStr += leadingText + '(';
            for (let i = 1; i < curNestedCriterion.length; i++) {
                if (i > 1) {
                    resStr += joinChar;
                }
                resStr += helper(curNestedCriterion[i]);
            }
            resStr += ')';
            return resStr
        }
        const res = helper(nestedCriterion);
        return res
    }
}

module.exports = new CriterionService();