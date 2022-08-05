import { Button, Form, Input, Select, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import strategyService from '../../../../services/strategyService';
const { Option } = Select;

export default function StrategySearchSelector(props) {
    const userId = localStorage.getItem('userId')

    let timeout;
    let currentValue;
    const fetch = (value, callback) => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        currentValue = value; // **注意，这里不会改变外面的currentValue值，只会在内部保存这个值，在整个函数完成后，currentValue值会消失
        // (不是js的特性，js会改变，但是因为react每次callback()改变状态后，currentValue又重置了？)

        const fake = () => {
            strategyService.suggestAllWithName(userId, value).then(
                res => {
                    if (currentValue === value) {
                        const { results, err_code, } = res;
                        const data = results.map((item) => ({
                            text: item.name,
                            id: item.id,
                            name: item.name,
                            description: item.description
                        }));
                        callback(data);
                    }
                },
                err => {
                }
            )
        };
        timeout = setTimeout(fake, 300);
    };

    const [data, setData] = useState([]); // 搜索出来的选项
    const [value, setValue] = useState(); // 点击选择的内容，不是输入框的内容
    
    useEffect(()=>{
        fetch('', setData);
    }, [])

    const handleSearch = (newValue) => { //input搜索的text内容变化的时候
        fetch(newValue, setData);
    };

    const handleChange = (newValue) => { // 输入框改变不会触发，点击选择才会触发
        setValue(newValue);             // antd Form的value不会随这个value改变，只能通过useForm().setFieldsValue改变
    };

    const options = data.map((d) =>
        <Option value={d.id} title={d.description} key={d.id}>
            {d.text}
        </Option>
    );
    

    return (
        <div><span style={{fontSize: '15px'}}>Use existing strategy: &nbsp;</span>
            <Select
                onClick={() => {fetch('', setData)}}
                showSearch
                placeholder={'Select Strategy'}
                showArrow
                style={props.style}
                defaultActiveFirstOption={false}
                filterOption={false}
                onSearch={handleSearch}
                onChange={handleChange}
                notFoundContent={null}
            >
                {options}
            </Select>
        </div>


    );
};

