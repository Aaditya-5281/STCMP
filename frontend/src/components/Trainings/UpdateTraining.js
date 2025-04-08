import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Select from "react-select";
import "./UpdateTraining.css";
import { useNavigate, useParams } from "react-router-dom";

function UpdateTraining() {
    const { id } = useParams(); // Get the training ID from the URL parameter
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, watch, formState: { errors }, setError } = useForm();
    const [training, setTraining] = useState({});
    const [responseMessage, setResponseMessage] = useState("");
    const [facultyList, setFacultyList] = useState([]);
    const [fieldsToUpdate, setFieldsToUpdate] = useState({});
    const startYear = watch('startYear');
    const [selectedPC, setSelectedPC] = useState([]);
    const [updateFields, setUpdateFields] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (showSuccess) {
            const timeout = setTimeout(() => {
                setShowSuccess(false);
                setResponseMessage(""); // Clear the response message after showing success
            }, 5000);

            return () => clearTimeout(timeout);
        }
    }, [showSuccess]);

    useEffect(() => {
        const endYear = parseInt(startYear) > 0 ? parseInt(startYear) + 1 : '';
        setValue('endYear', endYear);
    }, [startYear, setValue]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch faculty list from API
                const facultyResponse = await axios.get('http://localhost:5000/faculty-api/facultyList');
                const transformedFacultyList = facultyResponse.data.faculty.map(faculty => ({
                    label: faculty.userName,
                    value: faculty.userId
                }));
                setFacultyList(transformedFacultyList);

                // Fetch training details from the server
                const trainingResponse = await axios.get(`http://localhost:5000/trainings-api/gettrainings/${id}`);
                const fetchedTraining = trainingResponse.data.payload;
                setTraining(fetchedTraining);

                // Set form values
                for (const key in fetchedTraining) {
                    setValue(key, fetchedTraining[key]);
                }

                // Prepopulate selected program coordinators
                const prepopulated = fetchedTraining.programCoordinator.map(pcId => {
                    const faculty = transformedFacultyList.find(faculty => faculty.value === pcId);
                    return faculty ? { label: faculty.label, value: pcId } : null;
                }).filter(pc => pc !== null);
                setSelectedPC(prepopulated);

                // Prepopulate mode and status fields
                if (fetchedTraining.mode) {
                    setValue('mode', fetchedTraining.mode);
                }

                if (fetchedTraining.status) {
                    setValue('status', fetchedTraining.status);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id, setValue]);

    const onSubmit = (data) => {
        // Validate program coordinator field if checkbox is checked
        if (fieldsToUpdate.programCoordinator && selectedPC.length === 0) {
            setError('programCoordinator', {
                type: 'manual',
                message: 'Program Coordinator is required'
            });
            return;
        }
    
        // Prepare form data for submission
        const formData = {
            ...Object.keys(fieldsToUpdate).reduce((acc, field) => {
                acc[field] = data[field];
                return acc;
            }, {}),
            programCoordinator: fieldsToUpdate.programCoordinator ? selectedPC.map(pc => pc.value) : undefined,
            endYear: parseInt(startYear) > 0 ? parseInt(startYear) + 1 : undefined // Ensure endYear is set
        };
    
        // Convert necessary fields to integers
        const integerFields = ['studentYear', 'semester', 'startYear', 'endYear', 'totalStudents', 'noOfHours', 'duration'];
        integerFields.forEach(field => {
            if (formData[field] !== undefined) {
                formData[field] = parseInt(formData[field], 10);
            }
        });
    
        axios.put(`http://localhost:5000/trainings-api/updatetraining/${id}`, formData)
            .then(response => {
                setResponseMessage(response.data.message);
                setShowSuccess(true);
                navigate("/home/trainings");
            })
            .catch(error => {
                console.error('Error updating training details:', error);
                if (error.response && error.response.data && error.response.data.message) {
                    setResponseMessage(error.response.data.message);
                } else {
                    setResponseMessage('Error updating training details');
                }
            });
    };
    

    const handleChange = (selectedOptions) => {
        setSelectedPC(selectedOptions);

        // Update the form data for program coordinators
        const pcIds = selectedOptions.map(option => option.value);
        setUpdateFields(prevState => ({
            ...prevState,
            programCoordinator: pcIds
        }));
    };

    const handleCheckboxChange = (fieldName) => {
        setFieldsToUpdate(prevState => ({
            ...prevState,
            [fieldName]: !prevState[fieldName] // Toggle the checkbox state
        }));

        // If the checkbox is unchecked, reset the corresponding form field
        if (!fieldsToUpdate[fieldName]) {
            setValue(fieldName, ''); // Reset the form field
            setUpdateFields(prevState => {
                const updatedFields = { ...prevState };
                delete updatedFields[fieldName]; // Remove the field from the updateFields state
                return updatedFields;
            });
        } else {
            // If the checkbox is checked but the field is empty, retain the existing value
            if (!watch(fieldName)) {
                setValue(fieldName, training[fieldName]); // Set back to the original value
            }
        }
    };

    return (
        <div className="update-training container">
            <h2 className="mb-4">Update Training Details</h2>
            <form id="trainingForm" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label htmlFor="trainingName">Training Name: <input type="checkbox" checked={fieldsToUpdate.trainingName} onChange={() => handleCheckboxChange('trainingName')} /></label>
                    <input type="text" className="form-control" id="trainingName" {...register('trainingName', { required: fieldsToUpdate.trainingName })} />
                    {errors.trainingName?.type === 'required' && (<p className="errorMsg">*Training Name is required</p>)}
                </div>
                <div className="row">
                    <div className="form-group col">
                        <label htmlFor="startYear">Academic Start Year: <input type="checkbox" checked={fieldsToUpdate.startYear} onChange={() => handleCheckboxChange('startYear')} /></label>
                        <input type="number" className="form-control" id="startYear" {...register('startYear', { required: fieldsToUpdate.startYear })} />
                        {errors.startYear?.type === 'required' && (<p className="errorMsg">*Academic Year is required</p>)}
                    </div>
                    <div className="form-group col">
                        <label htmlFor="endYear">Academic End Year:</label>
                        <input type="number" className="form-control" id="endYear" {...register('endYear')} readOnly />
                    </div>
                </div>
                <div className="row">
                    <div className="form-group col">
                        <label htmlFor="studentYear">Student Year: <input type="checkbox" checked={fieldsToUpdate.studentYear} onChange={() => handleCheckboxChange('studentYear')} /></label>
                        <input type="number" className="form-control" id="studentYear" {...register('studentYear', { required: fieldsToUpdate.studentYear })} />
                        {errors.studentYear?.type === 'required' && (<p className="errorMsg">*Student Year is required</p>)}
                    </div>
                    <div className="form-group col">
                        <label htmlFor="semester">Semester: <input type="checkbox" checked={fieldsToUpdate.semester} onChange={() => handleCheckboxChange('semester')} /></label>
                        <input type="number" className="form-control" id="semester" {...register('semester', { required: fieldsToUpdate.semester })} />
                        {errors.semester?.type === 'required' && (<p className="errorMsg">*Semester is required</p>)}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="totalStudents">Total Number of Students: <input type="checkbox" checked={fieldsToUpdate.totalStudents} onChange={() => handleCheckboxChange('totalStudents')} /></label>
                    <input type="number" className="form-control" id="totalStudents" {...register('totalStudents', { required: fieldsToUpdate.totalStudents })} />
                    {errors.totalStudents?.type === 'required' && (<p className="errorMsg">*Total Students is required</p>)}
                </div>
                <div className="form-group">
                    <label htmlFor="venue">Venue: <input type="checkbox" checked={fieldsToUpdate.venue} onChange={() => handleCheckboxChange('venue')} /></label>
                    <input type="text" className="form-control" id="venue" {...register('venue', { required: fieldsToUpdate.venue })} />
                    {errors.venue?.type === 'required' && (<p className="errorMsg">*Venue is required</p>)}
                </div>
                <div className="row">
                    <div className="col form-group">
                        <label htmlFor="noOfHours">Number of Hours: <input type="checkbox" checked={fieldsToUpdate.noOfHours} onChange={() => handleCheckboxChange('noOfHours')} /></label>
                        <input type="number" className="form-control" id="noOfHours" {...register('noOfHours', { required: fieldsToUpdate.noOfHours })} />
                        {errors.noOfHours?.type === 'required' && (<p className="errorMsg">*Number of Hours is required</p>)}
                    </div>
                    <div className="col form-group">
                        <label htmlFor="duration">Duration (days): <input type="checkbox" checked={fieldsToUpdate.duration} onChange={() => handleCheckboxChange('duration')} /></label>
                        <input type="number" className="form-control" id="duration" {...register('duration', { required: fieldsToUpdate.duration })} />
                        {errors.duration?.type === 'required' && (<p className="errorMsg">*Duration is required</p>)}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="mode">Mode: <input type="checkbox" checked={fieldsToUpdate.mode} onChange={() => handleCheckboxChange('mode')} /></label>
                    <select className="form-control" id="mode" {...register('mode', { required: fieldsToUpdate.mode })}>
                        <option value="" disabled>Select Mode</option>
                        <option value="Offline">Offline</option>
                        <option value="Online">Online</option>
                    </select>
                    {errors.mode?.type === 'required' && (<p className="errorMsg">*Mode is required</p>)}
                </div>
                <div className="form-group">
                    <label htmlFor="status">Status: <input type="checkbox" checked={fieldsToUpdate.status} onChange={() => handleCheckboxChange('status')} /></label>
                    <select className="form-control" id="status" {...register('status', { required: fieldsToUpdate.status })}>
                        <option value="" disabled>Select Status</option>
                        <option value="Completed">Completed</option>
                        <option value="Ongoing">Ongoing</option>
                    </select>
                    {errors.status?.type === 'required' && (<p className="errorMsg">*Status is required</p>)}
                </div>
                <div className="form-group">
                    <label htmlFor="programCoordinator">Program Coordinator: <input type="checkbox" checked={fieldsToUpdate.programCoordinator} onChange={() => handleCheckboxChange('programCoordinator')} /></label>
                    <Select
                        id="programCoordinator"
                        options={facultyList}
                        isMulti
                        value={selectedPC}
                        onChange={handleChange}
                    />
                    {errors.programCoordinator && (
                        <p className="errorMsg">*Program Coordinator is required</p>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="trainerName">Trainer Name: <input className="form-check-input" type="checkbox" checked={fieldsToUpdate.trainerName} onChange={() => handleCheckboxChange('trainerName')} /></label>
                    <input type="text" className="form-control" id="trainerName" {...register('trainerName', { required: fieldsToUpdate.trainerName })} />
                    {errors.trainerName?.type === 'required' && (<p className="errorMsg">*Trainer Name is required</p>)}
                </div>
                <div className="form-group">
                    <label htmlFor="designation">Designation: <input className="form-check-input" type="checkbox" checked={fieldsToUpdate.designation} onChange={() => handleCheckboxChange('designation')} /></label>
                    <input type="text" className="form-control" id="designation" {...register('designation', { required: fieldsToUpdate.designation })} />
                    {errors.designation?.type === 'required' && (<p className="errorMsg">*Designation is required</p>)}
                </div>
                <div className="form-group">
                    <label htmlFor="company">Company: <input className="form-check-input" type="checkbox" checked={fieldsToUpdate.company} onChange={() => handleCheckboxChange('company')} /></label>
                    <input type="text" className="form-control" id="company" {...register('company', { required: fieldsToUpdate.company })} />
                    {errors.company?.type === 'required' && (<p className="errorMsg">*Company is required</p>)}
                </div>
                <div className="text-center pt-2">
                    <button type="submit" className="btn btn-primary">Update Training</button>
                </div>
                {responseMessage && <p className="responseMessage">{responseMessage}</p>}
            </form>
            {showSuccess && <div className="success-message">Training details updated successfully!</div>}
        </div>
    );
}

export default UpdateTraining;
