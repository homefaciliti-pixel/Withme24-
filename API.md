# API Endpoint Specification

All REST endpoints require the header `Authorization: Bearer <JWT_ACCESS_TOKEN>` except authentication dispatch routes.

---

## 🔑 1. Authentication & Sessions

### `POST /api/auth/send-otp`
Sends a 6-digit verification code to the target mobile number.
* **Payload:**
  ```json
  {
    "mobile": "+919999999999"
  }
  ```
* **Response (Success):**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "mockOtp": "123456" // Returned in development sandbox
  }
  ```

### `POST /api/auth/verify-otp`
Validates the OTP and initializes a user session.
* **Payload:**
  ```json
  {
    "mobile": "+919999999999",
    "otp": "123456"
  }
  ```
* **Response (Success):**
  ```json
  {
    "success": true,
    "message": "OTP verified successfully",
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "isNewUser": false
  }
  ```

### `GET /api/auth/me`
Retrieves current user details.
* **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Arjun",
      "mobile": "+919999999999",
      "role": "COMPANION"
    }
  }
  ```

### `PUT /api/users/profile`
Updates current customer profile details.
* **Payload:**
  ```json
  {
    "name": "Arjun Kumar",
    "email": "arjun@example.com",
    "gender": "Male",
    "date_of_birth": "1995-10-15",
    "city_id": 1
  }
  ```

---

## 🎒 2. Companions Discovery & Settings

### `GET /api/companions`
Queries matching companion profiles.
* **Parameters:** `city_id` (optional), `activity_id` (optional), `date` (optional), `rating` (optional)
* **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "bio": "Explore the city with me!",
        "rating": "4.90",
        "total_reviews": 12,
        "user": {
          "name": "Sarah",
          "profile_photo": "/uploads/selfie_1.jpg"
        },
        "companion_activities": [
          {
            "price_per_hour": "500.00",
            "activity": { "name": "City Walk" }
          }
        ]
      }
    ]
  }
  ```

### `POST /api/companions/profile`
Edits the companion profile, bio details, and selected activities hourly pricing.
* **Payload:**
  ```json
  {
    "bio": "I am a local historian who loves showing people around heritage sites.",
    "experience": "3 years guiding heritage walks",
    "profile_visibility": "PUBLIC",
    "activities": [
      { "activity_id": 1, "price_per_hour": 600 }
    ]
  }
  ```

---

## 📅 3. Bookings

### `POST /api/bookings`
Initiates a social companionship session booking request. Locks availability slot.
* **Payload:**
  ```json
  {
    "companionId": 1,
    "activityId": 1,
    "availabilityId": 5
  }
  ```
* **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": 10,
      "booking_number": "WM-1725100000000-1234",
      "status": "PENDING",
      "total_amount": 590.00
    }
  }
  ```

---

## 💳 4. Payments

### `POST /api/payments/create-order`
Initializes a payment order wrapper.
* **Payload:**
  ```json
  {
    "booking_id": 10
  }
  ```

### `POST /api/payments/verify`
Verifies payment signatures and settles orders.
* **Payload:**
  ```json
  {
    "order_id": "order_123",
    "payment_id": "pay_123",
    "signature": "signature_123"
  }
  ```

---

## 📁 5. KYC Uploads

### `POST /api/kyc`
Uploads identity documents. Requires `multipart/form-data`.
* **Fields:** `document_type` (Aadhaar, Passport, DL), `document_front` (File), `document_back` (File, Optional), `selfie` (File)
