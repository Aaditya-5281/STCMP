import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import * as XLSX from "xlsx";
import "./CreateTrainings.css";
import { useNavigate } from "react-router-dom";

function CreateTrainings() {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const [formData, setFormData] = useState({ studentsData: [], attendanceRecords: [] });
    const [facultyList, setFacultyList] = useState([]);
    const startYear = watch('startYear');
    const [responseMessage, setResponseMessage] = useState("");
    const [programCoordinators, setProgramCoordinators] = useState([{ value: '' }]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch faculty list from API
        axios.get('http://localhost:5000/faculty-api/facultyList')
            .then(response => {
                const transformedFacultyList = response.data.faculty.map(faculty => ({
                    label: faculty.userName,
                    value: faculty.userId
                }));
                setFacultyList(transformedFacultyList);
            })
            .catch(error => {
                console.error('There was an error fetching the faculty list!', error);
            });
    }, []);

    useEffect(() => {
        const endYear = parseInt(startYear) > 0 ? parseInt(startYear) + 1 : '';
        setValue('endYear', endYear);
    }, [startYear, setValue]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const updatedData = jsonData.map(obj => {
                    const newObj = {};
                    Object.keys(obj).forEach(key => {
                        const newKey = key.replace(/\s+/g, '_');
                        newObj[newKey] = obj[key];
                    });
                    return { ...newObj, Attendance: 0, attendanceRecords: [] };
                });

                setFormData(prevData => ({ ...prevData, studentsData: updatedData }));
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleAddCoordinator = () => {
        setProgramCoordinators([...programCoordinators, { value: '' }]);
    };

    const handleRemoveCoordinator = (index) => {
        if (programCoordinators.length > 1) {
            setProgramCoordinators(programCoordinators.filter((_, i) => i !== index));
        }
    };

    const handleCoordinatorChange = (index, event) => {
        const newCoordinators = programCoordinators.map((coordinator, i) => {
            if (i === index) {
                return { ...coordinator, value: event.target.value };
            }
            return coordinator;
        });
        setProgramCoordinators(newCoordinators);
    };

    const onSubmit = async (data) => {
        const transformedData = {
            ...data,
            startYear: parseInt(data.startYear),
            endYear: parseInt(data.endYear),
            studentYear: parseInt(data.studentYear),
            semester: parseInt(data.semester),
            totalStudents: parseInt(data.totalStudents),
            noOfHours: data.noOfHours ? parseInt(data.noOfHours) : null,
            duration: data.duration ? parseInt(data.duration) : null,
            programCoordinator: programCoordinators.map(coordinator => coordinator.value),
            studentsData: formData.studentsData.map(student => ({
                ...student,
                Attendance: 0,
                attendanceRecords: []
            }))
        };

        try {
            const response = await axios.post('http://localhost:5000/trainings-api/create', transformedData);
            setResponseMessage(response.data.message);
            navigate("/home/trainings");
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setResponseMessage(error.response.data.message);
            } else {
                setResponseMessage('Error submitting the form');
            }
        }
    };

    return (
        <div className="create-training container">
            <h2 className="mb-4">Training Input Form</h2>

            <form id="trainingForm" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label htmlFor="trainingName">Training Name:</label>
                    <input type="text" className="form-control" id="trainingName" {...register('trainingName', { required: true })} />
                    {errors.trainingName?.type === 'required' && (<p className="errorMsg">*Training Name is required</p>)}
                </div>
                <div className="row">
                    <div className="form-group col">
                        <label htmlFor="startYear">Academic Start Year:</label>
                        <input type="number" className="form-control" id="startYear" {...register('startYear', { required: true })} />
                        {errors.startYear?.type === 'required' && (<p className="errorMsg">*Academic Year is required</p>)}
                    </div>
                    <div className="form-group col">
                        <label htmlFor="endYear">Academic End Year:</label>
                        <input type="number" className="form-control" id="endYear" {...register('endYear')} readOnly />
                    </div>
                </div>
                <div className="row">
                    <div className="form-group col">
                        <label htmlFor="studentYear">Student's Year:</label>
                        <input type="number" className="form-control" id="studentYear" {...register('studentYear', { required: true })} />
                        {errors.studentYear?.type === 'required' && (<p className="errorMsg">*Student Year is required</p>)}
                    </div>
                    <div className="form-group col">
                        <label htmlFor="semester">Semester:</label>
                        <input type="number" className="form-control" id="semester" {...register('semester', { required: true })} />
                        {errors.semester?.type === 'required' && (<p className="errorMsg">*Semester is required</p>)}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="totalStudents">Total Number of Students:</label>
                    <input type="number" className="form-control" id="totalStudents" {...register('totalStudents', { required: true })} />
                    {errors.totalStudents?.type === 'required' && (<p className="errorMsg">*Total Students is required</p>)}
                </div>
                <div className="form-group">
                    <label htmlFor="venue">Venue:</label>
                    <input type="text" className="form-control" id="venue" {...register('venue')} />
                </div>
                <div className="row">
                    <div className="col form-group">
                        <label htmlFor="noOfHours">Number of Hours:</label>
                        <input type="number" className="form-control" id="noOfHours" {...register('noOfHours')} />
                    </div>
                    <div className="col form-group">
                        <label htmlFor="duration">Duration (days):</label>
                        <input type="number" className="form-control" id="duration" {...register('duration')} />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="mode">Mode:</label>
                    <select className="form-control" id="mode" {...register('mode', { required: true })}>
                        <option value="" selected disabled>Select Mode</option>
                        <option value="Offline">Offline</option>
                        <option value="Online">Online</option>
                    </select>
                    {errors.mode?.type === 'required' && (<p className="errorMsg">*Mode is required</p>)}
                </div>
                <div className="form-group">
                    <label htmlFor="status">Status:</label>
                    <select className="form-control" id="status" {...register('status', { required: true })}>
                        <option value="" selected disabled>Select Status</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                    </select>
                    {errors.status?.type === 'required' && (<p className="errorMsg">*Status is required</p>)}
                </div>
                <div className="form-group">
                    <label>Program Coordinators:</label>
                    {programCoordinators.map((coordinator, index) => (
                        <div key={index} className="d-flex mb-2">
                            <input
                                type="text"
                                className="form-control"
                                value={coordinator.value}
                                onChange={(event) => handleCoordinatorChange(index, event)}
                                required={index === 0} // Ensure at least one text field is required
                            />
                            {programCoordinators.length > 1 && (
                                <button
                                    type="button"
                                    className="btn btn-danger ms-2"
                                    onClick={() => handleRemoveCoordinator(index)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleAddCoordinator}
                    >
                        Add Coordinator
                    </button>
                </div>
                <div className="form-group">
                    <label htmlFor="trainerName">Trainer Name:</label>
                    <input type="text" className="form-control" id="trainerName" {...register('trainerName', { required: true })} />
                    {errors.trainerName?.type === 'required' && (<p className="errorMsg">*Trainer Name is required</p>)}
                </div>
                <div className="form-group">
                    <label htmlFor="designation">Designation:</label>
                    <input type="text" className="form-control" id="designation" {...register('designation')} />
                </div>
                <div className="form-group">
                    <label htmlFor="company">Company:</label>
                    <input type="text" className="form-control" id="company" {...register('company')} />
                </div>
                <div className="form-group">
                    <label htmlFor="fileUpload">Upload Excel File:</label>
                    <input type="file" className="form-control" id="fileUpload" {...register('studentsData')} accept=".xlsx, .xls" onChange={handleFileChange} />
                </div>
                {responseMessage && <p>{responseMessage}</p>}
                <div className="text-center">
                    <button type="submit" className="btn btn-primary mx-auto m-3">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default CreateTrainings;
