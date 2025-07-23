# 📁 FlexShare – File Upload & Image Conversion API

This project is a **backend API** built with **Node.js** and **Express** that allows users to:

- 📤 **Upload image files** (e.g., JPG, PNG)  
- 🧠 **Convert and resize** them using `Sharp`  
- ☁️ **Upload the processed image to Cloudinary**  
- 🔗 Return a **public URL** to access the image  

---

## ⚙️ Tech Stack

- **Express** – API framework  
- **Multer** – File upload middleware  
- **Sharp** – Image processing  
- **Cloudinary** – Image hosting  
- **Dotenv** – Environment variable management  

---

## ✅ Currently Supports

> ⚠️ _Limitations are intentionally set to avoid memory overflow on deployment environments like Render or Vercel._

- ✅ **File types**: `.jpg`, `.jpeg`, `.png`  
- ✅ **Max image size**: `2MB`  
- ✅ **Single image upload at a time**  
- ✅ **Image resizing + conversion**  
- ✅ **Temporary file auto-cleanup**  

---

## 📌 Use Case

You can integrate this API with:

- Frontend image upload forms  
- Drag-and-drop uploaders  
- File-sharing apps  
- Image compression tools  

---

## 🔄 Workflow

1. Client sends `multipart/form-data` with an image file.  
2. Image is uploaded and validated using **Multer**.  
3. **Sharp** converts/resizes the image.  
4. Final image is uploaded to **Cloudinary**.  
5. API responds with a JSON containing the **Cloudinary URL**.  

---

## ⚠️ Current Limitations & Notes

> ✅ **Currently supports only image files (JPG, PNG)**  
> ⚠️ **Upload size limit: 10MB**  
> 🔧 **PDF support is currently in development**

---
