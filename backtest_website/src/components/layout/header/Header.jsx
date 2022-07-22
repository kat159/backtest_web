import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginStatus from './LoginStatus'
import NavHeader from './NavHeader'

export default function Header() {
  return (
    <div>
      <div style={{
        width: '80%',
        float: 'left'
      }}>
        <NavHeader />
      </div>
      <div style={{
        padding: '20px'
      }}>
        <LoginStatus />
      </div>
    </div>
    
  )
}
