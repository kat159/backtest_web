import axios from "axios";

const baseURL = 'http://127.0.0.1:3000/server';


class UserService {
    async login(userData) {
        return await axios({
            method: 'post',
            url: baseURL + '/users/login',
            data: userData
        })
    }

    async signup(userData) { 
        return await axios({
            method: 'post',
            url: baseURL + '/users/signup', 
            data: userData
        })
    }

    async getUserById(id) {
        return await axios({
            method: 'get',
            url: baseURL + '/users/' + id, 
        })
    }
}

export default new UserService();