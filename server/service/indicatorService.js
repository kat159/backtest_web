const strategyModel = require('../model/strategyModel');
const mq = require('../config/mq');
const axios = require('axios')
const { nanoid } = require('nanoid');

module.exports = {
    async formulaCalculator(req, res, next) {
        console.log(req.body)
        if (req.method === 'POST') {     // OPTION不执行
            const body = req.body
            const result = await axios({
                method: 'post',
                url: 'http://127.0.0.1:5000/formula_calculator',
                data: body,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            res.send(result.data)
        } else {
            res.send('Options request received.');
        }
    }
}