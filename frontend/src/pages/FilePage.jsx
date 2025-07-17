import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function FilePage() {
  const { code } = useParams();
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios
      .get(`https://flexshare.onrender.com/api/file/${code}`)
      .then((res) => setFile(res.data))
      .catch((err) => console.error(err));
  }, [code]);

  if (!file) return <p className="p-4">Loading or file not found...</p>;

  const { fileUrl, description } = file;
  // const createdDate = new Date(expiry).toLocaleDateString("en-US", {
  //   month: "short",
  //   day: "numeric",
  //   year: "numeric",
  // });

  const filename = fileUrl.split("/").pop().split("?")[0];

  return (
    <div className="p-8 bg-[#0c0a09] h-screen">
      <div className="bg-[#171717] rounded-xl overflow-hidden w-[286px]">
        {/* Preview thumbnail */}
        <div className="h-[200px] w-full overflow-hidden">
          <img
            src={fileUrl}
            alt="preview"
            className="w-full h-full object-cover"
          />
        </div>

        {/* File info */}
        <div className="p-4">
          <p className="font-medium text-[#e5e7eb]">{filename}</p>
          <p className="text-[#a8a29e] text-sm mb-2">
            {description || "No description provided"}
            </p>
          <div className="flex items-center justify-between border-[#2e2e2e] text-xs border-t pt-2">
            <p className="text-[#a8a29e]">Expiry: <span className="text-red-900">1 hour</span></p>
            <a
              href={fileUrl}
              download
              className="hover:text-gray-800 transition"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  color="orangered"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
