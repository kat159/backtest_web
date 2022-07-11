import React, { useEffect } from 'react'

export default function MyStrategiesPage(props) {

    const { userId, } = props

    useEffect(() => {
        console.log(props)
        console.log(userId);
    })

    return (
        <div>MyStrategiesPage</div>
    )
}
