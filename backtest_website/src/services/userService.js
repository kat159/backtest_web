import axios from "axios";
import { SERVER_IP } from '../config/config';

const baseURL = SERVER_IP + '/server';


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