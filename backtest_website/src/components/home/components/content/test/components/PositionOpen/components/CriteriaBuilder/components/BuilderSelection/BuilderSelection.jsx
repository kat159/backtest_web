import { nanoid } from 'nanoid';
import PubSub from 'pubsub-js';
import React, { useState, useEffect } from 'react'

export default function BuilderSelection(props) {
    
    // [leadingText, paramTypes, joinChar, returnValueType:['Bool', 'Number', 'indexDependingOn'], params]
    const {has_text, cur_route} = props;

    // Idle, Selected, Completed , (Completed好像不需要，因为选完改变BuilderSelection状态，这个组件就消失了)
    const [currentState, setCurrentState] = useState('Idle');

    useEffect(() => {
        
    })

    const onClick = () => {
        PubSub.publish('criteria-selector-clicked', {cur_route: cur_route});
    }

    return (
        <div key={nanoid()} style={
            {
                // borderStyle: 'solid',
                width: 'fit-content',
                display: 'inline-block',
                float: 'left',
            }
        }>
            {
                has_text === "true" ? 
                    <div {...props} onClick={onClick} style={
                        {   
                            width: 'fit-content',
                            float: 'left',
                        }
                    }>
                    </div> :
                    <div {...props} onClick={onClick} style={
                        {
                            height: '20px',
                            width: '40px',
                            backgroundColor: 'white',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                        }
                    }>
                    </div>
            }
            
        </div>
        
    )
}
