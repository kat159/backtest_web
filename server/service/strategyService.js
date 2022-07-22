const strategyModel = require('../model/strategyModel')

class StrategyService {
    constructor() {

    }
    async getStrategy(req, res, next) {
        const {userId, strategyName} = req.query;
        console.log('query:', req.query, ', params:', req.params, ', body:', req.body)
        if (userId !== undefined && strategyName !== undefined) {
            const {results, } = await strategyModel.findByUserIdAndStrategyName(userId, strategyName);
            res.json({ results: results, err_code: 0});
        } else if (userId !== undefined) {
            const {results, } = await strategyModel.findByUserId(userId);
            res.json({ results: results, err_code: 0});
        } else if (false) {

        } else {
            const {results, } = await strategyModel.findAll();
            res.json({ results: results, err_code: 0 });
        }
        
    }

    async suggestAllWithNameAndUserId(req, res, next) {
        console.log(req.query, req.params, req.body);
        const {userId, leadingTextOfName} = req.query
        const {results, } = await strategyModel.findByUserIdAndPartialLeadingStrategyName(userId, leadingTextOfName)
        res.json({results: results, err_code: 0});
    }

    async getStrategyById(req, res, next) {
        const id = req.params.id;
        const { results } = await strategyModel.findById(id);
        if (results.length === 0) res.json({ message: 'strategy not found', err_code: 1, results: [] });
        else res.json({ results: results, err_code: 0 });
    }

    async addStrategy(req, res, next) {
        const { body } = req;
        console.log('Add Strategy:', body);
        let s = await strategyModel.findByUserIdAndStrategyName(body.user_id, body.name)
        if (s.results.length > 0) {
            res.json({message: 'Strategy Name Exists', err_code: 1})
        } else {
            const {results } = await strategyModel.create(body)
            console.log('add results:', results);
            res.json({ message: 'Succesfully add strategy', err_code: 0, results: results });
        }   
    }

    async updateStrategyById(req, res, next) {
        const { body } = req;
        const { id } = req.params;
        let s = await strategyModel.findByUserIdAndStrategyName(body.user_id, body.name)
        if (s.results.length > 0) {
            if ((s.results[0].id).toString() !== id) { // 跟自己的别的函数重名，跟函数本身重名没关系
                res.json({message: 'Strategy Name Exists', err_code: 1})
            }
        }
        const { results } = await strategyModel.updateById(body, id);
        console.log(body)
        console.log(results);
        if (results.affectedRows !== 1) res.json({ err_code: 1, message: 'Unexpected Error, affectedRows =' + results.affectedRows });
        else res.json({ err_code: 0, message: 'successfully update strategy' });
    }

    async deleteStrategyById(req, res, next) {
        const { id } = req.params;
        const { results } = await strategyModel.deleteById(id);
        if (results.affectedRows !== 1) return res.json({err_code: 1, message: 'Delete failed' });
        else res.json({ err_code: 0, message: 'Successfully delete strategy' });
    }
}

module.exports = new StrategyService();