import React, { useState } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import axios from "axios";
import { baseApiURL } from "../../baseUrl";
import { FiSearch } from "react-icons/fi";

const Student = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const [marksData, setMarksData] = useState(null);

  const searchStudentHandler = async (e) => {
    e.preventDefault();

    if (!search) {
      toast.error("Please enter an enrollment number.");
      return;
    }

    toast.loading("Fetching student details...");
    try {
      const response = await axios.post(
        `${baseApiURL()}/student/details/getDetails`,
        { enrollmentNo: search },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.dismiss();

      if (response.data.success && response.data.user.length > 0) {
        const student = response.data.user[0];
        setData(student);
        toast.success("Student details fetched successfully.");
        fetchMarks(student.enrollmentNo);
      } else {
        setData(null);
        setMarksData(null);
        toast.error("No student found.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error fetching student details.");
    }
  };

  const fetchMarks = async (enrollmentNo) => {
    toast.loading("Fetching marks...");
    try {
      const response = await axios.post(
        `${baseApiURL()}/marks/getMarks`,
        { enrollmentNo },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.dismiss();

      if (response.data.success && response.data.Mark.length > 0) {
        setMarksData(response.data.Mark[0]);
        toast.success("Marks fetched successfully.");
      } else {
        setMarksData(null);
        toast.error("No marks found for this student.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Error fetching marks.");
    }
  };

  const sendResultEmail = async () => {
    if (!data || !marksData) {
      toast.error("Incomplete student or marks data. Cannot send email.");
      return;
    }

    toast.loading("Sending email...");
    try {
      const response = await axios.post(
        `${baseApiURL()}/sendResult`,
        { studentDetails: data, marks: marksData },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.dismiss();

      if (response.data.success) {
        toast.success("Result email sent successfully.");
      } else {
        toast.error(response.data.message || "Failed to send email.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Error sending email.");
    }
  };

  return (
    <div className="w-full mx-auto mt-10 flex justify-center items-center flex-col mb-10">
      <Heading title="Student Details" />

      <form
        className="flex justify-center items-center border-2 border-blue-500 rounded w-[40%] mx-auto"
        onSubmit={searchStudentHandler}
      >
        <input
          type="text"
          className="px-6 py-3 w-full outline-none"
          placeholder="Enrollment No."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="px-4 text-2xl hover:text-blue-500" type="submit">
          <FiSearch />
        </button>
      </form>

      {data && (
        <div className="mt-10 flex flex-col w-full max-w-5xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row items-center p-6 gap-6 border-b border-gray-300">
            <img
              src={process.env.REACT_APP_MEDIA_LINK + "/" + data.profile}
              alt="student profile"
              className="h-[150px] w-[150px] object-cover rounded-full shadow-md"
            />
            <div>
              <p className="text-2xl font-bold text-gray-700">
                {data.firstName} {data.middleName} {data.lastName}
              </p>
              <p className="text-lg text-gray-500">
                Enrollment No: {data.enrollmentNo}
              </p>
              <p className="text-lg text-gray-500">Email: {data.email}</p>
              <p className="text-lg text-gray-500">Parent Email: {data.parentEmail}</p>
              <p className="text-lg text-gray-500">Phone: +91 {data.phoneNumber}</p>
              <p className="text-lg text-gray-500">Branch: {data.branch}</p>
              <p className="text-lg text-gray-500">Semester: {data.semester}</p>
            </div>
          </div>

          {marksData && (
            <div className="flex flex-col md:flex-row gap-6 p-6">
              <div className="bg-blue-50 p-4 rounded-lg w-full md:w-1/2 shadow-md">
                <p className="text-xl font-semibold text-blue-600 border-b border-blue-500 mb-3">
                  Internal Marks
                </p>
                {Object.entries(marksData.internal || {}).map(([subject, marks], index) => (
                  <p key={index} className="text-lg text-gray-700">
                    {subject}: <span className="font-bold">{marks}</span>
                  </p>
                ))}
              </div>
              <div className="bg-green-50 p-4 rounded-lg w-full md:w-1/2 shadow-md">
                <p className="text-xl font-semibold text-green-600 border-b border-green-500 mb-3">
                  External Marks
                </p>
                {Object.entries(marksData.external || {}).map(([subject, marks], index) => (
                  <p key={index} className="text-lg text-gray-700">
                    {subject}: <span className="font-bold">{marks}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-4 mb-4">
            <button
              onClick={sendResultEmail}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Send Result to Parent
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Student;
