import { Button, message, Space, Popconfirm } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React from 'react'
import { useState } from 'react'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import backtestService from '../../../../services/backtestService'
import criterionService from '../../../../services/criterionService'
import strategyService from '../../../../services/strategyService'
import StrategeyBuilder from '../../../strategy_builder/StrategeyBuilder'
import BacktestReport from '../../popup/BacktestReport/BacktestReport'
import DraggablePoppup from '../../popup/DraggablePoppup'
import StrategySearchSelector from './StrategySearchSelector'

export default function Backtest() {
  const formRef = useRef(null)
  const [form] = useForm()
  const dateFormat = 'YYYY/MM/DD';
  const userId = localStorage.getItem('userId')
  const [displayingReport, setDisplayingReport] = useState(false)
  const [testReport, setTestReport] = useState(undefined)
  const [curStrategyId, setCurStrategyId] = useState(undefined);
  const handleSave = () => {
    form.validateFields().then(
      values => {
        strategyService.addStrategy(values).then(
          res => {
            const result = res.data
            if (result.err_code === 0) {
              message.success('Strategy Saved');
              setCurStrategyId(result.results.insertId);
            } else if (result.message === 'Strategy Name Exists') {
              form.setFields([
                {
                  name: 'strategyName',
                  errors: ['Strategy Name Exists']
                }
              ])
            } else {
              message.error('Unexpected error happened, add operation failed');
            }
          }
        )
      },
      err => {

      }
    )
  }
  const formDataToBackendFormat = async (values) => {
    const userId = localStorage.getItem('userId');
    const parseCriteria = async (criteriaIdList, criterionLogic) => {
      const criterionStrList = []
      for (const criterionName of criteriaIdList) {
        const res = await criterionService.getCriterionWithName(userId, criterionName)
        criterionStrList.push(res.criterion_str);
      }
      return criterionStrList.join(' ' + criterionLogic + ' ')
    }
    let { closeCriteriaIdList, closeCriteriaLogic, openCriteriaIdList, openCriteriaLogic,
      bidAskSpread, capital, capitalAtRisk, holdingDays, positionType, timePeriod, commission } = values
    const openCriterionStr = (await parseCriteria(openCriteriaIdList, openCriteriaLogic)).replaceAll('and', '&').replaceAll('or', '|')
    const closeCriterionStr = (await parseCriteria(closeCriteriaIdList, closeCriteriaLogic)).replaceAll('and', '&').replaceAll('or', '|')
    timePeriod = timePeriod.map(m => m.format(dateFormat))
    const data = {
      userId: userId,
      positionType: positionType,
      openCriterionStr: openCriterionStr,
      closeCriterionStr: closeCriterionStr,
      holdingDays: holdingDays,
      testParams: {
        capital: capital,
        capitalAtRisk: capitalAtRisk,
        commission: commission,
        bidAskSpread: bidAskSpread,
        timePeriod: timePeriod
      }
    }
    return data
  }
  const handleRunTest = async () => {
    try {
      const values = await form.validateFields()
      setDisplayingReport(true)
      const res = await backtestService.runTestWithFormData(values);
      setTestReport({...res.data, strategy: values})
    } catch(err) {

    }
    
  }

  const handleReset = (e) => {
    form.resetFields();
  }
  const nav = useNavigate();
  const handleUseExistingStrategy = () => {
    nav('/my_strategies',{replace: true});
  }
  const sampleStrategy = {
    timePeriod: [moment('2010/01/01', dateFormat), moment('2020/01/01', dateFormat)],
    positionType: 'Long',
    holdingDays: 1,
    capital: 10000,
    capitalAtRisk: 5,
    commission: 0.08,
    bidAskSpread: 0.02,
    openCriteriaLogic: 'and',
    closeCriteriaLogic: 'and',
  }
  return (
    <div >
      {
        testReport ? <BacktestReport 
        strategy={form.getFieldsValue(true)} 
        strategyId={curStrategyId} 
        testReport={testReport} 
        setTestReport={setTestReport} 
        setDisplayingReport={setDisplayingReport} 
        visible={displayingReport} 
      /> : 
      <div className='backtest-builder-whole-page'
      >
        <Space>
          <Popconfirm
            title='Current values will be overrided' 
            onConfirm={()=>{form.setFieldsValue(sampleStrategy)}}
          >
            <Button type='dashed' >Use Sample Strategy</Button>
          </Popconfirm>
          <Popconfirm 
            title='Redirect to My Strategy page' 
            onConfirm={handleUseExistingStrategy}
          >
            <Button type='dashed' >Use Existing Strategy</Button>
          </Popconfirm>
        </Space>
        <StrategeyBuilder formRef={formRef} form={form} />
        <Space className='button-group-bottem' size={'large'} >
          <Button type='link' onClick={handleReset}>Reset</Button>
          <Button onClick={handleSave} >Save</Button>
          <Button onClick={handleRunTest} >Run Test</Button>
        </Space>
    </div>
    }
      
    </div>
  )
}


