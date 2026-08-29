import React, { useRef, useState } from "react";

const File = () => {
  const [fileName, setFileName] = useState("No file selected");
  const fileInputRef = useRef(null);

  const handleRemove = () => {
    setFileName("No file selected");

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id="uploadFile"
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            setFileName(e.target.files[0].name);
          }
        }}
      />

      {/* Upload Button */}
      <label
        htmlFor="uploadFile"
        className="cursor-pointer rounded-2xl border-2 border-dashed border-emerald-600 px-30 py-20 text-emerald-500 hover:emerald-600 hover:text-white transition"
      >
        Upload Document
      </label>

      {/* File Name */}
      <p className="text-sm text-gray-700">{fileName}</p>

      {/* Remove Button (shows only if a file is selected) */}
      {fileName !== "No file selected" && (
        <button
          onClick={handleRemove}
          className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
        >
          Remove File
        </button>
      )}
    </div>
  );
};

export default File;