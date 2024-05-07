const express = require("express");
const fileUpload = require("express-fileupload");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5669;

app.use(cors());
app.use(fileUpload());
app.use(express.static("public")); // Serve static files

// Ensure the base directory for uploads and extracts exists
const baseDir = path.join(__dirname, "public");
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

function findIndexHtml(dir) {
  const files = fs.readdirSync(dir);
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(dir, files[i]);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const result = findIndexHtml(filePath);
      if (result) return result;
    } else if (files[i] === "index.html") {
      return filePath.replace(baseDir, "");
    }
  }
  return null;
}

app.post("/upload", (req, res) => {
  if (!req.files || !req.files.zipFile) {
    return res.status(400).send({ message: "No files were uploaded." });
  }

  const zipFile = req.files.zipFile;
  const timestamp = Date.now();
  const uploadPath = path.join(
    baseDir,
    "uploads",
    `${timestamp}-${zipFile.name}`
  );

  // Ensure the uploads directory exists
  if (!fs.existsSync(path.dirname(uploadPath))) {
    fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
  }

  zipFile.mv(uploadPath, function (err) {
    if (err) {
      console.error("Failed to move file:", err);
      return res.status(500).send({ message: "Failed to save the file." });
    }

    const zip = new AdmZip(uploadPath);
    const extractPath = path.join(baseDir, `extract-${timestamp}`);
    zip.extractAllTo(extractPath, true);

    const indexPath = findIndexHtml(extractPath);
    res.send({ indexPath });
  });
});

app.listen(port, () => {
  console.log(`Server running on https://panoapi.jcloudwork.com:${port}`);
});
