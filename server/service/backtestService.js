const strategyModel = require('../model/strategyModel');
const mq = require('../config/mq');
const axios = require('axios')
const { nanoid } = require('nanoid');

module.exports = {
    async backtest(req, res, next) {
        if (req.method === 'POST') {     // OPTION不执行
            const body = req.body
            const result = await axios({
                method: 'post',
                url: 'http://127.0.0.1:5000/backtest',
                data: body,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            res.send(result.data)
            // rabbitmq:
            // const queue = 'backtest';
            // const strategy = strategyModel.toStrategyFile(req.body);
            // strategy.testid = nanoid();
            // console.log('strategy:', strategy);

            // const a = await mq.rabbitmqSend(queue, JSON.stringify(strategy));
            // const consumeQueue = 'test_report_' + strategy.testid;
            // const report = await mq.rabbitmqConsume(consumeQueue);  // await后面必须跟Promise对象，然后res会变成resolve的内容而不是promise，
            // res.send(report);
        } else {
            res.send('Options request received.');
        }
    }
}