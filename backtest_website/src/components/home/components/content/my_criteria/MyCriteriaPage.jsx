import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PubSub from 'pubsub-js';
import CriterionRow from './CriterionRow';
import { nanoid } from 'nanoid';
import CreateCriterionButton from './CreateCriterionButton';

export default function MyCriteriaPage(props) {

  const {userId} = useParams();

  const [criteriaList, setCriteriaList] = useState(undefined);

  useEffect(() => {
    retrieveAndSetCriteriaList();
  }, [])

  const retrieveAndSetCriteriaList = () => {
    console.log('MyCriteriaPage: userId =', userId);
    if (userId !== '-1') {
      axios.defaults.baseURL = 'http://127.0.0.1:3000';
      axios({
          method: 'get',
          url: '/criteria/',
          params: {
            userId: userId
          },
          headers: {
              'Content-Type': 'application/json',
          },
      }).then(
          res => {
            const {err_code, results, } = res.data
            if (err_code === 0) {
              setCriteriaList(results);
              console.log('MyCriteriaPage receive request results:', results)
            } else {
              console.log('MyCriteriaPage receive request error:', err_code)
            }
            
          },
          err => {console.log(err)}
      )
    }
  }

  return (
    <div>
    {
      userId === '-1' ? <div>Please sign in</div>:
      criteriaList === undefined ? <div>retrieving data...</div>:
      <div>
        <CreateCriterionButton retrieveAndSetCriteriaList={retrieveAndSetCriteriaList} userId={userId} />
        <table>
          <thead>
            <tr >
              <td style={{padding: '5px'}}>Name</td>
              <td style={{padding: '5px'}}>Function</td>
              <td style={{padding: '5px'}}>Action</td>
            </tr>
          </thead>
          <tbody>
            {
              criteriaList.map((criterion) => {
                criterion.criterion_arr = JSON.parse(criterion.criterion_arr)
                return <CriterionRow retrieveAndSetCriteriaList={retrieveAndSetCriteriaList} criterion={criterion} key={nanoid()} />
              })
            }
          </tbody>
        </table>
      </div>
        
    }
    </div>
  )
}
