import React, { useRef, useEffect, useState } from "react";
import axios from "axios";

const ResultPDF = ({ studentId, onClose }) => {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const componentRef = useRef();

  // Function to convert image URL to base64
  const getBase64FromUrl = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchResultData = async () => {
      try {
        const response = await axios.post(
          `https://test.omniswift.com.ng/api/viewResult/${studentId}`
        );

        const data = response.data;

        // Convert images to base64
        const logoBase64 = await getBase64FromUrl(data.logo);
        const profileBase64 = await getBase64FromUrl(data.profile_picture);

        // Update the data with base64 images
        const updatedData = {
          ...data,
          logo: logoBase64,
          profile_picture: profileBase64,
        };

        setResultData(updatedData);

        // Generate PDF after data is loaded and images are converted
        setTimeout(() => {
          generatePDF(updatedData);
        }, 500);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to fetch result data");
      } finally {
        setLoading(false);
      }
    };

    fetchResultData();
  }, [studentId]);

  const generatePDF = async (data) => {
    if (typeof window !== "undefined" && componentRef.current && data) {
      try {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = componentRef.current;

        const opt = {
          margin: 1,
          filename: `student-result-${studentId}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: true,
          },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };

        await html2pdf().set(opt).from(element).save();
        if (onClose) onClose();
      } catch (err) {
        console.error("Error generating PDF:", err);
        setError("Failed to generate PDF");
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-lg">Generating PDF...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-lg text-red-600">{error}</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!resultData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg max-h-[90vh] overflow-auto">
        <div ref={componentRef} className="bg-white">
          <main className="pt-8">
            <section className="bg-white min-h-[600px] mx-auto py-5 px-2">
              <div className="flex justify-between items-center">
                <img
                  src={resultData.logo}
                  alt="School Logo"
                  className="w-20 h-20 object-contain"
                />
                <div className="text-center">
                  <h1 className="text-[#4F4F4F] font-bold">
                    FREMONT COLLEGE OF EDUCATION
                  </h1>
                  <p className="text-[12px] text-[#4F4F4F]">
                    No.5 Raymond Osuman Street, PMB 2191 Maitama, Abuja,
                    Nigeria.
                  </p>
                  <h2 className="text-[20px] font-bold text-[#4F4F4F]">
                    Post Graduate Diploma in Education
                  </h2>
                  <p className="text-[12px] text-[#4F4F4F] font-bold">
                    Student First Semester Statement Of Result
                  </p>
                </div>
                <img
                  src={resultData.profile_picture}
                  alt="Profile"
                  className="w-20 h-20 object-contain"
                />
              </div>

              <div className="flex justify-between px-3 my-8">
                <div>
                  <div>
                    <h2 className="font-bold text-[12px]">
                      Name:{" "}
                      <span className="font-medium ml-3 capitalize">
                        {`${resultData.data.surname} ${resultData.data.firstname}`}
                      </span>
                    </h2>
                  </div>
                  <div>
                    <h2 className="font-bold text-[12px]">
                      Level:{" "}
                      <span className="font-medium ml-4">
                        {resultData.data.level}
                      </span>
                    </h2>
                  </div>
                </div>

                <div>
                  <div>
                    <h2 className="font-bold text-[12px]">
                      Reg No:{" "}
                      <span className="font-medium ml-3">
                        {resultData.data.reg_no}
                      </span>
                    </h2>
                  </div>
                  <div>
                    <h2 className="font-bold text-[12px]">
                      Session:{" "}
                      <span className="font-medium ml-3">
                        {resultData.data.session}
                      </span>
                    </h2>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="bg-[#0D7590] text-white text-left">
                      <th className="p-2 text-[12px] w-[50px]">S/N</th>
                      <th className="p-2 text-[12px] w-[120px]">Course Code</th>
                      <th className="p-2 text-[12px] w-[250px]">
                        Course Title
                      </th>
                      <th className="p-2 text-[12px] w-[50px]">Unit</th>
                      <th className="p-2 text-[12px] w-[50px]">Grade</th>
                      <th className="p-2 text-[12px] w-[100px]">Total Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultData.data.result.map((course, index) => (
                      <tr
                        key={index}
                        className="border-b-[1px] border-[rgba(0,0,0,0.2)] odd:bg-[#F2F2F2]"
                      >
                        <td className="p-2 w-[50px]">{index + 1}</td>
                        <td className="p-2 w-[120px]">{course.coursecode}</td>
                        <td className="p-2 w-[250px]">{course.title}</td>
                        <td className="p-2 w-[50px]">{course.credit_unit}</td>
                        <td className="p-2 w-[50px]">{course.grade}</td>
                        <td className="p-2 w-[100px]">{course.total_point}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table className="w-full border-collapse table-fixed mt-7">
                  <thead>
                    <tr className="bg-[#0D7590] text-white text-left">
                      <th className="p-2 text-[12px]">Units</th>
                      <th className="p-2 text-[12px]">UntD</th>
                      <th className="p-2 text-[12px]">GPTs</th>
                      <th className="p-2 text-[12px]">GPTD</th>
                      <th className="p-2 text-[12px]">GPATs</th>
                      <th className="p-2 text-[12px]">GPATD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b-[1px] border-[rgba(0,0,0,0.2)] odd:bg-[#F2F2F2]">
                      <td className="p-2">
                        {resultData.data.cummulative.unts}
                      </td>
                      <td className="p-2">
                        {resultData.data.cummulative.untd}
                      </td>
                      <td className="p-2">
                        {resultData.data.cummulative.gpts}
                      </td>
                      <td className="p-2">
                        {resultData.data.cummulative.gptd}
                      </td>
                      <td className="p-2">
                        {resultData.data.cummulative.gpats}
                      </td>
                      <td className="p-2">
                        {resultData.data.cummulative.gpatd}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="font-medium mt-4">
                  Remarks:{" "}
                  <span className="text-[#0D7590]">
                    {resultData.data.cummulative.remarks}
                  </span>
                </p>

                <div className="mt-20">
                  <div className="w-[200px] h-[1px] bg-[rgba(0,0,0,0.5)]"></div>
                  <p className="text-[12px] font-medium mt-2">Registrar</p>
                </div>
              </div>
            </section>
          </main>
        </div>
        <button
          onClick={onClose}
          className="mt-4 py-2 px-4 bg-red-500 text-white rounded-md cursor-pointer hover:bg-red-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ResultPDF;
