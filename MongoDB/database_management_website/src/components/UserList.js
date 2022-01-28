import React from 'react';
import User from './User';

function UserList({ users, onDelete, onEdit }) {
    return (
        <table id="users">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Strategies</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user, i) => <User user={user}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    key={i} />)}
            </tbody>
        </table>
    );
}

export default UserList;
