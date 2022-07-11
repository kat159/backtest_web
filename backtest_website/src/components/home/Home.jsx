import React, { Component } from 'react'
import ChartDemo from './ChartDemo'
import Content from './components/content/Content'
import NavHeader from './components/nav_tab/NavHeader'

export default class Home extends Component {
    
    render() {
        return (
            <div onClick={this.onClick} >
                <NavHeader />
                <Content />
                {/* <ChartDemo /> */}
            </div>
        )
    }
}
