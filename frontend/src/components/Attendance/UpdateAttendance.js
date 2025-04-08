import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpdateAttendance.css';

function UpdateAttendance() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [responseMessage, setResponseMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/trainings-api/gettrainings/${id}`)
      .then((response) => {
        const studentsData = response.data.payload.studentsData;
        setStudents(studentsData);
        // Initialize attendance data with default values
        const initialAttendanceData = {};
        studentsData.forEach((student) => {
          initialAttendanceData[student.Roll_No] = {
            isPresent: false,
            remark: ""
          };
        });
        setAttendanceData(initialAttendanceData);
      })
      .catch((error) => {
        console.error('Error fetching students data:', error);
      });
  }, [id]);

  // Handle checkbox change
  const handleCheckboxChange = (Roll_No) => {
    setAttendanceData({
      ...attendanceData,
      [Roll_No]: {
        ...attendanceData[Roll_No],
        isPresent: !attendanceData[Roll_No].isPresent // Toggle attendance status
      }
    });
  };

  // Handle remark change
  const handleRemarkChange = (Roll_No, value) => {
    setAttendanceData({
      ...attendanceData,
      [Roll_No]: {
        ...attendanceData[Roll_No],
        remark: value
      }
    });
  };

  // Calculate attendance percentage for a student
  const calculateAttendancePercentage = (attendanceRecords) => {
    const totalRecords = attendanceRecords.length;
    const presentRecords = attendanceRecords.filter(record => record.isPresent).length;
    return totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;
  };

  // Handle Save Attendance button click
  const handleSaveAttendance = () => {
    // Check if attendance for the selected date already exists
    const attendanceExists = students.some(student => 
      student.attendanceRecords?.some(record => record.date === attendanceDate)
    );

    if (attendanceExists) {
      setShowError(true);
      setResponseMessage(`Attendance for the date ${attendanceDate} already exists.`);
      return;
    }

    // Update attendance property for each student
    const updatedStudents = students.map(student => {
      const studentAttendance = attendanceData[student.Roll_No];
      // Create a new attendance record
      const newAttendanceRecord = {
        date: attendanceDate,
        isPresent: studentAttendance.isPresent,
        remark: studentAttendance.remark
      };

      // Update attendance records
      const updatedAttendanceRecords = [...(student.attendanceRecords || []), newAttendanceRecord];

      return {
        ...student,
        attendanceRecords: updatedAttendanceRecords,
        Attendance: calculateAttendancePercentage(updatedAttendanceRecords) // Update attendance percentage
      };
    });

    // Prepare formData with updated students data
    const formData = {
      studentsData: updatedStudents
    };

    // Send updated training data to API
    axios.put(`http://localhost:5000/trainings-api/updatetraining/${id}`, formData)
      .then(response => {
        // Handle response
        console.log('Training data updated successfully:', response.data);
        setShowSuccess(true);
        navigate("/home/trainings");
      })
      .catch(error => {
        console.error('Error updating training details:', error);
        setShowError(true);
        if (error.response && error.response.data && error.response.data.message) {
          setResponseMessage(error.response.data.message);
        } else {
          setResponseMessage('Error updating training details');
        }
      });
  };

  return (
    <div className="update-attendance rounded rounded-3 text-dark">
      <h2>Update Attendance</h2>
      <div className="mb-3">
        <label htmlFor="attendanceDate" className="form-label">
          Select Date
        </label>
        <input
          type="date"
          className='form-control'
          value={attendanceDate}
          onChange={(e) => setAttendanceDate(e.target.value)}
        />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Attendance</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.Roll_No}>
              <td>{student.Student_Name}</td>
              <td>
                <input
                  type="checkbox"
                  className='form-check-input'
                  checked={attendanceData[student.Roll_No]?.isPresent || false}
                  onChange={() => handleCheckboxChange(student.Roll_No)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className='form-control'
                  value={attendanceData[student.Roll_No]?.remark || ''}
                  onChange={(e) => handleRemarkChange(student.Roll_No, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-primary" onClick={handleSaveAttendance}>
        Save Attendance
      </button>
      {showSuccess && <div className="alert alert-success mt-3">Attendance updated successfully!</div>}
      {showError && <div className="alert alert-danger mt-3">{responseMessage}</div>}
    </div>
  );
}

export default UpdateAttendance;
