import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import userService from '../../../services/userService'

export default function LoginStatus() {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username')
    const nav = useNavigate()

    const logout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        nav('/', {replace: true})
    }
    
    

  return (
    <div>
        <span style={{paddingRight: '10px'}}>{username}</span>
        <a onClick={logout} >logout</a>
    </div>
    
  )
}
