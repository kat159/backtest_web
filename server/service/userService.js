const usersModel = require('../model/usersModel');
const moment = require('moment');
const { user } = require('../config/db.config');


class UserService {
    constructor() {

    }
    async getUsers(req, res, next) {
        const username = req.query.username;
        if (username !== undefined) {
            // get specific user by username
            const { results } = await usersModel.findByUsername(username);
            if (results.length === 0) res.json({ message: 'user not found', err_code: 1, results: [] });
            else res.json({ results: results, err_code: 0 });
        } else {
            // get all users
            const { results } = await usersModel.findAll();
            res.json({ results: results, err_code: 0 });

            //**不会阻塞，如果是同步代码才会阻塞
            /*
            setTimeout(
                async () => {
                    const { results } = await usersModel.findAll();
                    res.json({ results: results, err_code: 0 });
                },
                10000
            )
            */
        }
    }

    async getUserById(req, res, next) {
        const id = req.params.id;
        const { results } = await usersModel.findById(id);
        if (results.length === 0) res.json({ message: 'user not found', err_code: 1, results: [] });
        else res.json({ results: results, err_code: 0 });
    }

    async addUser(req, res, next) {
        const { body } = req;
        console.log(body);

        const { results } = await usersModel.findByUsername(body.username);

        if (results.length !== 0) {
            res.json({ message: 'username exists', err_code: 1 });
        } else {
            body.signup_date = moment().format();
            const { results } = await usersModel.create(body);
            console.log(results);
            res.json({ message: 'Succesfully add user', err_code: 0 });
        }

    }

    async updateUserByUsername(req, res, next) {
        // update password, won't change username
        const { body } = req;
        const { results } = await usersModel.findByUsername(body.username);
        const result = results[0];
        if (results.length === 0) {
            res.json({ message: 'username not found' });
        } else {
            const { results } = await usersModel.updateById(body, result.user_id);
            res.json({ message: 'successfully update user' });
        }

    }

    async updateUserById(req, res, next) {
        const { body } = req;
        const { id } = req.params;
        const { results } = await usersModel.findByUsername(body.username);
        if (results.length !== 0 && results[0].user_id != id) {
            res.json({ message: 'username exists' });
        } else {
            const { results } = await usersModel.updateById(body, id);
            if (results.affectedRows !== 1) res.json({ message: 'user_id not found' });
            else res.json({ message: 'successfully update user' });
        }
    }

    async deleteUserById(req, res, next) {
        const { id } = req.params;
        const { results } = await usersModel.deleteById(id);
        if (results.affectedRows !== 1) return res.json({ message: 'Delete failed' });
        else res.json({ message: 'Successfully delete user' });
    }

    async handleUserLogin(req, res, next) {
        const {username, password, } = req.body;
        let {results, } = await usersModel.findByUsername(username);
        console.log(results);
        if (results.length === 0) {
            res.json({message: 'username not exists', err_code: 1});
        } else if (results[0].password !== password) {
            res.json({message: 'incorrect password', err_code: 1});
        } else {
            const {id, } = results[0]
            res.json({ message: 'Succesfully log in', err_code: 0, user_id: id, username: username});
        }
    }

    async handleUserSignUp(req, res, next) {
        const {username, password, } = req.body;
        console.log(req.body)
        let {results, } = await usersModel.findByUsername(username);
        if (results.length === 0) {
            const { results } = await usersModel.create(req.body);
            console.log(results);
            res.json({ message: 'Succesfully add user', err_code: 0 });
        } else {
            res.json({message: 'username exists', err_code: 1})
        }
    }
}

module.exports = new UserService();