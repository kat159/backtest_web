const db = require('../config/db');

class backtestLogMedol {
    constructor() {

    }

    findByUserIdAndPartialLeadingbacktestLogName(user_id, partialLeadingName) {
        const sql = 'select b.id, date, strategy_id, s.name as strategy_name, return_rate, metrics \
                        from backtest_records b \
                        inner join strategies s \
                        on b.strategy_id = s.id \
                    where b.user_id = ? and name like ? ';
        return db.query(sql, [user_id, partialLeadingName + '%'])
    }

    findByUserIdAndbacktestLogName(user_id, name) {
        const sql = 'select * from backtest_records where user_id = ? and name = ?' ;
        return db.query(sql, [user_id, name])
    }

    findById(id) {
        const sql = 'select b.id, date, capital_flow, capital_flow_dates, strategy_id, s.name as strategy_name, return_rate, metrics \
                        from backtest_records b \
                        inner join strategies s \
                        on b.strategy_id = s.id \
                    where b.id = ? ';
        return db.query(sql, [id]);
    }

    findByUserId(user_id) {
        const sql = 'select b.id, date, strategy_id, s.name as strategy_name, return_rate, metrics \
                        from backtest_records b \
                        inner join strategies s \
                        on b.strategy_id = s.id \
                    where b.user_id = ? ';
        return db.query(sql, [user_id]);
    }

    updateById(body, id) {
        const sql = 'update backtest_records set ? where id = ?';
        return db.query(sql, [body, id]);
    }

    deleteById(id) {
        const sql = 'delete from backtest_records where id = ?';
        return db.query(sql, [id]);
    }

    create(body) {
        const sql = 'insert into backtest_records set ?';
        return db.query(sql, [body]);
    }
}

module.exports = new backtestLogMedol();