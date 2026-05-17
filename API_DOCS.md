# Lab Viah (RishtaAI) API Documentation

This document outlines the required REST API endpoints, methods, and JSON data structures needed to power the Lab Viah (RishtaAI) frontend application.

---

## 1. Authentication

### 1.1 Send OTP
Initiates phone number verification.
* **Endpoint**: `/api/v1/auth/send-otp`
* **Method**: `POST`

**Request Body:**
```json
{
  "phoneNumber": "+923001234567"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "OTP sent successfully."
}
```

### 1.2 Verify OTP
Verifies the code and returns an auth token.
* **Endpoint**: `/api/v1/auth/verify-otp`
* **Method**: `POST`

**Request Body:**
```json
{
  "phoneNumber": "+923001234567",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "token": "jwt_token_string",
  "user": {
    "id": "usr_123",
    "isProfileComplete": false,
    "hasTwin": false
  }
}
```

---

## 2. Profile Management

### 2.1 Save / Update Profile
Saves the user's demographic and background details.
* **Endpoint**: `/api/v1/profile`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "Ayesha Khan",
  "gender": "Female",
  "age": 25,
  "height": "5'6\"",
  "city": "Islamabad",
  "profession": "Software Engineer",
  "education": "MSc Computer Science",
  "preferences": {
    "ageRange": "26-30",
    "height": "5'10\"+",
    "physique": "Average",
    "location": "Islamabad or Abroad"
  }
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Profile updated successfully.",
  "profileId": "prof_123"
}
```

---

## 3. AI Twin Creation

### 3.1 Forge Twin
Processes voice input text and scenario answers to generate the AI Twin JSON representation.
* **Endpoint**: `/api/v1/twin/forge`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "voiceIntroductionTranscript": "Family is very important to me. I want someone who respects boundaries and is focused on Deen.",
  "isWaliModeEnabled": true,
  "scenarios": [
    { "scenarioId": "career_vs_family", "choice": "FAMILY" },
    { "scenarioId": "financial_independence", "choice": "SEPARATE" },
    { "scenarioId": "conflict_resolution", "choice": "RESOLVE NOW" }
  ]
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "twin": {
    "twinId": "twin_123",
    "summary": "Values family proximity over career relocation. Prefers financial independence and immediate conflict resolution. Religious alignment is non-negotiable.",
    "weights": {
      "deen": 0.9,
      "family": 0.95,
      "career": 0.6,
      "finances": 0.8
    }
  }
}
```

---

## 4. Discovery & Matches

### 4.1 Get Match Pool
Retrieves highly compatible AI-curated matches.
* **Endpoint**: `/api/v1/matches`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "status": "success",
  "matches": [
    {
      "matchId": "match_abc",
      "displayName": "Ahmed M.",
      "blurAvatarUrl": "https://example.com/avatar-blurred.jpg",
      "compatibilityScore": 94,
      "tags": ["Software Engineer", "Family-oriented", "Islamabad"]
    }
  ]
}
```

### 4.2 Start AI Debate
Initiates the automated twin-to-twin negotiation. *Note: In production, this might be a Server-Sent Events (SSE) endpoint or WebSocket for streaming text.*
* **Endpoint**: `/api/v1/debate/start`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "targetMatchId": "match_abc"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "debateId": "deb_123",
  "messages": [
    { "speaker": "Moderator", "text": "Initiating deep value negotiation regarding finances." },
    { "speaker": "Ahmed's Twin", "text": "Ahmed believes in joint accounts for transparency." },
    { "speaker": "Your Twin", "text": "I respect that, but prefer maintaining a separate savings buffer." }
  ]
}
```

### 4.3 Get Compatibility Report
Fetches the post-debate 8-dimension score report.
* **Endpoint**: `/api/v1/report/:matchId`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "status": "success",
  "overallScore": 94,
  "dimensions": {
    "deen": 95,
    "family": 98,
    "career": 85,
    "finances": 70,
    "kids": 90,
    "conflict": 88,
    "geography": 100,
    "boundaries": 92
  },
  "frictionPoint": "Slight misalignment on financial accounts; Ahmed prefers joint, you prefer separate. Manageable with open communication."
}
```

---

## 5. Meetings & Scheduling

### 5.1 Fetch Available Slots
* **Endpoint**: `/api/v1/booking/slots`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "status": "success",
  "slots": [
    { "slotId": "slot_1", "date": "2026-06-01T18:00:00Z", "type": "Virtual" },
    { "slotId": "slot_2", "date": "2026-06-02T14:00:00Z", "type": "In-Person", "location": "Gloria Jeans, F-11" }
  ]
}
```

### 5.2 Confirm Booking
* **Endpoint**: `/api/v1/booking`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "matchId": "match_abc",
  "slotId": "slot_1"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "meetingId": "meet_123",
  "meetingUrl": "https://labviah.app/meet/123",
  "message": "Meeting scheduled successfully."
}
```

---

## 6. Post-Meeting & Safety

### 6.1 Submit Feedback Survey
Calibrates the AI Twin based on meeting results.
* **Endpoint**: `/api/v1/feedback`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "meetingId": "meet_123",
  "ratings": {
    "chemistry": 4,
    "values": 5,
    "twinAccuracy": 4
  },
  "privateNotes": "Great conversation, but need to discuss career goals more."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Twin recalibrated based on feedback."
}
```

### 6.2 File Dispute
Submits an issue regarding a match for safety blocking.
* **Endpoint**: `/api/v1/dispute`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "matchId": "match_abc",
  "category": "Misrepresentation",
  "details": "Age stated on profile does not match reality."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "action": "User blocked and flagged for review."
}
```

---

## 7. Wali (Guardian) Dashboard

### 7.1 Get Pending Approvals
Retrieves matches waiting for Wali approval.
* **Endpoint**: `/api/v1/wali/pending`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <wali_token>`

**Response (200 OK):**
```json
{
  "status": "success",
  "pendingMatches": [
    {
      "matchId": "match_abc",
      "applicantName": "Ahmed M.",
      "compatibilityScore": 94,
      "agentBrief": "Ahmed comes from a respectable family in Lahore. He holds an engineering degree and works stably. Very strong alignment on family values."
    }
  ]
}
```

### 7.2 Approve / Reject Match
* **Endpoint**: `/api/v1/wali/action`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <wali_token>`

**Request Body:**
```json
{
  "matchId": "match_abc",
  "action": "APPROVE" // or "REJECT"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Approval recorded. The match can now schedule a meeting."
}
```
