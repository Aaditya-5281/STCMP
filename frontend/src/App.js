import React from 'react';
import { Provider } from 'react-redux';
import store from '../src/redux/Store';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '../src/components/Home';
import Login from '../src/components/Login';
import Trainings from './components/Trainings/Trainings';
import CreateTrainings from './components/Trainings/CreateTrainings';
import TrainingDetails from './components/Trainings/TrainingDetails';
import UpdateTraining from './components/Trainings/UpdateTraining';
import AllTrainings from './components/Trainings/AllTrainings';
import MyTrainings from './components/Trainings/MyTrainings';
import Chart from './components/AuditInspection/Chart';
import UpdateAttendance from './components/Attendance/UpdateAttendance';
import AttendanceDetails from './components/Attendance/AttendanceDetails';
import AuditInspection from './components/AuditInspection/AuditInspection';
function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Login/>,
    },
    {
      path: 'home',
      element: <Home />,
      children :[
        {
          path:'trainings',
          element: <Trainings/>,   
        },
        {
          path:'mytrainings',
          element:<MyTrainings/>
        },
        {
          path:'createtraining',
          element:<CreateTrainings/>,
        },
        {
          path:'gettrainings/:id',
          element: <TrainingDetails/>,
        },
        {
          path:'updatetraining/:id',
          element: <UpdateTraining/>,
        },
        {
          path:'attendancedetails/:id',
          element: <AttendanceDetails/>
        },
        {
          path:'updateattendance/:id',
          element:<UpdateAttendance/>
        },
        {
          path:'inspection',
          element:<AuditInspection/>
        },
        {
          path:'chart',
          element:<Chart/>
        }
      ]
    }
  ]);

  return (
        <div className='app'>
            <RouterProvider router={router}/>
        </div>
  );
}

export default App;
