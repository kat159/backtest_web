import React from 'react';
import { Link } from 'react-router-dom';
import UserList from '../components/UserList';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function HomePage({ setUserToEdit }) {

    const [users, setUsers] = useState([]);
    const history = useHistory();

    const onDelete = async _id => {
        const response = await fetch(`/users/${_id}`, { method: 'DELETE' });
        if (response.status === 204) {
            setUsers(users.filter(m => m._id !== _id));
        } else {
            console.error(`Failed to delete user with _id = ${_id}, status code = ${response.status}`);
        }
    };

    const onEdit = user => {
        setUserToEdit(user);
        history.push("/edit-user");
    }

    const loadUsers = async () => {
        const response = await fetch('/users');
        const data = await response.json();
        setUsers(data);
    }

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <>
            <h2>List of Users</h2>
            <UserList users={users} onDelete={onDelete} onEdit={onEdit}></UserList>
            <Link to="/add-user">Add a user</Link>
        </>
    );
}

export default HomePage;