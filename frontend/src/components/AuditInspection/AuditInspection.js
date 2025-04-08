import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./AuditInspection.css";

function AuditInspection() {
  const [trainings, setTrainings] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [selectedCoordinators, setSelectedCoordinators] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "" });
  const [visiblity,setVisibility] = useState(false)
  useEffect(() => {
    fetchTrainings();
    fetchCoordinators();
  }, []);

  const fetchTrainings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/trainings-api/trainings"
      );
      const fetchedTrainings = response.data.payload;
      setTrainings(fetchedTrainings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchCoordinators = async () => {
    try {
      const facultyResponse = await axios.get(
        "http://localhost:5000/faculty-api/facultyList"
      );
      const transformedFacultyList = facultyResponse.data.faculty.map(
        (faculty) => ({
          label: faculty.userName,
          value: faculty.userId,
        })
      );
      setCoordinators(transformedFacultyList);
    } catch (error) {
      console.error("Error fetching coordinators:", error);
      setError(error.message);
    }
  };

  const handleCoordinatorChange = (selectedOptions) => {
    setSelectedCoordinators(selectedOptions);
    const selectedCoordinatorIds = selectedOptions.map(
      (option) => option.value
    );
    handleFilterChange("coordinators", selectedCoordinatorIds.join(","));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = "";
      } else {
        direction = "asc";
      }
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleClear = () => {
    setSelectedCoordinators([]);
    handleFilterChange("coordinators", "");
    setVisibility(!visiblity);
  };

  const filteredTrainings = trainings.filter((training) => {
    return Object.keys(filters).every((filterKey) => {
      if (filterKey === "coordinators" && filters.coordinators) {
        const selectedCoordinatorIds = filters.coordinators.split(",");
        return selectedCoordinatorIds.some((id) =>
          training.programCoordinator.includes(id)
        );
      }
      if (filters[filterKey]) {
        return (
          training[filterKey] &&
          training[filterKey]
            .toString()
            .toLowerCase()
            .includes(filters[filterKey].toLowerCase())
        );
      }
      return true;
    });
  });

  const sortedTrainings = filteredTrainings.sort((a, b) => {
    if (sortConfig.key && sortConfig.direction) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  const getSortArrow = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        return "↑";
      }
      if (sortConfig.direction === "desc") {
        return "↓";
      }
    }
    return "↑";
  };

  const downloadExcel = () => {
    const dataToExport = sortedTrainings.map(
      ({ _id, studentsData, programCoordinator, ...rest }) => rest
    );

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    autoFitColumns(worksheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trainings");
    XLSX.writeFile(workbook, "trainings.xlsx", {
      bookType: "xlsx",
      type: "buffer",
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");

    doc.autoTable({
      head: [
        [
          "Training Name",
          "Start Year",
          "End Year",
          "Student Year",
          "Semester",
          "Status",
          "Total Students",
          "Venue",
          "No of Hours",
          "Duration",
          "Mode",
          "Status",
          "Trainer Name",
          "Designation",
          "Company",
        ],
      ],
      body: sortedTrainings.map(
        ({
          trainingName,
          startYear,
          endYear,
          studentYear,
          semester,
          totalStudents,
          venue,
          noOfHours,
          duration,
          mode,
          status,
          trainerName,
          designation,
          company,
        }) => [
          trainingName,
          startYear,
          endYear,
          studentYear,
          semester,
          totalStudents,
          venue,
          noOfHours,
          duration,
          mode,
          status,
          trainerName,
          designation,
          company,
        ]
      ),
      margin: { top: 10, right: 10, bottom: 10, left: 10 }, // Reduced margins
      columnStyles: {
        0: { cellWidth: 70 }, // Training Name
        1: { cellWidth: 30 }, // Start Year
        2: { cellWidth: 30 }, // End Year
        3: { cellWidth: 35 }, // Student Year
        4: { cellWidth: 30 }, // Semester
        5: { cellWidth: 30 }, // Status
        6: { cellWidth: 35 }, // Total Students
        7: { cellWidth: 50 }, // Venue
        8: { cellWidth: 30 }, // No of Hours
        9: { cellWidth: 30 }, // Duration
        10: { cellWidth: 30 }, // Mode
        11: { cellWidth: 30 }, // Status (duplicate, consider removing)
        12: { cellWidth: 50 }, // Trainer Name
        13: { cellWidth: 50 }, // Designation
        14: { cellWidth: 50 }, // Company
      },
      styles: {
        overflow: "linebreak",
        cellPadding: 1,
        fontSize: 7,
      },
      headStyles: {
        fontSize: 7,
        fillColor: [200, 200, 200],
      },
      pageBreak: "auto",
      theme: "grid",
    });
    doc.save("trainings.pdf");
  };

  const autoFitColumns = (worksheet) => {
    const columns = [];
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const maxLength = [];
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = { c: C, r: R };
        const cell = XLSX.utils.encode_cell(cellAddress);
        const cellValue = worksheet[cell] ? worksheet[cell].v : "";
        maxLength.push(cellValue ? cellValue.toString().length : 0);
      }
      const max = Math.max(...maxLength);
      columns.push({ wch: max });
    }
    worksheet["!cols"] = columns;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="audit-inspection">
      <div className="filter-controls">
        <div className="d-flex mb-3">
          <button className="btn btn-primary m-2" onClick={handleClear}>
            {visiblity ? "Hide Filters" : "Show Filters"}
          </button>
          <Select
            isMulti
            value={selectedCoordinators}
            onChange={handleCoordinatorChange}
            options={coordinators}
            className={`basic-multi-select m-2 ${visiblity ? '' : 'd-none'}`}
            classNamePrefix="select"
            placeholder="Select Coordinators..."
          />
          {sortedTrainings.length > 0 && (
            <div className="">
              <button className="btn btn-success m-2" onClick={downloadExcel}>
                Download Excel
              </button>
              <button className="btn btn-danger m-2" onClick={downloadPDF}>
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
      <table className="table table-responsive table-striped table-bordered table-hover">
        <thead className="thead-dark">
          <tr>
            <th onClick={() => handleSort("trainingName")}>
              Training Name{" "}
              <span className="sort-arrow">{getSortArrow("trainingName")}</span>
            </th>
            <th onClick={() => handleSort("startYear")}>
              Start Year <span className="sort-arrow">{getSortArrow("startYear")}</span>
            </th>
            <th onClick={() => handleSort("endYear")}>
              End Year <span className="sort-arrow">{getSortArrow("endYear")}</span>
            </th>
            <th onClick={() => handleSort("studentYear")}>
              Student Year{" "}
              <span className="sort-arrow">{getSortArrow("studentYear")}</span>
            </th>
            <th onClick={() => handleSort("semester")}>
              Semester <span className="sort-arrow">{getSortArrow("semester")}</span>
            </th>
            <th onClick={() => handleSort("totalStudents")}>
              Total Students{" "}
              <span className="sort-arrow">{getSortArrow("totalStudents")}</span>
            </th>
            <th onClick={() => handleSort("venue")}>
              Venue <span className="sort-arrow">{getSortArrow("venue")}</span>
            </th>
            <th onClick={() => handleSort("noOfHours")}>
              No of Hours{" "}
              <span className="sort-arrow">{getSortArrow("noOfHours")}</span>
            </th>
            <th onClick={() => handleSort("duration")}>
              Duration <span className="sort-arrow">{getSortArrow("duration")}</span>
            </th>
            <th onClick={() => handleSort("mode")}>
              Mode <span className="sort-arrow">{getSortArrow("mode")}</span>
            </th>
            <th onClick={() => handleSort("status")}>
              Status <span className="sort-arrow">{getSortArrow("status")}</span>
            </th>
            <th onClick={() => handleSort("trainerName")}>
              Trainer Name{" "}
              <span className="sort-arrow">{getSortArrow("trainerName")}</span>
            </th>
            <th onClick={() => handleSort("designation")}>
              Designation{" "}
              <span className="sort-arrow">{getSortArrow("designation")}</span>
            </th>
            <th onClick={() => handleSort("company")}>
              Company <span className="sort-arrow">{getSortArrow("company")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTrainings.map((training) => (
            <tr key={training._id}>
              <td>{training.trainingName}</td>
              <td>{training.startYear}</td>
              <td>{training.endYear}</td>
              <td>{training.studentYear}</td>
              <td>{training.semester}</td>
              <td>{training.totalStudents}</td>
              <td>{training.venue}</td>
              <td>{training.noOfHours}</td>
              <td>{training.duration}</td>
              <td>{training.mode}</td>
              <td>{training.status}</td>
              <td>{training.trainerName}</td>
              <td>{training.designation}</td>
              <td>{training.company}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default AuditInspection;
