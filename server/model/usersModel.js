const db = require('../config/db');

class UsersMedol {
    constructor() {

    }
    
    findAll() {
        const sql = 'select * from users';
        return db.query(sql, []);
    }

    findById(id) {
        const sql = 'select * from users where id = ?';
        return db.query(sql, [id]);
    }

    findByUsername(username) {
        const sql = 'select * from users where username = ?';
        return db.query(sql, [username]);
    }

    updateById(body, id) {
        const sql = 'update users set ? where id = ?';
        return db.query(sql, [body, id]);
    }

    deleteById(id) {
        const sql = 'delete from users where id = ?';
        return db.query(sql, [id]);
    }

    create(body) {
        const sql = 'insert into users set ?';
        return db.query(sql, [body]);
    }
}

module.exports = new UsersMedol();