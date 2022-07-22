const criterionModel = require('../model/criterionModel')

class CriterionService {
    constructor() {

    }
    async getCriterion(req, res, next) {
        const {userId, criterionName} = req.query;
        console.log('query:', req.query, ', params:', req.params, ', body:', req.body)
        if (userId !== undefined && criterionName !== undefined) {
            const {results, } = await criterionModel.findByUserIdAndCriterionName(userId, criterionName);
            res.json({ results: results, err_code: 0});
        } else if (userId !== undefined) {
            const {results, } = await criterionModel.findByUserId(userId);
            res.json({ results: results, err_code: 0});
        } else if (false) {

        } else {
            const {results, } = await criterionModel.findAll();
            res.json({ results: results, err_code: 0 });
        }
        
    }

    async suggestAllWithNameAndUserId(req, res, next) {
        console.log(req.query, req.params, req.body);
        const {userId, leadingTextOfName} = req.query
        const {results, } = await criterionModel.findByUserIdAndPartialLeadingCriterionName(userId, leadingTextOfName)
        res.json({results: results, err_code: 0});
    }

    async getCriterionById(req, res, next) {
        const id = req.params.id;
        const { results } = await criterionModel.findById(id);
        if (results.length === 0) res.json({ message: 'criterion not found', err_code: 1, results: [] });
        else res.json({ results: results, err_code: 0 });
    }

    async addCriterion(req, res, next) {
        const { body } = req;
        console.log('Add Criterion:', body);
        let s = await criterionModel.findByUserIdAndCriterionName(body.user_id, body.name)
        if (s.results.length > 0) {
            res.json({message: 'Criterion Name Exists', err_code: 1})
        } else {
            const {results, } = criterionModel.create(body)
            res.json({ message: 'Succesfully add criterion', err_code: 0 });
        }   
    }

    async updateCriterionById(req, res, next) {
        const { body } = req;
        const { id } = req.params;
        let s = await criterionModel.findByUserIdAndCriterionName(body.user_id, body.name)
        if (s.results.length > 0) {
            if ((s.results[0].id).toString() !== id) { // 跟自己的别的函数重名，跟函数本身重名没关系
                res.json({message: 'Criterion Name Exists', err_code: 1})
            }
        }
        const { results } = await criterionModel.updateById(body, id);
        console.log(body)
        console.log(results);
        if (results.affectedRows !== 1) res.json({ err_code: 1, message: 'Unexpected Error, affectedRows =' + results.affectedRows });
        else res.json({ err_code: 0, message: 'successfully update criterion' });
    }

    async deleteCriterionById(req, res, next) {
        const { id } = req.params;
        const { results } = await criterionModel.deleteById(id);
        if (results.affectedRows !== 1) return res.json({ err_code: 1, message: 'Delete failed' });
        else res.json({ err_code: 0, message: 'Successfully delete criterion' });
    }
}

module.exports = new CriterionService();