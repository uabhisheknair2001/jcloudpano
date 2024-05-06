import React, { useState } from "react";
import axios from "axios";
import "./Upload.css"; // Make sure this CSS is set up to style the new elements properly.
import logo from "../Assets/logo.png";

function Upload() {
  const [file, setFile] = useState(null);
  const [indexPath, setIndexPath] = useState(null);

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
    setIndexPath(null); // Reset index path on new file selection
  };

  const onFileUpload = () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("zipFile", file);

    axios
      .post("https://panoapi.jcloudwork.com/upload", formData)
      .then((response) => {
        setIndexPath(response.data.indexPath);
      })
      .catch((error) => {
        console.error("Error uploading file: ", error);
        alert("Error uploading file: " + error.message);
      });
  };

  return (
    <div className="upload-container">
      <div className="company-header">
        <img src={logo} alt="Company Logo" className="company-logo" />
        <h1 className="company-name">Jcloudwork</h1>
      </div>
      <h2 className="upload-header">Upload a ZIP File</h2>
      <div className="file-input-container">
        <input type="file" onChange={onFileChange} />
        <button onClick={onFileUpload}>Upload!</button>
      </div>
      {indexPath && (
        <button
          onClick={() =>
            window.open(`https://panoapi.jcloudwork.com${indexPath}`, "_blank")
          }
        >
          Click to view
        </button>
      )}
    </div>
  );
}

export default Upload;
