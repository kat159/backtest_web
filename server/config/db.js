const mysql = require('mysql');
const dbConfig = require('./db.config');

const connection = mysql.createConnection(dbConfig);
connection.connect(err => {
    if (err) {
        console.log('connection to database failed');
    }
    console.log('succesfully connect to database(db connection initialize)');
})

module.exports = {
    query(sql, params) {
        return new Promise((resolve, reject) => {
            connection.query(sql, params, (err, results, fields) => {
                if (err) {
                    console.log('Database Operation Failed: ', sql);
                    reject(err);
                }
                resolve({
                    results,
                    fields
                })
            })
        })
    },
    initDB() {
        return new Promise(async (resolve, reject) => {
            const sqls = [ 
                'CREATE database IF NOT EXISTS backtest;',
                'USE backtest;',

                'CREATE TABLE IF NOT EXISTS`backtest`.`users`( \
                    `id` INT NOT NULL AUTO_INCREMENT,\
                    `username` VARCHAR(45) NULL DEFAULT NULL,\
                    `password` VARCHAR(45) NULL DEFAULT NULL,\
                    `signup_date` TIMESTAMP NULL DEFAULT NULL,\
                    PRIMARY KEY(`id`),\
                    UNIQUE INDEX`username_UNIQUE`(`username` ASC) VISIBLE)\
                ENGINE = InnoDB\
                AUTO_INCREMENT = 6\
                DEFAULT CHARACTER SET = utf8;',
 

                'CREATE TABLE IF NOT EXISTS`backtest`.`backtest_records`(\
                    `id` INT NOT NULL AUTO_INCREMENT,\
                    `user_id` INT NOT NULL,\
                    `date` TIMESTAMP NOT NULL,\
                    `return_rate` VARCHAR(45) NOT NULL,\
                    `capital_flow` JSON NOT NULL,\
                    `metrics` JSON NOT NULL,\
                    `capital_flow_dates` JSON NOT NULL,\
                    `strategy_id` INT NOT NULL,\
                    `strategy_name` VARCHAR(45) NOT NULL,\
                    PRIMARY KEY(`id`),\
                    UNIQUE INDEX`user_id_id_UNIQUE`(`user_id` ASC, `id` ASC) VISIBLE,\
                    INDEX`fk_backtest_records_users1_idx`(`user_id` ASC) VISIBLE,\
                    CONSTRAINT`fk_backtest_records_users1`\
                    FOREIGN KEY(`user_id`)\
                    REFERENCES`backtest`.`users`(`id`)\
                    ON DELETE CASCADE\
                    ON UPDATE CASCADE\
                )\
                ENGINE = InnoDB\
                AUTO_INCREMENT = 24\
                DEFAULT CHARACTER SET = utf8;',


                'CREATE TABLE IF NOT EXISTS`backtest`.`criteria`(\
                    `id` INT NOT NULL AUTO_INCREMENT,\
                    `user_id` INT NOT NULL ,\
                    `name` VARCHAR(45) NOT NULL ,\
                    `criterion_str` MEDIUMTEXT NOT NULL,\
                    `criterion_arr` MEDIUMTEXT NOT NULL,\
                    `temporary_criterion_list` JSON NOT NULL,\
                    `description` MEDIUMTEXT NOT NULL,\
                    PRIMARY KEY(`id`),\
                    UNIQUE INDEX`user_id_name_UNIQUE`(`user_id` ASC, `name` ASC) VISIBLE,\
                    INDEX`fk_criteria_users1_idx`(`user_id` ASC) VISIBLE,\
                    CONSTRAINT`fk_criteria_users1`\
                    FOREIGN KEY(`user_id`)\
                    REFERENCES`backtest`.`users`(`id`)\
                    ON DELETE CASCADE\
                    ON UPDATE CASCADE\
                )\
                ENGINE = InnoDB\
                AUTO_INCREMENT = 28\
                DEFAULT CHARACTER SET = utf8;',


                'CREATE TABLE IF NOT EXISTS`backtest`.`indicators`(\
                    `id` INT NOT NULL AUTO_INCREMENT,\
                    `user_id` INT NOT NULL,\
                    `name` VARCHAR(45) NOT NULL,\
                    `indicatorscol` VARCHAR(45) NULL DEFAULT NULL,\
                    PRIMARY KEY(`id`),\
                    UNIQUE INDEX`user_id_name_UNIQUE`(`user_id` ASC, `name` ASC)  VISIBLE,\
                    INDEX`fk_indicators_users1_idx`(`user_id` ASC) VISIBLE,\
                    CONSTRAINT`fk_indicators_users1`\
                    FOREIGN KEY(`user_id`)\
                    REFERENCES`backtest`.`users`(`id`)\
                    ON DELETE CASCADE\
                    ON UPDATE CASCADE\
                )\
                ENGINE = InnoDB\
                DEFAULT CHARACTER SET = utf8;',


                'CREATE TABLE IF NOT EXISTS`backtest`.`criteria_has_indicators`(\
                    `id` INT NOT NULL AUTO_INCREMENT,\
                    `criterion_id` INT NOT NULL ,\
                    `indicator_id` INT NOT NULL,\
                    PRIMARY KEY(`id`),\
                    UNIQUE INDEX`index4`(`criterion_id` ASC, `indicator_id` ASC) VISIBLE,\
                    INDEX`fk_criteria_has_indicators_criteria1_idx`(`criterion_id` ASC) INVISIBLE,\
                    INDEX`fk_criteria_has_indicators_indicators1_idx`(`indicator_id` ASC) VISIBLE,\
                    CONSTRAINT`fk_criteria_has_indicators_criteria1`\
                    FOREIGN KEY(`criterion_id`)\
                    REFERENCES`backtest`.`criteria`(`id`)\
                    ON DELETE CASCADE\
                    ON UPDATE CASCADE,\
                    CONSTRAINT`fk_criteria_has_indicators_indicators1`\
                    FOREIGN KEY(`indicator_id`)\
                    REFERENCES`backtest`.`indicators`(`id`)\
                    ON DELETE CASCADE\
                    ON UPDATE CASCADE\
                )\
                ENGINE = InnoDB\
                DEFAULT CHARACTER SET = utf8;',

                'CREATE TABLE IF NOT EXISTS`backtest`.`indicator_categoies`(\
                    `id` INT NOT NULL AUTO_INCREMENT,\
                    `name` VARCHAR(45) NOT NULL,\
                    PRIMARY KEY(`id`),\
                    UNIQUE INDEX`id_UNIQUE`(`id` ASC) VISIBLE\
                )\
                ENGINE = InnoDB\
                DEFAULT CHARACTER SET = utf8;',


                'CREATE TABLE IF NOT EXISTS`backtest`.`market_data`(\
                    `id` INT NOT NULL AUTO_INCREMENT,\
                    PRIMARY KEY(`id`),\
                    UNIQUE INDEX`id_UNIQUE`(`id` ASC) VISIBLE\
                )\
                ENGINE = InnoDB\
                DEFAULT CHARACTER SET = utf8;',


                'CREATE TABLE IF NOT EXISTS`backtest`.`strategies`(\
                    `id` INT NOT NULL AUTO_INCREMENT,\
                    `user_id` INT NOT NULL ,\
                    `name` VARCHAR(45) NOT NULL,\
                    `open_criterion_id_list` MEDIUMTEXT NOT NULL,\
                    `close_criterion_id_list` MEDIUMTEXT NOT NULL,\
                    `holding_days` VARCHAR(45) NOT NULL,\
                    `capital` VARCHAR(45) NOT NULL,\
                    `capital_at_risk` VARCHAR(45) NOT NULL,\
                    `commission` VARCHAR(45) NOT NULL,\
                    `bid_ask_spread` VARCHAR(45) NOT NULL,\
                    `openCriteriaLogic` VARCHAR(45) NOT NULL,\
                    `closeCriteriaLogic` VARCHAR(45) NOT NULL,\
                    `start_date` VARCHAR(45) NOT NULL,\
                    `end_date` VARCHAR(45) NOT NULL,\
                    `position_type` VARCHAR(45) NOT NULL,\
                    `description` MEDIUMTEXT NOT NULL,\
                    PRIMARY KEY(`id`),\
                    UNIQUE INDEX`user_id_name_UNIQUE`(`user_id` ASC, `name` ASC) INVISIBLE,\
                    INDEX`fk_strategies_users_idx`(`user_id` ASC) VISIBLE,\
                    CONSTRAINT`fk_strategies_users`\
                    FOREIGN KEY(`user_id`)\
                    REFERENCES`backtest`.`users`(`id`)\
                    ON DELETE CASCADE\
                    ON UPDATE CASCADE\
                )\
                ENGINE = InnoDB\
                AUTO_INCREMENT = 27\
                DEFAULT CHARACTER SET = utf8;',
            ]
            // var sqls = [
            //     "CREATE DATABASE if not exists " + dbConfig.database + " ; ",
            //     "use " + dbConfig.database + " ; ",
            //     "CREATE TABLE if not exists users (\
            //         user_id INT AUTO_INCREMENT, \
            //         username VARCHAR(255), \
            //         password VARCHAR(255), \
            //         signup_date TIMESTAMP, \
            //         PRIMARY KEY (user_id), \
            //         UNIQUE KEY username (username) \
            //         );",
            //     "CREATE TABLE if not exists watch_lists (\
            //         watch_list_id INT AUTO_INCREMENT, \
            //         user_id INT, \
            //         create_date DATE, \
            //         name VARCHAR(255), \
            //         PRIMARY KEY (watch_list_id), \
            //         CONSTRAINT user_fk1 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE \
            //         );",
            //     "CREATE TABLE if not exists stocks (\
            //         stock_id INT AUTO_INCREMENT,  \
            //         name VARCHAR(255), \
            //         symbol VARCHAR(255), \
            //         PRIMARY KEY (stock_id), \
            //         UNIQUE KEY name (name) \
            //         );",
            //     "CREATE TABLE if not exists watch_list_items (\
            //         watch_list_item_id INT AUTO_INCREMENT, \
            //         stock_id INT, \
            //         watch_list_id INT, \
            //         PRIMARY KEY (watch_list_item_id), \
            //         CONSTRAINT stock_fk1 FOREIGN KEY (stock_id) REFERENCES stocks (stock_id) ON DELETE SET NULL ON UPDATE CASCADE, \
            //         CONSTRAINT watch_list_fk1 FOREIGN KEY (watch_list_id) REFERENCES watch_lists (watch_list_id) ON DELETE SET NULL ON UPDATE CASCADE \
            //         );",
            //     "CREATE TABLE if not exists transactions (\
            //         transaction_id INT AUTO_INCREMENT, \
            //         stock_id INT, \
            //         user_id INT, \
            //         date DATE, \
            //         hand INT, \
            //         price FLOAT, \
            //         PRIMARY KEY (transaction_id), \
            //         CONSTRAINT user_fk2 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE, \
            //         CONSTRAINT stock_fk2 FOREIGN KEY (stock_id) REFERENCES stocks (stock_id) ON DELETE SET NULL ON UPDATE CASCADE \
            //         );",
            //     "CREATE TABLE if not exists strategies (\
            //         strategy_id INT AUTO_INCREMENT, \
            //         strategy JSON, \
            //         user_id INT, \
            //         PRIMARY KEY (strategy_id), \
            //         CONSTRAINT user_fk3 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE \
            //         );"
            // ]
            for (const sql of sqls) {
                connection.query(sql, (err, results, fields) => {
                    if (err) {
                        console.log("Initializing Operation Failed:", sql)
                        reject(err);
                    }
                    resolve({
                        results,
                        fields
                    })
                })
            }
        })
    }
}
