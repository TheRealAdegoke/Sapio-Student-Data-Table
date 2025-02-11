import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoChevronDown } from "react-icons/io5";
import ResultPDF from "./StudentResult";

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [ages, setAges] = useState([]);
  const [states, setStates] = useState([]);
  const [levels, setLevels] = useState([]);
  const [genders, setGenders] = useState([]);

  const [selectedFilters, setSelectedFilters] = useState({
    age: "",
    state: "",
    level: "",
    gender: "",
  });

  const [dropdowns, setDropdowns] = useState({
    age: false,
    state: false,
    level: false,
    gender: false,
  });

  // Fetch all student data initially
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          "https://test.omniswift.com.ng/api/viewAllData"
        );
        setStudents(response.data.data.students);
      } catch (error) {
        setError("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Fetch filter options (levels, states, genders, ages)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [agesRes, statesRes, levelsRes, gendersRes] = await Promise.all([
          axios.get("https://test.omniswift.com.ng/api/viewAllAges"),
          axios.get("https://test.omniswift.com.ng/api/viewAllStates"),
          axios.get("https://test.omniswift.com.ng/api/viewAllLevels"),
          axios.get("https://test.omniswift.com.ng/api/viewAllGender"),
        ]);

        setAges(agesRes.data.data);
        setStates(statesRes.data.data);
        setLevels(levelsRes.data.data);
        setGenders(gendersRes.data.data);
      } catch (error) {
        console.error("Failed to fetch filter data", error);
      }
    };

    fetchFilters();
  }, []);

  // Fetch filtered student data
  const fetchFilteredStudents = async () => {
    // Check if all filters are empty
    const isEmptyFilters = Object.values(selectedFilters).every(
      (val) => val === ""
    );

    if (isEmptyFilters) {
      return; // Do nothing if no filters are selected
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "https://test.omniswift.com.ng/api/filterData",
        selectedFilters
      );
      setStudents(response.data.data.students);
    } catch (error) {
      setError("No record found");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  // Handle dropdown toggle
  const toggleDropdown = (type) => {
    setDropdowns((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Handle selection
  const handleSelect = (type, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
    setDropdowns((prev) => ({
      ...prev,
      [type]: false,
    }));
  };

  return (
    <main className="bg-[#f6f6f6] min-h-screen">
      <section className="w-[90%] mx-auto max-w-[1000px] py-5">
        <h1 className="text-4xl font-black text-[#343434] font-serif">
          Student Data Table
        </h1>

        <div className="bg-white my-4 rounded-[5px] px-5 py-8">
          <h2 className="text-2xl font-serif text-[#616161] mb-4">
            Filter Student Table By:
          </h2>

          <div className="flex gap-x-10 flex-wrap gap-y-4 max-sm:flex-col">
            {[
              { label: "Age", key: "age", data: ages, valueKey: "age" },
              { label: "State", key: "state", data: states, valueKey: "name" },
              { label: "Level", key: "level", data: levels, valueKey: "level" },
              {
                label: "Gender",
                key: "gender",
                data: genders,
                valueKey: "gender",
              },
            ].map(({ label, key, data, valueKey }) => (
              <div
                key={key}
                className="relative w-[30%] max-sm:w-full max-w-[300px]"
              >
                <fieldset className="border-[1px] border-[#ADB7BE] rounded-[3px]">
                  <legend className="ml-3">{label}</legend>
                  <div className="flex items-center justify-between px-2">
                    <input
                      type="text"
                      placeholder={`Select ${label.toLowerCase()}`}
                      className="pb-1 outline-none w-full"
                      value={selectedFilters[key]}
                      readOnly
                    />
                    <button onClick={() => toggleDropdown(key)}>
                      <IoChevronDown />
                    </button>
                  </div>
                </fieldset>

                {dropdowns[key] && (
                  <ul className="absolute w-full bg-white border border-gray-300 mt-1 max-h-[150px] overflow-y-auto z-10 shadow-md">
                    {data.map((item) => (
                      <li
                        key={item.id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSelect(key, item[valueKey])}
                      >
                        {item[valueKey]}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="w-[30%] max-sm:w-full max-w-[300px] pt-2">
              <button
                className="block w-full py-3 bg-[#46C35F] text-white rounded-[3px] cursor-pointer"
                onClick={fetchFilteredStudents}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white my-4 rounded-[5px] px-5 py-8 h-[300px] overflow-y-auto custom-scrollbar">
          <div className="mb-3 flex justify-end font-medium">
            <button
              className="cursor-pointer"
              onClick={() => {
                setSelectedFilters({
                  age: "",
                  state: "",
                  level: "",
                  gender: "",
                });
                setError(null);
                setLoading(true);

                axios
                  .get("https://test.omniswift.com.ng/api/viewAllData")
                  .then((response) => {
                    setStudents(response.data.data.students);
                  })
                  .catch(() => {
                    setError("Failed to fetch students");
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
            >
              Reset
            </button>
          </div>
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 text-[#343434]">S/N</th>
                    <th className="p-2 text-[#343434]">Surname</th>
                    <th className="p-2 text-[#343434]">Firstname</th>
                    <th className="p-2 text-[#343434]">Age</th>
                    <th className="p-2 text-[#343434]">Gender</th>
                    <th className="p-2 text-[#343434]">Level</th>
                    <th className="p-2 text-[#343434]">State</th>
                    <th className="p-2 text-[#343434]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className="border-b-[1px] border-[rgba(0,0,0,0.2)]"
                    >
                      <td className="p-2 text-[#343434] text-center capitalize">
                        {index + 1}
                      </td>
                      <td className="p-2 text-[#343434] text-center capitalize">
                        {student.surname}
                      </td>
                      <td className="p-2 text-[#343434] text-center capitalize">
                        {student.firstname}
                      </td>
                      <td className="p-2 text-[#343434] text-center capitalize">
                        {student.age}
                      </td>
                      <td className="p-2 text-[#343434] text-center capitalize">
                        {student.gender}
                      </td>
                      <td className="p-2 text-[#343434] text-center capitalize">
                        {student.level}
                      </td>
                      <td className="p-2 text-[#343434] text-center capitalize">
                        {student.state}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          className="py-2 px-4 bg-[#46C35F] text-white rounded-md cursor-pointer"
                          onClick={() => {
                            setSelectedStudent(student.id);
                            console.log(student.id);
                          }}
                        >
                          Download result
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      {selectedStudent && (
        <ResultPDF
          studentId={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </main>
  );
};

export default StudentTable;
