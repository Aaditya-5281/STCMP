import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AttendanceDetails.css";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import Select from 'react-select'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css'; 
function AttendanceDetails() {
  const { id } = useParams();
  const [studentsData, setStudentsData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.userLoginReducer);
  const currentUserID = currentUser.userId;
  const [training, setTraining] = useState(null);
  const options = studentsData.map(item => ({
    value: item.Roll_No,
    label: `${item.Student_Name} - ${item.Roll_No}`, // Display both name and roll number
    studentData: item // Store the full student data in the option for easy access
  }));

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const calcColor = (percent, start, end) => {
    let a = percent / 100,
      b = (end - start) * a,
      c = b + start;
    return 'hsl(' + c + ', 100%, 50%)';
  };
  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    const student = selectedOption.studentData; // Get the full student data from selected option
    setSelectedAttendance(student.Attendance); // Set selected student's attendance
    console.log(`Selected: ${selectedOption.value}`);
  };
  
  useEffect(() => {
    axios
      .get(`http://localhost:5000/trainings-api/gettrainings/${id}`)
      .then((response) => {
        setTraining(response.data.payload);
        setStudentsData(response.data.payload.studentsData);
        if (response.data.payload.studentsData.length > 0) {
          setSessions(response.data.payload.studentsData[0].attendanceRecords);
        }
      })
      .catch((error) => {
        console.error("Error fetching training details:", error);
        setError(error);
      });
  }, [id]);

  const isCurrentUserCoordinator =
    training && training.programCoordinator.includes(currentUserID);

  const handleDeleteTraining = () => {
    axios
      .delete(`http://localhost:5000/trainings-api/deletetrainings/${id}`)
      .then(() => {
        navigate("/home/trainings");
      })
      .catch((error) => {
        console.error("Error deleting training:", error);
        setError(error);
      });
  };

  const updateAttendance = () => {
    navigate(`/home/updateattendance/${id}`);
  };

  const getAbsentees = (sessionDate) => {
    const absentees = studentsData
      .filter((student) =>
        student.attendanceRecords.some(
          (record) => record.date === sessionDate && !record.isPresent
        )
      )
      .map((student) => {
        const remarks = student.attendanceRecords
          .filter((record) => record.date === sessionDate)
          .map((record) => record.remark)
          .join(", ");

        return {
          Student_Name: student.Student_Name,
          Attendance: student.Attendance,
          Remarks: remarks || "", // Keep empty if no remarks
          Training_Name: training ? training.trainingName : "",
          Parent_Mobile_No: student.Parent_Mobile_No,
          Student_Mobile_No: student.Student_Mobile_No,
          Roll_No: student.Roll_No,
          Parent_Name: student.Parent_Name,
          Branch: student.Branch,
          Blood_Group: student.Blood_Group,
          Residential_Address: student.Residential_Address,
          Email: student.Email,
          Date: sessionDate,
        };
      });

    exportToExcel(absentees, "Absentees", sessionDate);
  };

  const getPresentees = (sessionDate) => {
    const presentees = studentsData
      .filter((student) =>
        student.attendanceRecords.some(
          (record) => record.date === sessionDate && record.isPresent
        )
      )
      .map((student) => {
        const remarks = student.attendanceRecords
          .filter((record) => record.date === sessionDate)
          .map((record) => record.remark)
          .join(", ");

        return {
          Student_Name: student.Student_Name,
          Attendance: student.Attendance,
          Remarks: remarks || "", // Keep empty if no remarks
          Training_Name: training ? training.trainingName : "",
          Parent_Mobile_No: student.Parent_Mobile_No,
          Student_Mobile_No: student.Student_Mobile_No,
          Roll_No: student.Roll_No,
          Parent_Name: student.Parent_Name,
          Branch: student.Branch,
          Blood_Group: student.Blood_Group,
          Residential_Address: student.Residential_Address,
          Email: student.Email,
          Date: sessionDate,
        };
      });

    exportToExcel(presentees, "Presentees", sessionDate);
  };

  const getAttendance = () => {
    const attendanceData = studentsData.map((student) => {
      return {
            Student_Name: student.Student_Name,
            Attendance: student.Attendance,
            Training_Name: training ? training.trainingName : "",
            Parent_Mobile_No: student.Parent_Mobile_No,
            Student_Mobile_No: student.Student_Mobile_No,
            Roll_No: student.Roll_No,
            Parent_Name: student.Parent_Name,
            Branch: student.Branch,
            Blood_Group: student.Blood_Group,
            Residential_Address: student.Residential_Address,
            Email: student.Email,
        };
    });
    
        exportToExcel(attendanceData, "Attendance");
};
    
      const irregularS = () => {
        const irregularStudents = studentsData
          .filter((student) => student.Attendance <= 25)
          .map((student) => {
            return {
              Student_Name: student.Student_Name,
              Attendance: student.Attendance,
              Training_Name: training ? training.trainingName : "",
              Parent_Mobile_No: student.Parent_Mobile_No,
              Student_Mobile_No: student.Student_Mobile_No,
              Roll_No: student.Roll_No,
              Parent_Name: student.Parent_Name,
              Branch: student.Branch,
              Blood_Group: student.Blood_Group,
              Residential_Address: student.Residential_Address,
              Email: student.Email,
            };
          });
    
        exportToExcel(irregularStudents, "Irregular_Students");
      };
    
      const exportToExcel = (data, filename, sessionDate) => {
        const worksheet = XLSX.utils.json_to_sheet(
          data.map((item) => {
            const updatedItem = {};
            Object.keys(item).forEach((key) => {
              const newKey = key.replace(/_/g, " ");
              updatedItem[newKey] = item[key];
            });
            return updatedItem;
          })
        );
    
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, filename);
    
        const formattedDate = sessionDate ? sessionDate.replace(/\//g, "-") : "";
        const fullFilename = formattedDate
          ? `${filename}_${training.trainingName}_${formattedDate}.xlsx`
          : `${filename}_${training.trainingName}.xlsx`;
    
        XLSX.writeFile(workbook, fullFilename);
      };
    
      return (
        <div className="bg-primary attendancedet">
          {error && <div className="error">Error: {error.message}</div>}
          <div className="">
            <div className="row">
                <h1 className="p-3">Sessions :</h1>
            </div>
            <div className="row">
            <div>
                <h1>Student Attendance</h1>
                    <Select
                        value={selectedOption}
                        onChange={handleChange}
                        options={options}
                        placeholder="Select a student"
                        isSearchable={true} 
                        className="text-dark"
                    />
                    </div>
                    {selectedOption && (
                      <div className="cpb mx-auto p-3" style={{ width: '25%' }}>
                        <CircularProgressbar
                            value={selectedAttendance}
                            text={`${selectedAttendance} %`}
                            circleRatio={0.7} 
                            styles={{
                            trail: {
                                strokeLinecap: 'butt',
                                transform: 'rotate(-126deg)',
                                transformOrigin: 'center center',
                            },
                        path: {
                            strokeLinecap: 'butt',
                            transform: 'rotate(-126deg)',
                            transformOrigin: 'center center',
                            stroke: calcColor(selectedAttendance, 0, 100),
                        },
                        text: {
                            fill: '#ddd',
                            },
                        }}
                        strokeWidth={5}
                        />
                      </div>
                    )}
            </div>
            <div className="row navcon">
                    {isCurrentUserCoordinator ? (
                      <>
                        <div className="col-sm-12 mb-2 col-md-4 col-lg-4">
                          <button className="btn btn-info"  onClick={updateAttendance}>
                            Update Attendance
                          </button>
                        </div>
                        <div className="col-sm-12 mb-2 col-md-4 col-lg-4"><button  className="btn btn-info" onClick={getAttendance}>
                          Get Attendance
                        </button>
                        </div>
                        <div className="col-sm-12 mb-2 col-md-4 col-lg-4"><button className="btn btn-info" onClick={irregularS}>
                          Irregular Students
                          </button>
                        </div>
                  </>
                    )
                  :
                  (
                    <>
                    <div className="col-sm-12 mb-2 col-md-6 col-lg-6"><button  className="btn btn-info" onClick={getAttendance}>
                        Get Attendance
                      </button>
                    </div>
                    <div className="col-sm-12 mb-2 col-md-6 col-lg-6"><button className="btn btn-info" onClick={irregularS}>
                        Irregular Students
                      </button>
                    </div>
                    </>
                  )
                  }
            </div>
            <div className="row atd">
              {sessions.map((session, index) => (
                <div key={index} className="session card mb-2 p-4">
                  <p>Session {index + 1}</p>
                  <p>Date: {session.date}</p>
                  <div className="row">
                  {isCurrentUserCoordinator && (
                    <>
                    <div className="col">
                        <button onClick={() => getAbsentees(session.date)} className="btn btn-primary">
                            Get Absentees to Excel
                        </button>
                    </div>
                    <div className="col">
                        <button onClick={() => getPresentees(session.date)} className="btn btn-primary">
                            Get Presentees to Excel
                        </button>
                    </div>
                    </>
                  )}
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    export default AttendanceDetails;
    
