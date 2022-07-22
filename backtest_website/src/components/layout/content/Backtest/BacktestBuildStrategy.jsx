import { Button, message, Space } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React from 'react'
import { useState } from 'react'
import { useRef } from 'react'
import backtestService from '../../../../services/backtestService'
import criterionService from '../../../../services/criterionService'
import strategyService from '../../../../services/strategyService'
import StrategeyBuilder from '../../../strategy_builder/StrategeyBuilder'
import BacktestReport from '../../popup/BacktestReport/BacktestReport'
import StrategySearchSelector from './StrategySearchSelector'

export default function BacktestBuildStrategy() {
  const formRef = useRef(null)
  const [form] = useForm()
  const dateFormat = 'YYYY/MM/DD';
  const userId = localStorage.getItem('userId')
  const [displayingReport, setDisplayingReport] = useState(false)
  const [testReport, setTestReport] = useState(undefined)

  const handleSave = () => {
    form.validateFields().then(
      values => {
        console.log(values)
        strategyService.addStrategy(values).then(
          res => {
            const result = res.data
            console.log(result)
            if (result.err_code === 0) {
              message.success('Strategy Saved');
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
    const values = await form.validateFields()
    setDisplayingReport(true)
    const res = await backtestService.runTestWithFormData(values);
    setTestReport({...res.data, strategy: values})
    console.log(res.data)
  }

  const handleReset = (e) => {
    console.log(e.target)
    form.resetFields();
  }

  

  return (
    <div className='backtest-builder-whole-page'>
      {testReport && <BacktestReport testReport={testReport} setTestReport={setTestReport} setDisplayingReport={setDisplayingReport} visible={displayingReport} />}
      <StrategeyBuilder formRef={formRef} form={form} />
      <Space className='button-group-bottem' size={'large'} >
        <Button type='link' onClick={handleReset}>Reset</Button>
        <Button onClick={handleSave} >Save</Button>
        <Button onClick={handleRunTest} >Run Test</Button>
      </Space>
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
