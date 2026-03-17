# 🚗 Snap & Report — AI Illegal Parking Reporter

> 🚀 Making Indian roads smarter with AI-powered violation reporting

---

## 🌍 Problem Statement

Illegal parking is a **major issue across India 🇮🇳** — causing traffic congestion, blocking emergency routes, and creating unsafe road conditions.

Even after reporting:

* ❌ Citizens must go through **long manual processes**
* ⏳ Complaints take **too long to resolve**
* 🏢 Often requires visiting **police stations physically**

👉 There was no **simple, digital, real-time solution**

---

## 💡 Our Solution

**Snap & Report** is an AI-powered platform where:

* 👤 Citizens can report illegal parking instantly
* 👮 Police officers can verify and take action digitally
* 🤖 AI automates number plate detection
* 📍 Location-based routing ensures correct officer assignment

---

## ⚙️ System Workflow

```text
User uploads vehicle image 📸
        ↓
AI detects number plate (YOLOv8 + EasyOCR)
        ↓
User provides location / GPS 📍
        ↓
Report routed to respective zone officer 👮
        ↓
Officer verifies → sets challan amount 💰
        ↓
Report status:
   • Pending ⏳
   • Approved & Challan Issued ✅
   • Rejected ❌
```

---

## 🧠 AI Integration (Core Highlight)

* 🤖 **YOLOv8** → Detects vehicle and plate region
* 🔍 **EasyOCR** → Extracts number plate text
* 📍 Location-based mapping → Assigns correct police zone

👉 Reduces manual effort and speeds up enforcement ⚡

---

## 👤 Citizen Portal

* 📤 Upload illegal parking reports
* 📊 View all submitted reports
* 📌 Track report status (Pending / Verified / Challan Issued)
* 📁 Personal dashboard with report history

---

## 👮 Police Dashboard

* 📥 Receive reports based on zone
* 🔍 Verify violations with AI-detected plate
* 💰 Set challan amount
* 📊 Dashboard shows:

  * Total reports
  * Pending cases
  * Verified cases
  * Challans issued

👉 Full workflow management in one place

---

## 💸 Challan Management System

* 📄 Generate challan records
* 💰 Track:

  * Amount collected
  * Pending payments
* 📥 Download challan PDF
* 📊 Real-time analytics

---

## 🔐 Role-Based Access System

| Role    | Capabilities                     |
| ------- | -------------------------------- |
| Citizen | Report violations & track status |
| Officer | Verify reports & issue challans  |
| Admin   | Full system control              |

---

## 🧱 Tech Stack

**Frontend**

* React.js + Tailwind CSS + Vite

**Backend**

* Node.js + Express.js
* MongoDB Atlas

**AI / ML**

* YOLOv8
* EasyOCR
* FastAPI

**Other Tools**

* Cloudinary (image storage)
* JWT Authentication

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
server/   → Node.js backend  
ml/       → AI detection service  
```

---

## 🚀 Why This Project Stands Out

* ✅ Solves a **real-world civic problem**
* 🤖 Combines **AI + Full Stack Development**
* 🔄 End-to-end system (Report → Verify → Challan)
* 📊 Real-time dashboards for both users and police
* ☁️ Cloud-ready architecture

---

## 🔮 Future Scope

* 📱 Mobile application
* 🎥 Live camera detection
* 📍 Automatic GPS tracking
* 🤖 Fully automated challan system

---

## 👨‍💻 Author

**Sagar Jain**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
