import PubSub from 'pubsub-js';
import React, { useEffect } from 'react'

export default function Item(props) {


    const {colNum, itemsSelected, setItemsSelected, item, functionRules, setItemClicked, onItemClicked} = props;
    const abbrName = item[0],
        description = item[1];

    const onClick = () => {
        const tmp = itemsSelected.slice(0, colNum);
        tmp.push(abbrName);
        setItemsSelected(tmp);
        if(functionRules[abbrName] !== undefined) {
            setItemClicked(abbrName);
            onItemClicked();
            // PubSub.publish('criteria_item_clicked', {name: abbrName});
        }
    }

    return (
        <div onClick={onClick} > {abbrName}</div>
    )
}
