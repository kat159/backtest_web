import { Button, Form, Input, Select, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import criterionService from '../../services/criterionService';

const { Option } = Select;
const { CheckableTag } = Tag;

export default function CriterionSearchSelector(props) {
    const userId = localStorage.getItem('userId')
    const {handleSelect, } = props

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
            criterionService.suggestAllWithName(userId, value).then(
                res => {
                    if (currentValue === value) {
                        const { results, err_code, } = res;
                        const data = results.map((item) => ({
                            value: item.name,
                            text: item.name,
                            criterionStr: item.criterion_str,
                            criterionId: item.id,
                            criterionName: item.name,
                            nestedCriterion: item.criterion_arr
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
        // console.log(newValue)
        handleSelect(newValue)
        setValue(newValue);             // antd Form的value不会随这个value改变，只能通过useForm().setFieldsValue改变
    };

    const options = data.map((d) =>
        <Option value={d.criterionId} title={d.criterionStr} key={d.value}>
            {d.text}
        </Option>
    );
    
    return (
        <div>
            <Form.Item 
                style={{
                    maxWidth: '200px',
                    width: '30%',
                    height: '15px',
                }}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Select
                    style={{
                        height: '30px',
                        ...props.style
                    }}
                    onClick={() => {fetch('', setData)}}
                    showSearch
                    placeholder={'get existing criterion'}
                    showArrow
                    defaultActiveFirstOption={false}
                    filterOption={false}
                    onSearch={handleSearch}
                    onChange={handleChange}
                    notFoundContent={null}
                >
                    {options}
                </Select>
            </Form.Item>
        </div>
    );
};

