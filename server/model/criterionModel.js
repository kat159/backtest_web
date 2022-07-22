const db = require('../config/db');

class criterionMedol {
    constructor() {

    }

    findByUserIdAndPartialLeadingCriterionName(user_id, partialLeadingName) {
        const sql = 'select * from criteria where user_id = ? and name like ?';
        return db.query(sql, [user_id, partialLeadingName + '%'])
    }

    findByUserIdAndCriterionName(user_id, name) {
        const sql = 'select * from criteria where user_id = ? and name = ?' ;
        return db.query(sql, [user_id, name])
    }

    findAll() {
        const sql = 'select * from criteria';
        return db.query(sql, []);
    }

    findById(id) {
        const sql = 'select * from criteria where id = ?';
        return db.query(sql, [id]);
    }

    findByUserId(user_id) {
        const sql = 'select * from criteria where user_id = ? order by id';
        return db.query(sql, [user_id]);
    }

    updateById(body, id) {
        const sql = 'update criteria set ? where id = ?';
        return db.query(sql, [body, id]);
    }

    deleteById(id) {
        const sql = 'delete from criteria where id = ?';
        return db.query(sql, [id]);
    }

    create(body) {
        const sql = 'insert into criteria set ?';
        return db.query(sql, [body]);
    }
}

module.exports = new criterionMedol();