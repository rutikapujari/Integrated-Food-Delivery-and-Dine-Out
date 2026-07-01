const { v2: cloudinary } = require("cloudinary");
const AWS = require("aws-sdk");
const path = require("path");
const fs = require("fs");

const configureCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn(
      "Cloudinary env vars are not set. Cloudinary uploads will be unavailable until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are provided."
    );
    return false;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  return true;
};

const uploadToCloudinary = (fileBuffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });

const uploadToS3 = async (fileBuffer, key) => {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } = process.env;

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !S3_BUCKET) {
    throw new Error("AWS S3 environment variables are required for S3 uploads");
  }

  const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
    signatureVersion: 'v4',
  });

  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: "image/jpeg",
    ACL: "public-read",
  };

  const result = await s3.upload(params).promise();
  return result;
};

const uploadToLocal = async (fileBuffer, folder, filename) => {
  const uploadsDir = path.join(__dirname, "..", "uploads", folder);
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filePath, fileBuffer);
  return filePath;
};

const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const provider = (process.env.STORAGE_PROVIDER || "cloudinary").toLowerCase();

    const allowedFolders = ["restaurants", "menu", "profiles"];
    const folder = allowedFolders.includes(req.body.folder) ? req.body.folder : "general";

    const originalName = req.file.originalname || "upload.jpg";
    const filename = `${Date.now()}_${sanitizeFilename(originalName)}`;

    if (provider === "cloudinary") {
      const ok = configureCloudinary();
      if (!ok) {
        console.warn("Falling back to local storage because Cloudinary is not configured.");
      } else {
        const result = await uploadToCloudinary(req.file.buffer, `food-delivery/${folder}`);
        return res.status(201).json({ success: true, url: result.secure_url, publicId: result.public_id });
      }
    }

    if (provider === "s3") {
      const key = `food-delivery/${folder}/${filename}`;
      const result = await uploadToS3(req.file.buffer, key);
      return res.status(201).json({ success: true, url: result.Location, key: result.Key });
    }

    // fallback to local
    const savedPath = await uploadToLocal(req.file.buffer, folder, filename);
    const relative = path.relative(path.join(__dirname, ".."), savedPath).replace(/\\/g, "/");

    return res.status(201).json({ success: true, path: `/${relative}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadImage,
};
