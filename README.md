# Realtime Attendance System - IITD
---

## 🚀 Quick Start

### Frontend (Expo/React Native)

```bash
cd frontend
npm install           # Install dependencies
npx expo start        # Start Expo dev server
```

- Open on **Web** by pressing `w`, on **Android** by pressing `a`, or **iOS** by pressing `i`.
- Main entry: `expo-router/entry` (see package.json).
- All screens/components live in `frontend/app` and `frontend/services`.

### Backend (Python)

```bash
cd backend
pip install -r requirements.txt
python app.py         # or python api_server.py, depending on your API entry point
```

- All logic is modularized:
  - `detection/`: Face detection modules
  - `embedding/`: Face embedding extraction
  - `supabase_utils/`: Cloud DB integration
  - `utils/`: Utility functions (drawing, similarity, etc.)
  - `test_images/`: Example/test images

---

## 📦 Project Structure

```
Realtime-Attendance-IITD/
├── backend/
│   ├── detection/
│   ├── embedding/
│   ├── supabase_utils/
│   ├── test_images/
│   ├── utils/
│   ├── app.py
│   ├── api_server.py
│   ├── config.py
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── app/            # All screens (admin, clock, face-verification, profile, etc.)
│   ├── services/       # API, Auth, Storage, Supabase logic
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── scripts/
│   ├── node_modules/
│   ├── app.json
│   ├── package.json
│   ├── .env
│   └── .gitignore
```

---

## 🛠️ Full Workflow

### 1. User Registration

- **Frontend:**  
  - User opens the app and navigates to "profile" or "face-verification" screen.
  - Takes/upload photo (uses `expo-camera`, `expo-image-picker`).
  - Photo + metadata sent to backend via API (`services/apiService.js`).
- **Backend:**  
  - Receives image, detects face, extracts embedding.
  - Stores user profile, embedding, and image path in Supabase.

### 2. Attendance Marking

- **Frontend:**  
  - Admin or user starts attendance scan.
  - Live camera feed processed (web/mobile) via appropriate screen.
- **Backend:**  
  - Receives frames, processes faces.
  - Matches embedding with stored users using cosine similarity.
  - Attendance marked (timestamp, user id/name) and logged in DB.

### 3. Reporting & Dashboard

- **Frontend:**  
  - Admin dashboard lists present/absent users, stats, and recent logs.
  - Export attendance (CSV/PDF) from dashboard UI.
- **Backend:**  
  - Provides endpoints for attendance reports, user lists, and analytics.

---

## 🖥️ Frontend Tech Highlights

- **Expo/React Native**: Cross-platform (web, Android, iOS).
- **Routing**: `expo-router`
- **UI**: `react-native-paper`, `@expo/vector-icons`
- **Camera/Image**: `expo-camera`, `expo-image-picker`
- **Auth/Storage**: Supabase (`@supabase/supabase-js`)
- **TypeScript/JS**: All logic and hooks
- **Main scripts** (from `package.json`):

  | Command           | Description                        |
  |-------------------|------------------------------------|
  | `npx expo start`  | Start dev server                   |
  | `npm run android` | Run on Android device/emulator     |
  | `npm run ios`     | Run on iOS device/emulator         |
  | `npm run web`     | Run in browser                     |
  | `npm run lint`    | Lint codebase                      |
  | `npm run reset-project` | Clean Expo state              |

---

## 🧑‍💻 Backend Tech Highlights

- **Python**: Core logic, face analysis, API
- **OpenCV/MTCNN/ArcFace**: Face detection & embedding
- **Supabase**: Cloud database, image storage
- **REST API**: Flask/FastAPI endpoints
- **.env**: All secrets and config keys

  **Main backend files:**
  - `app.py` or `api_server.py`: Main entry point
  - `detection/`, `embedding/`: ML modules
  - `supabase_utils/`: DB/image uploads
  - `utils/`: Drawing, similarity
  - `config.py`: Configuration

---

## 🗃️ Database Model

- **users**: id, name, embedding, image_path
- **attendance**: id, user_id, timestamp, camera_id

---

## 🔄 End-to-End Flow

1. **User opens app (Expo/React Native)**
2. **Registers face (photo/upload)**
3. **Face sent to backend, embedding generated & stored**
4. **Attendance scan initiated, live camera feed processed**
5. **Backend matches faces, logs attendance**
6. **Admin reviews/export attendance on dashboard**

---

## 📝 Contribution & License

MIT License – see [LICENSE](LICENSE)  
Open to issues & PRs!

---

## 💬 Support

- Issues: [GitHub Issues](https://github.com/VedantSinngh/Realtime-Attendance-IITD/issues)
- Contact: [Vedant Singh](https://www.linkedin.com/in/vedant-singh-iitd/)

---

## 🌟 Next Features

- Multi-camera support
- Liveness detection
- Push notifications
- Advanced analytics
- Mobile app publishing
