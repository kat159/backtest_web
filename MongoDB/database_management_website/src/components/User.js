import React from 'react';
import { MdDeleteForever, MdEdit } from 'react-icons/md';

function User({ user, onDelete, onEdit }) {
    return (
        <tr>
            <td>{user.username}</td>
            <td>{user.password}</td>
            <td>{user.strategies}</td>
            <td><MdEdit onClick={() => onEdit(user)} /></td>
            <td><MdDeleteForever onClick={() => onDelete(user._id)} /></td>
        </tr>
    );
}

export default User;