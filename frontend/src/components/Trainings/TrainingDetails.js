import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './TrainingDetails.css';

function TrainingDetails() {
  const { id } = useParams();
  const [training, setTraining] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.userLoginReducer);
  const currentUserID = currentUser.userId;

  useEffect(() => {
    axios
      .get(`http://localhost:5000/trainings-api/gettrainings/${id}`)
      .then((response) => {
        setTraining(response.data.payload);
      })
      .catch((error) => {
        console.error('Error fetching training details:', error);
      });
  }, [id]);

  const handleDeleteTraining = () => {
    axios
      .delete(`http://localhost:5000/trainings-api/deletetrainings/${id}`)
      .then(() => {
        navigate('/home/trainings');
      })
      .catch((error) => {
        console.error('Error deleting training:', error);
      });
  };

  const isCurrentUserCoordinator =
    training && training.programCoordinator.includes(currentUserID);

  return (
    <div className="training-details rounded rounded-3">
      {training ? (
        <div className="d-flex justify-content-between">
          <div>
            <h2>{training.trainingName}</h2>
            <p>
              Year: {training.startYear} -{' '}
              {training.endYear || <span className="text-danger">Not mentioned</span>}
            </p>
            <p>
              Total Students:{' '}
              {training.totalStudents || <span className="text-danger">Not mentioned</span>}
            </p>
            <p>
              Venue: {training.venue || <span className="text-danger">Not mentioned</span>}
            </p>
            <p>
              Number of Hours:{' '}
              {training.noOfHours || <span className="text-danger">Not mentioned</span>}
            </p>
            <p>
              Duration: {training.duration || <span className="text-danger">Not mentioned</span>}
            </p>
            <p>Mode: {training.mode || 'Not mentioned'}</p>
            <p>Status: {training.status || 'Not mentioned'}</p>
            <hr />
            <p>
              Trainer Name:{' '}
              {training.trainerName || <span className="text-danger">Not mentioned</span>}
            </p>
            <p>
              Designation:{' '}
              {training.designation || <span className="text-danger">Not mentioned</span>}
            </p>
            <p>
              Company: {training.company || <span className="text-danger">Not mentioned</span>}
            </p>
          </div>
          <div>
            {isCurrentUserCoordinator && (
              <button
                className="btn btn-primary ms-2"
                onClick={() => navigate(`/home/updatetraining/${id}`)}
              >
                Edit
              </button>
            )}
            {isCurrentUserCoordinator && (
              <button className="btn btn-danger ms-2" onClick={handleDeleteTraining}>
                Delete
              </button>
            )}
            <button className="btn btn-primary ms-2" onClick={() => navigate(`/home/attendancedetails/${id}`)}>
               Attendance Details
            </button>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default TrainingDetails;
