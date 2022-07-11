import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

export default class MyNavLink extends Component {
    render() {
        console.log('Navlind:', this.props)
        return (
            <NavLink {...this.props}></NavLink>
        )
    }
}
