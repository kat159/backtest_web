const strategyModel = require('../model/strategyModel')

class StrategyService {
    constructor() {

    }
    async getStrategies(req, res, next) {
        const {results, } = await strategyModel.findAll();
        res.json({ results: results, err_code: 0 });
    }

    async getStrategyById(req, res, next) {
        const id = req.params.id;
        const { results } = await strategyModel.findById(id);
        if (results.length === 0) res.json({ message: 'strategy not found', err_code: 1, results: [] });
        else res.json({ results: results, err_code: 0 });
    }

    async addStrategy(req, res, next) {
        const { body } = req;
        const { results } = await strategyModel.create(body);
        console.log(results);
        res.json({ message: 'Succesfully add strategy', err_code: 0 });
    }

    async updateStrategyById(req, res, next) {
        const { body } = req;
        const { id } = req.params;
        const { results } = await strategyModel.updateById(body, id);
        if (results.affectedRows !== 1) res.json({ err_code: 1, message: 'strategy_id not found' });
        else res.json({ err_code: 0, message: 'successfully update strategy' });
    }

    async deleteStrategyById(req, res, next) {
        const { id } = req.params;
        const { results } = await strategyModel.deleteById(id);
        if (results.affectedRows !== 1) return res.json({ err_code: 1, message: 'Delete failed' });
        else res.json({ err_code: 0, message: 'Successfully delete strategy' });
    }
}

module.exports = new StrategyService();