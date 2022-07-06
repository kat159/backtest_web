import React, { useEffect, useState } from 'react'
import PubSub from 'pubsub-js';

export default function InitialSelection() {

    // Idle, Selected, Completed , (Completed好像不需要，因为选完改变BuilderSelection状态，这个组件就消失了)
    const [currentState, setCurrentState] = useState('Selected'); 

    useEffect(() => {
        let token1 = '';
        if(currentState === 'Selected') {
            token1 = PubSub.subscribe('criteria_item_clicked', (msg, data) => {
                const {itemName, itemRules} = data;

            })
        } else {
            PubSub.unsubscribe(token1);
        }

        const token2 = PubSub.subscribe('selection_clicked', (msg, data) => {

        })

        return () => {
            PubSub.unsubscribe(token1);
        }
    })

    const onClick = () => {

    }

    return (
        <div onClick={onClick} style={
            {
                height: '20px',
                width: '40px',
                backgroundColor: 'white',
                borderColor: currentState === 'Selected' ? '#6f68ed' : 'gray',
                borderWidth: currentState === 'Selected' ? '3px' : '1px',
                borderStyle: 'solid',
            }
        }/>
    )
}
