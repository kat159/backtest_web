import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

export const AddUserPage = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [strategies, setStrategies] = useState('');

    const history = useHistory();

    const addUser = async () => {
        const newUser = { username, password, strategies };
        const response = await fetch('/users', {
            method: 'POST',
            body: JSON.stringify(newUser),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status === 201) {
            alert("Successfully added the user");
        } else {
            alert(`Failed to add user, status code = ${response.status}`);
        }
        history.push("/");
    };

    return (
        <div>
            <h1>Add User</h1>
            <input
                type="text"
                placeholder="Enter username here"
                value={username}
                onChange={e => setUsername(e.target.value)} />
            <input
                type="text"
                placeholder="Enter password here"
                value={password}
                onChange={e => setPassword(e.target.value)} />
            <input
                type="text"
                placeholder="Enter strategies here"
                value={strategies}
                onChange={e => setStrategies(e.target.value)} />
            <button
                onClick={addUser}
            >Add</button>
        </div>
    );
}

export default AddUserPage;