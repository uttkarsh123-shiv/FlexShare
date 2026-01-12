import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import Accordion from "./Accordion"
import Card from "./Card";
import { RxLoop } from "react-icons/rx";
import { MdOutlineSecurity } from "react-icons/md";
import { FaFileAlt } from "react-icons/fa";
import { TfiLoop } from "react-icons/tfi";
import Footer from "./Footer";

export default function HomePage() {
  const [code, setCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="p-8 text-center h-[65vh] w-screen bg-[#0c0a09] text-white pt-40">
        <h1 className="text-7xl font-bold mb-6 instrument-serif-regular leading-10">
          Share Smarter. Convert Faster.
        </h1>
        <p className="text-[18px] text-[#a8a29e]">
          {" "}
          Convert & share files in seconds. No sign-up needed.
        </p>
        <div className="btn-group mt-10">
          <button
            onClick={() => navigate("/upload")}
            className="border border-orange-600 text-white px-5 py-2 rounded mr-4"
          >
            Upload
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded"
          >
            Enter Code
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#171717] p-6 rounded shadow w-[40vw] h-[40vh] flex flex-col items-center">
              <h2 className="text-2xl mb-8 mt-4">Enter Code</h2>
              <OtpInput
                value={code}
                onChange={setCode}
                numInputs={6}
                inputStyle={{
                  width: "40px",
                  height: "50px",
                  border: "1px solid #ccc",
                  fontSize: "20px",
                  textAlign: "center",
                  borderRadius: "8px",
                  margin: "8px",
                }}
                renderInput={(props) => <input {...props} />}
              />
              <div className="mt-8 flex gap-5">
                <button
                  onClick={() => navigate(`/file/${code}`)}
                  className="bg-orange-800 hover:bg-orange-600 text-white px-5 py-2 rounded mr-2"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded border border-orange-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-around px-45">
        <Card
          title="Instant File Conversion"
          description="Upload any file and get it converted in seconds — no sign up needed"
          icon={TfiLoop}
        />
        <Card
          title="Privacy-Focused"
          description="Your files are never stored. Everything runs on your device or temporary memory."
          icon={MdOutlineSecurity}
        />
        <Card
          title="Multiple Formats Supported"
          description="Convert between Word, PDF, PNG, JPG — and more coming soon."
          icon={FaFileAlt}
        />
      </div>

     <Accordion />
     <Footer />
    </>
  );
}
