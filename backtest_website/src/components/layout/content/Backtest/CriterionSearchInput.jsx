import { Button, Form, Input, Select, Tag } from 'antd';
import qs from 'qs';
import React, { useEffect, useRef, useState } from 'react';
import criterionService from '../../../../services/criterionService';
const { Option } = Select;
const { CheckableTag } = Tag;

export default function CriterionSearchInput(props) {
    const userId = localStorage.getItem('userId')
    const {formRef, } = props


    const tagRender = (props) => {
        const { label, value, closable, onClose } = props;

        const onPreventMouseDown = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };

        return (
            <Tag
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{
                    marginRight: 3,
                }}
            >
                {label}
            </Tag>
        );
    };


    let timeout;
    let currentValue;
    const fetch = (value, callback) => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        currentValue = value;

        const fake = () => {
            criterionService.suggestAllWithName(userId, value).then(
                res => {
                    if (currentValue === value) {
                        const { results, err_code, } = res;
                        const data = results.map((item) => ({
                            value: item.name,
                            text: item.name,
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

    useEffect(() => {
        criterionService.suggestAllWithName(userId, '').then(
            res => {
                const { results, err_code, } = res;
                const data = results.map((item) => ({
                    value: item.name,
                    text: item.name,
                }));
                setData(data)
            },
            err => {
            }
        )
    }, [])

    const [data, setData] = useState([]);
    const [value, setValue] = useState(); // 点击选择的内容，不是输入框的内容

    const handleSearch = (newValue) => {
        fetch(newValue, setData);
    };

    const handleChange = (newValue) => { // 输入框改变不会触发，点击选择才会触发
        setValue(newValue);
    };

    const options = data.map((d) => <Option key={d.value}>{d.text}</Option>);

    return (
        <div>
            <Form.Item label='Selected Criterion' name={props.name}
                className='criteria-selector'
                rules={[
                    {
                      required: true,
                    },
                ]}
            >
                <Select
                    mode='multiple'
                    tagRender={tagRender}
                    showSearch
                    placeholder={props.placeholder}
                    style={props.style}
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

