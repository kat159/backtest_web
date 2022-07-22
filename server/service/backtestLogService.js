const backtestLogModel = require('../model/backtestLogModel')

class backtestLogService {
    constructor() {

    }
    async getbacktestLog(req, res, next) {
        const {userId, backtestLogName} = req.query;
        console.log('query:', req.query, ', params:', req.params, ', body:', req.body)
        if (userId !== undefined && backtestLogName !== undefined) {
            const {results, } = await backtestLogModel.findByUserIdAndbacktestLogName(userId, backtestLogName);
            res.json({ results: results, err_code: 0});
        } else if (userId !== undefined) {
            const {results, } = await backtestLogModel.findByUserId(userId);
            res.json({ results: results, err_code: 0});
        } else if (false) {

        } else {
            const {results, } = await backtestLogModel.findAll();
            res.json({ results: results, err_code: 0 });
        }
        
    }

    async suggestAllWithNameAndUserId(req, res, next) {
        // only return backtestLogs names
        console.log(req.query, req.params, req.body);
        const {userId, leadingTextOfName} = req.query
        const {results, } = await backtestLogModel.findByUserIdAndPartialLeadingbacktestLogName(userId, leadingTextOfName)
        res.json({results: results, err_code: 0});
    }

    async getbacktestLogById(req, res, next) {
        const id = req.params.id;
        const { results } = await backtestLogModel.findById(id);
        if (results.length === 0) res.json({ message: 'backtestLog not found', err_code: 1, results: [] });
        else res.json({ results: results, err_code: 0 });
    }

    async addbacktestLog(req, res, next) {
        const {body} = req
        
        const {results, } = await backtestLogModel.create(body)
        console.log('add results:', results);
        res.json({ message: 'Succesfully add backtestLog', err_code: 0 });
    }

    async updatebacktestLogById(req, res, next) {
        const { body } = req;
        const { id } = req.params;
        let s = await backtestLogModel.findByUserIdAndbacktestLogName(body.user_id, body.name)
        if (s.results.length > 0) {
            if ((s.results[0].id).toString() !== id) { // 跟自己的别的函数重名，跟函数本身重名没关系
                res.json({message: 'backtestLog Name Exists', err_code: 1})
            }
        }
        const { results } = await backtestLogModel.updateById(body, id);
        console.log(body)
        console.log(results);
        if (results.affectedRows !== 1) res.json({ err_code: 1, message: 'Unexpected Error, affectedRows =' + results.affectedRows });
        else res.json({ err_code: 0, message: 'successfully update backtestLog' });
    }

    async deletebacktestLogById(req, res, next) {
        const { id } = req.params;
        const { results } = await backtestLogModel.deleteById(id);
        if (results.affectedRows !== 1) return res.json({err_code: 1, message: 'Delete failed' });
        else res.json({ err_code: 0, message: 'Successfully delete backtestLog' });
    }
}

module.exports = new backtestLogService();