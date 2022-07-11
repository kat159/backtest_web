const criterionModel = require('../model/criterionModel')

class CriterionService {
    constructor() {

    }
    async getCriterion(req, res, next) {
        const {userId, } = req.query;
        if (userId !== undefined) {
            const {results, } = await criterionModel.findByUserId(userId);
            res.json({ results: results, err_code: 0});
        } else if (false) {

        } else {
            const {results, } = await criterionModel.findAll();
            res.json({ results: results, err_code: 0 });
        }
        
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
        const { results } = await criterionModel.create(body);
        console.log(results);
        res.json(results);
        // res.json({ message: 'Succesfully add criterion', err_code: 0 });
    }

    async updateCriterionById(req, res, next) {
        const { body } = req;
        const { id } = req.params;
        const { results } = await criterionModel.updateById(body, id);
        console.log(body)
        console.log(results);
        if (results.affectedRows !== 1) res.json({ err_code: 1, message: 'Unexpected Error, affectedRows =' + results.affectedRows });
        else res.json({ err_code: 0, message: 'successfully update criterion' });
    }

    async deleteCriterionById(req, res, next) {
        const { id } = req.params;
        const { results } = await criterionModel.deleteById(id);
        if (results.affectedRows !== 1) return res.json({ message: 'Delete failed' });
        else res.json({ message: 'Successfully delete criterion' });
    }
}

module.exports = new CriterionService();