# To-Do List of the To-Do List for Upload Gift Upload, Admin Gift Upload, Admin Gift Upload

This file is dedicated to tracking and analyzing issues related to the gift upload process in the Admin Dashboard.

## 🚨 Current Issues & Observations
- **Root Cause Identified:** Missing Firebase Storage rules. The frontend logic is correct, but uploads are blocked by default locked permissions.
- **Error Symptom:** "Failed to upload gift image" due to `FirebaseError: Firebase Storage: User does not have permission`.
- **Missing Configuration:** No `storage.rules` file exists in the project.

## 🛠 Technical Context
- **Storage Path:** `gifts/` in Firebase Storage.
- **Database:** `gifts` collection in Firestore.
- **Component:** `src/pages/AdminDashboardPage.tsx` -> `handleGiftUpload`.
- **Admin Email:** `rogershep101@gmail.com`

## 📝 Analysis & Action Items
- [ ] **Step 1: Storage Rules Implementation**
    - Deploy `storage.rules` to allow public read but restrict write to the admin email.
- [ ] **Step 2: Frontend Enhancements**
    - Add image preview before upload.
    - Implement file type validation (images only).
    - Implement file size validation (max 2MB).
- [ ] **Step 3: Firestore Integration**
    - Ensure `addDoc` includes `name`, `price`, `image` (URL), and `createdAt` (serverTimestamp).
- [ ] **Step 4: Admin Security**
    - Verify admin check matches `rogershep101@gmail.com`.

## 🚀 Proposed Implementation Strategy (The "Full Fixed System")

### 1. Storage Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gifts/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.token.email == "rogershep101@gmail.com";
    }
  }
}
```

### 2. Firestore Rules Update
```javascript
match /gifts/{docId} {
  allow read: if true;
  allow write: if request.auth != null &&
    request.auth.token.email == "rogershep101@gmail.com";
}
```

### 3. Component Logic Improvements
- Use `URL.createObjectURL(file)` for instant preview.
- Wrap upload in a robust `try/catch` with detailed error logging.
- Reset form state after successful upload.
