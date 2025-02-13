# 🎥 MiniFlicks – Private Theatre Booking Platform  

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)  
🌐 **Live Website**: [MiniFlicks.in](https://miniflicks.in)  

## 📸 Screenshots  

<div align="center">
  <img src="https://github.com/mani254/miniflicks/blob/main/frontend/public/Outputs/homepage.png" alt="Screenshot 1" width="300"/>
  <img src="https://github.com/mani254/miniflicks/blob/main/frontend/public/Outputs/booking.png" alt="Screenshot 2" width="300"/>
  <img src="https://github.com/mani254/miniflicks/blob/main/frontend/public/Outputs/admin%20page.png" alt="Screenshot 3" width="300"/>
</div>

---

<div align="center">
  <p><strong>Preview: </strong> <a href="https://miniflicks.in">Visit MiniFlicks</a></p>
</div>

---

## 🚀 Technologies Used  

<div align="center">
  <img src="https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/-Redux-764ABC?logo=redux&logoColor=white" alt="Redux" />
  <img src="https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/-Express.js-000000?logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
</div>  

---

## 📖 Description  

**MiniFlicks** is a fully functional, **customizable**, and **scalable** private theatre booking platform. It allows users to book private screenings at various locations while providing powerful analytics and management features for **admins and super admins**.  

### 🎯 **Key Features**  

✅ **Multi-Branch & Multi-City Support** – Manage multiple locations seamlessly  
✅ **Super Admin Dashboard** – Graphical sales analytics for all branches  
✅ **Branch-Level Admins** – Separate admins for each branch  
✅ **Coupons & Discounts** – Customizable promotional offers  
✅ **Add-ons & Gifts** – Extra perks for users  
✅ **Booking Analytics** – Filter and track bookings from date to date  
✅ **Automated Emails** – Review emails & **reminder emails after 1 year**  
✅ **Payment Gateway Integration** – Secure and seamless transactions  
✅ **Responsive & Clean UI** – Optimized experience for admins & users  

---

## 🛠 Installation & Execution  

### **1️⃣ Clone the Repository**  

```bash
git clone https://github.com/your-username/miniflicks.git
```

### **2️⃣ Instal Dependencies **

```bash
cd frontend
npm install
```

```bash
cd backend
npm install
```
### **3️⃣ add .env files **

Backend

``` bash
# Environment Variables for MiniFlicks

# Frontend and Backend URIs
FRONTENDURI="http://localhost:5173"
BACKENDURI="http://localhost:8080"

# MongoDB Connection String
MONGODB_URI='mongodb+srv://username:password@cluster.mongodb.net/miniflicks?retryWrites=true&w=majority'

# Server Port
PORT=8080

# JWT Secret Key
JWT_SECRET='random_jwt_secret_key'

# Razorpay API Keys (Test Mode)
RAZORPAY_KEY_ID="rzp_test_randomKey123"
RAZORPAY_KEY_SECRET="randomSecretKey456"

# SendinBlue API Key
SIB_API_KEY="xsmtpsib-randomapikey-1234567890abcdef"
```
frontend

```bash
VITE_APP_BACKENDURI='http://localhost:8080'
VITE_APP_FRONTENDURI='http://localhost:5173'

VITE_RAZORPAY_KEY_ID="rzp_test_randomKey123"
```

### **Run the files finally **
```bash
cd frontend
npm run dev
```

```bash
cd backend
npm run dev
```




