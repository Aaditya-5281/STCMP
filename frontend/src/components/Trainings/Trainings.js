import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Trainings.css";
import * as XLSX from "xlsx";

function Trainings() {
    const navigate = useNavigate();
    const [trainings, setTrainings] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const { currentUser } = useSelector((state) => state.userLoginReducer);
    const currentYear = new Date().getFullYear();
    const [showOngoingTrainings, setShowOngoingTrainings] = useState(false);
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
        axios.get(`http://localhost:5000/trainings-api/trainingsbyyear/${currentYear}`)
                .then(response => {
                    setOngoing(response.data.payload);
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

    const filteredTrainings = showOngoingTrainings
        ? trainings.filter(training => training.status === "Ongoing")
        : trainings;

    return (
        <div className='p-3 trainings-tab'>
            <nav className='row'>
            <div className='col-lg-6 col-sm-6 col-md-6  d-flex justify-content-between'>
                    <h1 className='px-3 d-inline'>Trainings</h1> 
                    <div className='d-inline d-flex align-items-center w-100'>
                        <input type="checkbox" id="showOngoingTrainings" checked={showOngoingTrainings} onChange={() => setShowOngoingTrainings(!showOngoingTrainings)}/>
                        <label htmlFor="showOngoingTrainings" className="toggle"></label>
                        <label htmlFor="showOngoingTrainings" className='px-2'>Show Ongoing</label>
                    </div>
                </div>
                <div className='text-end col-lg-6 col-sm-6 d-flex justify-content-between col-md-6'>
                        <div className='col-6 p-2'>
                            <button className="btn btn-success w-100" onClick={() => navigate("/home/createtraining")} >
                                Add Training
                            </button>
                        </div>
                        <div className='col-6 p-2'>
                            <button className="btn btn-primary w-100" onClick={exportToExcel}>
                                Export to Excel
                            </button>
                        </div>
                </div>
            </nav>
            <div className="trainings-container">
                {filteredTrainings.length > 0 ? (
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {filteredTrainings.map(training => (
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
                    <p>No trainings.</p>
                )}
            </div>
        </div>
    );
}

export default Trainings;
