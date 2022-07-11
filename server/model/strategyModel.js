// function join(criterion) {
//     const newC = []
//     for (const criteria of criterion) {
//         // console.log('criteria:' + criteria)
//         newC.push(criteria.join(''))
//     }
//     return newC
// }

// const toPython = (strategy) => {
//     // console.log(strategy);
//     const {openCriterion, closeCriterion} = strategy
//     strategy.openCriterion = join(openCriterion);
//     strategy.closeCriterion = join(closeCriterion);
//     return strategy
// }

// module.exports.toStrategyFile = toPython

const db = require('../config/db');

class strategyMedol {
    constructor() {

    }
    
    findAll() {
        const sql = 'select * from strategies';
        return db.query(sql, []);
    }

    findById(id) {
        const sql = 'select * from strategies where id = ?';
        return db.query(sql, [id]);
    }

    findByUserId(username) {
        const sql = 'select * from strategies where user_id = ?';
        return db.query(sql, [username]);
    }

    updateById(body, id) {
        const sql = 'update strategies set ? where id = ?';
        return db.query(sql, [body, id]);
    }

    deleteById(id) {
        const sql = 'delete from strategies where id = ?';
        return db.query(sql, [id]);
    }

    create(body) {
        const sql = 'insert into strategies set ?';
        return db.query(sql, [body]);
    }
}

module.exports = new strategyMedol();