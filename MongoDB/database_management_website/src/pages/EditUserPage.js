import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

export const EditUserPage = ({ userToEdit }) => {

    const [username, setUsername] = useState(userToEdit.username);
    const [password, setPassword] = useState(userToEdit.password);
    const [strategies, setStrategies] = useState(userToEdit.strategies);

    const history = useHistory();

    const editUser = async () => {
        const editedUser = { username, password, strategies };
        const response = await fetch(`/users/${userToEdit._id}`, {
            method: 'PUT',
            body: JSON.stringify(editedUser),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status === 200) {
            alert("Successfully edited the user");
        } else {
            alert(`Failed to edit user, status code = ${response.status}`);
        }
        history.push("/");
    };

    return (
        <div>
            <h1>Edit User</h1>
            <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)} />
            <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)} />
            <input
                type="text"
                value={strategies}
                onChange={e => setStrategies(e.target.value)} />
            <button
                onClick={editUser}
            >Save</button>
        </div>
    );
}

export default EditUserPage;