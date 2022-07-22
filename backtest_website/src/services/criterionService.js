const axios = require('axios')
const baseURL = 'http://127.0.0.1:3000/criteria';

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
                }
                return res
            }, 
            err => {

            }
        )
    }

    async addCriterion(userId, criterionName, criterionStr, nestedCriterion) {
        const criterion = {
            user_id: userId,
            name: criterionName,
            criterion_str: criterionStr,
            criterion_arr: JSON.stringify(nestedCriterion),
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

    async updateCriterion(criterionId, userId, criterionName, criterionStr, nestedCriterion) {
        const criterion = {
            name: criterionName,
            user_id: userId,
            criterion_str: criterionStr,
            criterion_arr: JSON.stringify(nestedCriterion),
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

}

module.exports = new CriterionService();