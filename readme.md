# 📺 Video Tube – Backend Project

Video Tube is a backend service for a video-sharing platform built using **Node.js**, **Express.js**, and **MongoDB**.  
It provides RESTful APIs for user authentication, video management, engagement features (likes, comments), playlists, and subscriptions.

This project is designed with a **modular and scalable backend architecture**, following real-world backend development practices.

---

## 🚀 Features

- User authentication and authorization using **JWT**
- Secure password hashing with **bcrypt**
- Video upload and management APIs
- Like, comment, and subscription functionality
- Playlist creation and management
- Centralized error handling and request validation
- RESTful API design suitable for frontend integration

---

## 🛠 Tech Stack

- **Backend:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB (Mongoose)  
- **Authentication:** JSON Web Tokens (JWT)  
- **Security:** bcrypt  
- **API Style:** REST

---

## 📁 Project Structure

```text
src/
├── controllers/      # Business logic for APIs
├── models/           # Mongoose schemas
├── routes/           # API routes
├── middleware/       # Authentication & error handling
├── config/           # Database and environment configuration
└── index.js          # Application entry point

