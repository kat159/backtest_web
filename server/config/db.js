const mysql = require('mysql');
const dbConfig = require('./db.config');

module.exports = {
    query(sql, params) {
        return new Promise((resolve, reject) => {
            const connection = mysql.createConnection(dbConfig);
            connection.connect(err => {
                if (err) {
                    console.log('connection to database failed');
                    reject(err);
                }
                console.log('succesfully connect to database');
            })
            
            connection.query(sql, params, (err, results, fields) => {
                if (err) {
                    console.log('database operation failed');
                    reject(err);
                }
                resolve({
                    results, 
                    fields
                })
            })
            connection.end(err => {
                if (err) {
                    console.log('failed to close database');
                    reject(err);
                }
                console.log('succesfully close database');
            })
        })
    },
    initDB() {
        return new Promise(async (resolve, reject) => {
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root',
            });
            connection.connect(err => {
                if (err) {
                    console.log('connection to database failed');
                    reject(err);
                }
                console.log('succesfully connect to database');
            })

            var sqls = [
                "CREATE DATABASE if not exists mydb;",
                "use mydb;",
                "CREATE TABLE if not exists users (\
                    user_id INT AUTO_INCREMENT, \
                    username VARCHAR(255), \
                    password VARCHAR(255), \
                    signup_date TIMESTAMP, \
                    PRIMARY KEY (user_id), \
                    UNIQUE KEY username (username) \
                    );",
                "CREATE TABLE if not exists watch_lists (\
                    watch_list_id INT AUTO_INCREMENT, \
                    user_id INT, \
                    create_date DATE, \
                    name VARCHAR(255), \
                    PRIMARY KEY (watch_list_id), \
                    CONSTRAINT user_fk1 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE \
                    );",
                "CREATE TABLE if not exists stocks (\
                    stock_id INT AUTO_INCREMENT,  \
                    name VARCHAR(255), \
                    symbol VARCHAR(255), \
                    PRIMARY KEY (stock_id), \
                    UNIQUE KEY name (name) \
                    );",
                "CREATE TABLE if not exists watch_list_items (\
                    watch_list_item_id INT AUTO_INCREMENT, \
                    stock_id INT, \
                    watch_list_id INT, \
                    PRIMARY KEY (watch_list_item_id), \
                    CONSTRAINT stock_fk1 FOREIGN KEY (stock_id) REFERENCES stocks (stock_id) ON DELETE SET NULL ON UPDATE CASCADE, \
                    CONSTRAINT watch_list_fk1 FOREIGN KEY (watch_list_id) REFERENCES watch_lists (watch_list_id) ON DELETE SET NULL ON UPDATE CASCADE \
                    );",
                "CREATE TABLE if not exists transactions (\
                    transaction_id INT AUTO_INCREMENT, \
                    stock_id INT, \
                    user_id INT, \
                    date DATE, \
                    hand INT, \
                    price FLOAT, \
                    PRIMARY KEY (transaction_id), \
                    CONSTRAINT user_fk2 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE, \
                    CONSTRAINT stock_fk2 FOREIGN KEY (stock_id) REFERENCES stocks (stock_id) ON DELETE SET NULL ON UPDATE CASCADE \
                    );",
                "CREATE TABLE if not exists strategies (\
                    strategy_id INT AUTO_INCREMENT, \
                    strategy JSON, \
                    user_id INT, \
                    PRIMARY KEY (strategy_id), \
                    CONSTRAINT user_fk3 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE \
                    );"
            ] 
            for (const sql of sqls) {
                connection.query(sql, (err, results, fields) => {
                    if (err) {
                        console.log('database operation failed');
                        reject(err);
                    }
                    resolve({
                        results,
                        fields
                    })
                })
            }
            connection.end(err => {
                if (err) {
                    console.log('failed to close database');
                    reject(err);
                }
                console.log('succesfully initialize database');
                console.log('succesfully close database');
            })
        })
    }
}
