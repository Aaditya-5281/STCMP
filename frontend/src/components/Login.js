import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { userLoginThunk } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import PersonIcon from "../images/person-icon.png";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const { isPending, currentUser, loginUserStatus, errorOccurred, errMsg } =
    useSelector((state) => state.userLoginReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function onSignUpFormSubmit(userCred) {
    dispatch(userLoginThunk(userCred));
  }

  useEffect(() => {
    if (loginUserStatus) {
      navigate("/home");
    }
  }, [loginUserStatus, navigate]);

  useEffect(() => {
    if (errorOccurred) {
      setErrorMessage(errMsg);
    }
  }, [errorOccurred, errMsg]);

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center">
      <video autoPlay muted loop id="background-video">
        <source
          src="https://vnrvjiet.ac.in/assets/images/Website%20Hero%20Video.mp4"
          type="video/mp4"
        />
      </video>
      <div className="window rounded d-flex flex-column justify-content-center align-items-center">
        <h1 className="mt-3 p-2">Welcome | VNRVJIET </h1>
        <form
          className="p-3 d-flex justify-content-center align-items-center flex-column"
          onSubmit={handleSubmit(onSignUpFormSubmit)}
        >
          <h1 className="text-center mb-3">Login</h1>
          <img src={PersonIcon} className="icon mb-3" alt="Person Icon" />
          <input
            type="text"
            className="form-control mb-4"
            placeholder="Username"
            {...register("userId", { required: true })}
          />
          {errors.userId?.type === "required" && (
            <p className="text-danger">*Username is required</p>
          )}
          <input
            type="password"
            className="form-control mb-4"
            placeholder="Password"
            {...register("password", { required: true })}
          />
          {errors.password?.type === "required" && (
            <p className="text-danger">*Password is required</p>
          )}
          {errorOccurred && (
            <p className="text-danger">{errorMessage}</p>
          )}
          <input type="submit" className="btn btn-success" value="Submit" />
        </form>
      </div>
    </div>
  );
}

export default Login;
