import React, { Component } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import faker from 'faker';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Capital Flow Chart',
        },
    },
};


export default class CapitalChart extends Component {
    render() {
        const labels = this.props.date;
        const data = {
            labels,
            datasets: [
                {
                    label: 'Capital',
                    data: this.props.capitalFlow,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                }
            ]
        }
        return (
            <div>
                <Line options={options} data={data} />;
            </div>
        )
    }
}