# 🚗 Snap & Report — AI Illegal Parking Reporter

<p align="center">
  <a href="https://snap-and-report-4q8hgism0-jainsagar00003-5829s-projects.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-Open%20App-blue?style=for-the-badge&logo=vercel" />
  </a>
</p>

---

## 🌍 Problem Statement

Illegal parking is a **major issue across India 🇮🇳** — causing traffic congestion, blocking emergency routes, and creating unsafe road conditions.

Even after reporting:

* ❌ Long manual complaint processes
* ⏳ Delayed resolution
* 🏢 Physical visits to police stations

👉 There was no **simple, digital, real-time solution**

---

## 💡 Solution

**Snap & Report** is a full-stack AI-powered system that:

* 📸 Lets citizens report violations instantly
* 🤖 Uses AI to detect number plates
* 👮 Routes reports to relevant officers
* 💰 Enables digital challan generation

---

## ⚙️ System Workflow

```text
User uploads vehicle image 📸
        ↓
Image stored on Cloudinary ☁️
        ↓
Backend sends image URL to ML API (HuggingFace)
        ↓
YOLOv8 + EasyOCR detect number plate 🤖
        ↓
Report saved in MongoDB 🗄️
        ↓
Assigned officer verifies 👮
        ↓
Challan generated 💰
```

---

## 🧠 AI / ML Pipeline

* 🤖 **YOLOv8** → Detects vehicle & plate region
* 🔍 **EasyOCR** → Extracts number plate text
* ☁️ **HuggingFace Spaces (Docker)** → ML deployment
* 🔗 Backend communicates via REST API

👉 Fully decoupled ML microservice architecture ⚡

---

## 👤 Citizen Features

* 📤 Upload violation images
* 📊 Track report status
* 📁 View history
* 📌 Dashboard insights

---

## 👮 Police Dashboard

* 📥 Zone-based report assignment
* 🔍 AI-assisted verification
* 💰 Issue challans
* 📊 Analytics dashboard

---

## 💸 Challan Management

* 📄 Generate challans
* 💰 Track payments
* 📥 Download PDF
* 📊 Revenue analytics

---

## 🔐 Authentication & Roles

| Role    | Capabilities        |
| ------- | ------------------- |
| Citizen | Report & track      |
| Officer | Verify & challan    |
| Admin   | Full system control |

---

## 🧱 Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/AI-YOLOv8-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/OCR-EasyOCR-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/ML%20Deployment-HuggingFace-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Cloudinary-Images-blueviolet?style=for-the-badge" />
</p>

---

## ☁️ Deployment Architecture

```text
Frontend → Vercel
Backend → Render
ML API → HuggingFace (Docker)
Database → MongoDB Atlas
```

---

## 🧪 Demo Credentials

| Role    | Email                                       | Password |
| ------- | ------------------------------------------- | -------- |
| Citizen | [citizen@demo.com](mailto:citizen@demo.com) | demo123  |
| Officer | [officer@demo.com](mailto:officer@demo.com) | demo123  |
| Admin   | [admin@demo.com](mailto:admin@demo.com)     | demo123  |

---

## 📦 Project Structure

```text
client/   → React frontend  
server/   → Node backend  
ml/       → FastAPI ML service  
```

---

## 🚀 Key Highlights

* 🔥 Full-stack + AI integration
* ⚡ Microservice architecture
* 🌐 Fully deployed system
* 🤖 Real-time ML inference
* 📊 Production-ready dashboards

---

## 🔮 Future Scope

* 📱 Mobile app (React Native)
* 🎥 CCTV integration
* 📍 Automatic GPS detection
* 🤖 Fully automated challans

---

## 👨‍💻 Author

**Sagar Jain**

<p align="center">
  <a href="https://github.com/YOUR_USERNAME">
    <img src="https://img.shields.io/badge/GitHub-Profile-black?style=for-the-badge&logo=github" />
  </a>
</p>

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
