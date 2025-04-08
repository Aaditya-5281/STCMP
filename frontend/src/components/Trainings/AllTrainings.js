import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./AllTrainings.css";
import * as XLSX from "xlsx";

function AllTrainings() {
    const navigate = useNavigate();
    const [trainings, setTrainings] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const { currentUser } = useSelector((state) => state.userLoginReducer);
    const currentYear = new Date().getFullYear();
    const [ongoing,setOngoing] = useState([]);
    useEffect(() => {
        if (currentUser) {
            axios.get(`http://localhost:5000/trainings-api/trainings`)
                .then(response => {
                    setTrainings(response.data.payload);
                })
                .catch(error => {
                    console.error("Error fetching trainings:", error);
                });
        }

        axios.get(`http://localhost:5000/trainings-api/trainings/${currentYear}`)
                .then(response => {
                    setOngoing(response.data.payload);
                    console.log(ongoing);
                })
                .catch(error => {
                    console.error("Error fetching trainings:", error);
        });

        // Fetch faculty list
        axios.get('http://localhost:5000/faculty-api/facultyList')
            .then(response => {
                const transformedFacultyList = response.data.faculty.map(faculty => ({
                    label: faculty.userName,
                    value: faculty.userId
                }));
                setFacultyList(transformedFacultyList);
            })
            .catch(error => {
                console.error('Error fetching the faculty list:', error);
            });
    }, [currentUser]);

    const handleCardClick = (id, trainingName) => {
        navigate(`/home/gettrainings/${id}`);
    };

    const exportToExcel = () => {
        const data = trainings.map(training => {
            const coordinatorsNames = training.programCoordinator.map(coordinatorId =>
                facultyList.find(faculty => faculty.value === coordinatorId)?.label || 'Not mentioned'
            );

            return {
                "Training Name": training.trainingName,
                "Start Year": training.startYear,
                "End Year": training.endYear || 'Not mentioned',
                "Total Students": training.totalStudents || 'Not mentioned',
                "Venue": training.venue || 'Not mentioned',
                "Number of Hours": training.noOfHours || 'Not mentioned',
                "Duration": training.duration || 'Not mentioned',
                "Mode": training.mode || 'Not mentioned',
                "Trainer Name": training.trainerName || 'Not mentioned',
                "Designation": training.designation || 'Not mentioned',
                "Company": training.company || 'Not mentioned',
                "Program Coordinators": coordinatorsNames.join(', ') || 'Not mentioned'
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ongoing Trainings");
        XLSX.writeFile(wb, "ongoing_trainings.xlsx");
    };

    return (
        <div className='p-3 trainings-tab'>
            <nav className='row'>
                <div className='col'>
                    <h1 px-3>All Trainings</h1>
                </div>
                <div className='col text-end'>
                    <button className="btn btn-primary" onClick={exportToExcel}>
                        Export to Excel
                    </button>
                </div>
            </nav>
            <div className="trainings-container">
                {trainings.length > 0 ? (
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {trainings.map(training => (
                            <div key={training._id} className="col">
                                <div className="card h-100" onClick={() => handleCardClick(training._id)}>
                                    <div className="card-body">
                                        <h5 className="card-title">{training.trainingName}</h5>
                                        <p className="card-text">Year: {training.startYear} - {training.endYear}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No ongoing trainings.</p>
                )}
            </div>
        </div>
    );
}

export default AllTrainings;
