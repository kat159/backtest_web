
import PubSub from 'pubsub-js';
import React, { useEffect } from 'react'
import ItemList from '../../ItemList';
import './item.css'

export default function Item(props) {


    const {colNum, itemsSelected, setItemsSelected, item, functionRules, setItemClicked, onItemClicked} = props;
    const abbrName = item[0],
        description = item[1];

    const onClick = async () => {
        const tmp = itemsSelected.slice(0, colNum);
        tmp.push(abbrName);
        setItemsSelected(tmp);
        if(functionRules[abbrName] !== undefined) {
            onItemClicked(abbrName);
            // PubSub.publish('criteria_item_clicked', {name: abbrName});
        }
    }

    return (
        
            <div className='criteria-item' onClick={onClick} style={{
                backgroundColor: !functionRules[abbrName] && itemsSelected[colNum] === abbrName ? '#6578b5' : 'white',
                color: !functionRules[abbrName] && itemsSelected[colNum] === abbrName ? 'white' : 'black',
                fontSize: !functionRules[abbrName] && itemsSelected[colNum] === abbrName ? '16px' : '',
                width: '200px',
                height: '30px',
                textIndent: '20px',
                lineHeight: '30px',
                borderStyle: 'solid',
                borderColor: '#a1a1a1',
                borderWidth: '1px',
                marginTop: '-1px',
                marginLeft: '-1px'
            }}> 
                <b>{abbrName}</b>
            </div>
        
    )
}
