# API Observations & Backend Service Design

This document covers the observed network architecture of Excalidraw and details the REST API specifications for our Node.js / Express.js backend.

---

## 1. Excalidraw's Publicly Observable Network Behaviors

### 1.1 Offline-First Architecture
When using `https://excalidraw.com/`:
- **Static Asset Caching:** A Service Worker caches core JS, CSS, and font bundles, allowing the app to run entirely disconnected from the web.
- **Client-Side Persistence:** Active drawings are written to browser `localStorage` and `IndexedDB` on every stroke. No mandatory server communication occurs during drawing.

### 1.2 Encrypted Link Sharing Model
When a user clicks "Share" to generate a shareable URL:
1. Client generates a random cryptographic AES-GCM key in browser memory.
2. The drawing JSON is encrypted client-side using this key.
3. The resulting ciphertext is sent via HTTP `POST` to Excalidraw's storage API (e.g., `https://json.excalidraw.com/api/v2/post/`).
4. Server returns a document ID.
5. The URL is structured as: `https://excalidraw.com/#json=<ID>,<KEY>`.
6. **Zero-Knowledge Property:** Because the encryption key is in the URL hash fragment (`#`), it is never transmitted in HTTP request headers or server logs. When a recipient opens the link, client JS extracts the key and decrypts the fetched ciphertext.

---

## 2. Reconstruction REST API Specification (Node.js + Express)

To fulfill the project requirements without unnecessary cloud dependencies or encryption overhead, our local Express.js backend will provide clean RESTful endpoints for drawing management with JSON file persistence.

### 2.1 Backend Architecture Overview
- **Runtime:** Node.js (v26 LTS) + Express.js (v4 / v5)
- **Directory Structure:**
  ```text
  backend/
  ├── package.json
  ├── server.js               (Express app bootstrap, middleware, error handler)
  ├── .env.example
  ├── routes/
  │   └── drawingRoutes.js    (Route endpoint definitions)
  ├── controllers/
  │   └── drawingController.js(Request validation & HTTP orchestration)
  ├── services/
  │   └── drawingService.js   (File system read/write JSON persistence logic)
  └── data/
      └── drawings/           (JSON storage directory)
  ```
- **Persistence:** Local JSON flat files stored in `backend/data/drawings/{id}.json`. Metadata index dynamically computed or indexed for high speed, avoiding heavy database dependencies like MySQL unless explicitly requested.

---

## 3. API Endpoints Specification

### 3.1 Health Check
- **`GET /api/health`**
  - **Description:** Verifies backend connectivity and system health.
  - **Response `200 OK`:**
    ```json
    {
      "status": "ok",
      "timestamp": "2026-11-03T13:40:00.000Z",
      "uptime": 12.4
    }
    ```

---

### 3.2 List All Drawings
- **`GET /api/drawings`**
  - **Description:** Returns an array of saved drawings with summary metadata.
  - **Response `200 OK`:**
    ```json
    {
      "success": true,
      "count": 2,
      "data": [
        {
          "id": "draw_1730000000_abc1",
          "name": "System Architecture Diagram",
          "elementCount": 14,
          "createdAt": "2026-11-03T10:00:00.000Z",
          "updatedAt": "2026-11-03T10:30:00.000Z"
        }
      ]
    }
    ```

---

### 3.3 Create / Save Drawing
- **`POST /api/drawings`**
  - **Description:** Saves a new drawing payload to disk.
  - **Request Headers:** `Content-Type: application/json`
  - **Request Body:**
    ```json
    {
      "name": "Flowchart Draft",
      "elements": [
        {
          "id": "elem_1",
          "type": "rectangle",
          "x": 100,
          "y": 100,
          "width": 200,
          "height": 100,
          "strokeColor": "#1e1e1e"
        }
      ],
      "appState": {
        "viewBackgroundColor": "#ffffff",
        "zoom": 1
      }
    }
    ```
  - **Validation Rules:**
    - `name`: string, optional (defaults to "Untitled Drawing"), max 100 chars.
    - `elements`: array, required.
    - `appState`: object, optional.
  - **Response `201 Created`:**
    ```json
    {
      "success": true,
      "message": "Drawing saved successfully",
      "data": {
        "id": "draw_1730000000_xyz9",
        "name": "Flowchart Draft",
        "elementCount": 1,
        "createdAt": "2026-11-03T10:35:00.000Z",
        "updatedAt": "2026-11-03T10:35:00.000Z"
      }
    }
    ```

---

### 3.4 Get Drawing by ID
- **`GET /api/drawings/:id`**
  - **Description:** Retrieves the full drawing data (including all elements and state) for canvas rendering.
  - **Response `200 OK`:**
    ```json
    {
      "success": true,
      "data": {
        "id": "draw_1730000000_xyz9",
        "name": "Flowchart Draft",
        "elements": [ ... ],
        "appState": { ... },
        "createdAt": "2026-11-03T10:35:00.000Z",
        "updatedAt": "2026-11-03T10:35:00.000Z"
      }
    }
    ```
  - **Response `404 Not Found`:**
    ```json
    {
      "success": false,
      "error": "Drawing not found"
    }
    ```

---

### 3.5 Update Drawing
- **`PUT /api/drawings/:id`**
  - **Description:** Updates drawing elements, name, or state.
  - **Response `200 OK`:**
    ```json
    {
      "success": true,
      "message": "Drawing updated successfully",
      "data": { ... }
    }
    ```

---

### 3.6 Delete Drawing
- **`DELETE /api/drawings/:id`**
  - **Description:** Removes the drawing record and deletes the corresponding JSON file.
  - **Response `200 OK`:**
    ```json
    {
      "success": true,
      "message": "Drawing deleted successfully"
    }
    ```

---

## 4. Security & Error Handling Standards
- **CORS Configuration:** Allows cross-origin requests from frontend `http://localhost:3000`.
- **Input Sanitization:** Strips path traversal characters from `:id` parameters (`id.replace(/[^a-zA-Z0-9_-]/g, '')`) to guarantee file operations cannot escape the designated storage directory.
- **Centralized Error Handler:** Catches all uncaught exceptions and async errors, returning structured JSON error responses rather than unhandled promise rejections.

