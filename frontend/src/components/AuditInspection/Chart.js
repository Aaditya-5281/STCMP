import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import Select from 'react-select';
import "./Chart.css";

const Chart = () => {
    const [trainings, setTrainings] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [singleChartData, setSingleChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');
    const [selectedTraining, setSelectedTraining] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/trainings-api/trainings')
            .then(response => {
                const data = response.data.payload;
                setTrainings(data);
                prepareChartData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching trainings:", error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        prepareChartData(trainings);
    }, [startYear, endYear, trainings]);

    useEffect(() => {
        if (selectedTraining) {
            prepareSingleChartData(selectedTraining);
        }
    }, [selectedTraining]);

    const prepareChartData = (trainings) => {
        const filteredTrainings = trainings.filter(training => {
            const year = training.startYear;
            return (!startYear || year >= startYear) && (!endYear || year <= endYear);
        });

        const yearData = {};

        filteredTrainings.forEach(training => {
            const { startYear, totalStudents, trainingName } = training;

            if (!yearData[startYear]) {
                yearData[startYear] = {};
            }

            yearData[startYear][trainingName] = (yearData[startYear][trainingName] || 0) + totalStudents;
        });

        const labels = Object.keys(yearData).sort();
        const trainingNames = [...new Set(filteredTrainings.map(t => t.trainingName))];
        const datasets = trainingNames.map(trainingName => ({
            label: trainingName,
            data: labels.map(year => yearData[year][trainingName] || 0),
            backgroundColor: getRandomColor(),
        }));

        setChartData({
            labels,
            datasets
        });
    };

    const prepareSingleChartData = (trainingName) => {
        const filteredTrainings = trainings.filter(training => {
            return training.trainingName === trainingName;
        });

        const yearData = {};

        filteredTrainings.forEach(training => {
            const { startYear, totalStudents } = training;

            if (!yearData[startYear]) {
                yearData[startYear] = 0;
            }

            yearData[startYear] += totalStudents;
        });

        const labels = Object.keys(yearData).sort();
        const data = labels.map(year => yearData[year]);

        setSingleChartData({
            labels,
            datasets: [
                {
                    label: trainingName,
                    data,
                    backgroundColor: getRandomColor(),
                }
            ]
        });
    };

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const trainingOptions = [...new Set(trainings.map(t => t.trainingName))].map(trainingName => ({
        value: trainingName,
        label: trainingName
    }));

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!chartData) {
        return <div>No data available</div>;
    }

    return (
        <div className='chart'>
            <h2>Multiple Trainings Summary</h2>
            <form className='p-3'>
                <label className='form-group'>
                    Start Year:
                    <input 
                        className="form-control"
                        type="number" 
                        value={startYear} 
                        onChange={(e) => setStartYear(e.target.value)} 
                        placeholder="Enter Start Year"
                    />
                </label>
                <label className='form-group mx-5'>
                    End Year:
                    <input 
                        className="form-control"
                        type="number" 
                        value={endYear} 
                        onChange={(e) => setEndYear(e.target.value)} 
                        placeholder="Enter End Year"
                    />
                </label>
            </form>
            <Bar 
                data={chartData} 
                options={{ 
                    responsive: true, 
                    plugins: { 
                        legend: { position: 'top' } 
                    },
                    scales: {
                        x: { 
                            stacked: true 
                        },
                        y: { 
                            stacked: true 
                        }
                    }
                }} 
            />
            <h2 className='text-dark'>Single Training Summary</h2>
            <Select 
                className='text-dark'
                options={trainingOptions} 
                onChange={(option) => setSelectedTraining(option.value)} 
                placeholder="Select a training"
            />
            {singleChartData && (
                <Bar 
                    data={singleChartData} 
                    options={{ 
                        responsive: true, 
                        plugins: { 
                            legend: { position: 'top' } 
                        }
                    }} 
                />
            )}
        </div>
    );
};

export default Chart;
