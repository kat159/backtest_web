const express = require('express');
const router = express.Router();
const { getUsers, getUserById, addUser, updateUserById, updateUserByUsername, deleteUserById } = require('../service/userService');

/* GET users listing. */
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', addUser);
router.put('/:id', updateUserById);
router.put('/', updateUserByUsername);
router.delete('/:id', deleteUserById);

module.exports = router; 
 