// import { Button, Form, Input, Select, Space, Tooltip, Typography } from 'antd';
// import React, { useRef, useState } from 'react';
// import './Backtest.css'
// import BacktestParams from './BacktestParams';
// import PositionClose from './PositionClose';
// import PositionOpen from './PositionOpen';
// import moment from 'moment';
// import criterionService from '../../../../services/criterionService';
// import backtestService from '../../../../services/backtestService';
// import BacktestReport from '../../popup/BacktestReport/BacktestReport';
// import strategyService from '../../../../services/strategyService';
// import { useForm } from 'antd/lib/form/Form';
// import { useEffect } from 'react';

// const { Option } = Select;
// const dateFormat = 'YYYY/MM/DD';

// export default function Backtest(props) {
//   const userId = localStorage.getItem('userId')
//   const [displayingReport, setDisplayingReport] = useState(false)
//   const [testReport, setTestReport] = useState(undefined)

//   const formDataToBackendFormat = async (values) => {
//     const parseCriteria = async (criteriaIdList, criterionLogic) => {
//       const criterionStrList = []
//       for (const criterionName of criteriaIdList) {
//         const res = await criterionService.getCriterionWithName(userId, criterionName)
//         criterionStrList.push(res.criterion_str);
//       }
//       return criterionStrList.join(' ' + criterionLogic + ' ')
//     }
//     let { closeCriteriaIdList, closeCriteriaLogic, openCriteriaIdList, openCriteriaLogic,
//       bidAskSpread, capital, capitalAtRisk, holdingDays, positionType, timePeriod, commission } = values
//     const openCriterionStr = (await parseCriteria(openCriteriaIdList, openCriteriaLogic)).replaceAll('and', '&').replaceAll('or', '|')
//     const closeCriterionStr = (await parseCriteria(closeCriteriaIdList, closeCriteriaLogic)).replaceAll('and', '&').replaceAll('or', '|')
//     timePeriod = timePeriod.map(m => m.format(dateFormat))
//     const data = {
//       userId: userId,
//       positionType: positionType,
//       openCriterionStr: openCriterionStr,
//       closeCriterionStr: closeCriterionStr,
//       holdingDays: holdingDays,
//       testParams: {
//         capital: capital,
//         capitalAtRisk: capitalAtRisk,
//         commission: commission,
//         bidAskSpread: bidAskSpread,
//         timePeriod: timePeriod
//       }
//     }
//     return data
//   }

//   const onFinish = async (values) => {
//     setDisplayingReport(true)
//     console.log('Received values of form: ', values);
//     const data = await formDataToBackendFormat(values)
//     const res = await backtestService.runTest(data)
//     setTestReport(res.data)
//     console.log(res.data)
//   };

//   const onSaveClick = () => {
//     console.log(userId, 1111111)
//     form.validateFields().then(
//       values => {
//         strategyService.addStrategy(values).then(
//           res => {
//             console.log(res)
//           }
//         )
//       },
//       err => {

//       }
//     )
//   }

//   useEffect(() => {
//     const {strategyEditing, } = props
//     if (strategyEditing) {
//       form.setFieldsValue(strategyEditing);
//     }
//   }, [])

//   const formRef = useRef(null)
//   const [form] = useForm()
//   return (
//     <div>
//       <BacktestReport testReport={testReport} setTestReport={setTestReport} setDisplayingReport={setDisplayingReport} visible={displayingReport} />
//       <Form
//         form={form}
//         ref={formRef}
//         className='backtest-strategy-form'
//         name="complex-form"
//         onFinish={onFinish}
//         labelCol={{
//           span: 8,
//         }}
//         wrapperCol={{
//           span: 16,
//         }}
//         initialValues={
//           {
//             timePeriod: [moment('2010/01/01', dateFormat), moment('2020/01/01', dateFormat)],
//             positionType: 'Long',
//             holdingDays: 1,
//             capital: 10000,
//             capitalAtRisk: 5,
//             commission: 0.08,
//             bidAskSpread: 0.02,
//             openCriteriaLogic: 'and',
//             closeCriteriaLogic: 'and',
//           }
//         }
//       >
//         <BacktestParams dateFormat={dateFormat} />
//         <PositionOpen formRef={formRef} />
//         <PositionClose formRef={formRef} />

//         <Form.Item label=" " colon={false}>
//           <Button type="primary" htmlType="submit">
//             Submit
//           </Button>
//           <Button onClick={onSaveClick} type="primary" >Save</Button>
//         </Form.Item>
        
//       </Form>
//     </div>

//   );
// }
