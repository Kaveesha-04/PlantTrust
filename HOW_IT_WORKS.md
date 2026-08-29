# How PlantTrust Works

This document explains the architecture and flow of the PlantTrust Proof of Concept (PoC) in simple terms.

## The Big Picture
PlantTrust is a **Digital Trust system**. The goal is to take a physical document (like a land deed), read its contents, and secure a "fingerprint" of that document on a public blockchain so that nobody can ever tamper with it or claim they have a different version.

The app is split into two main pieces:
1. **The Frontend (Client):** The React user interface you see in your browser.
2. **The Backend (Server):** The Express engine room that does the heavy lifting.

---

## Step-by-Step: What Happens When You Upload a Document?

### 1. The Frontend (React)
When you go to `http://localhost:5173`, you are looking at the React application (inside the `client` folder).
* **What it does:** It provides the drag-and-drop box. When you select an image, React packages that file into an HTTP request and sends it to the Backend server.
* **The Code:** Handled in `client/src/components/FileUpload.jsx`.

### 2. The Backend Server (Express)
Your backend is running on `http://localhost:3001` (inside the `server` folder).
* **What it does:** It receives the image from React and acts as a traffic cop (`index.js`). It passes the image to the specific route (`routes/deed.js`) which acts as an assembly line.

### 3. Reading the Text (OCR)
* **What it does:** The server uses **Tesseract.js**. Tesseract scans the pixels of the image, looks for English letters, and spits out the actual text (e.g., "Deed of Trust...").
* **Key Commands:**
  * `createWorker("eng")`: Boots the engine.
  * `worker.recognize(imagePath)`: Scans the image.

### 4. Creating a Fingerprint (Hashing)
* **What it does:** It takes the extracted text and runs it through the **SHA-256** mathematical algorithm. This generates a unique string of 64 characters. If you change even one comma in the document, the hash changes completely.

### 5. Anchoring to the Blockchain (XRPL)
* **What it does:** The server connects to the **XRP Ledger (XRPL) Testnet**. It creates a transaction that attaches the 64-character hash as a "Memo". When the blockchain accepts this, the fingerprint is permanently recorded.
* **Key Commands:**
  * `new xrpl.Client(...)`: Connects to the network.
  * `client.fundWallet()`: Gets a free testing wallet with fake XRP.
  * `client.submitAndWait(...)`: Sends the transaction to the network and waits for the official receipt (TxHash).

### 6. Saving the Records (PostgreSQL Database)
* **What it does:** The server connects to your local PostgreSQL database (`planttrust`). It creates a new row in the `plant_records` table and saves: the original filename, the extracted text, the SHA-256 fingerprint, and the blockchain receipt.
* **Why?** So you have a local history of what happened and can display it to the user.

### 7. Back to the Frontend
* **What it does:** The server gathers all this success data and sends it back to the React frontend. React then updates the screen to show you the extracted text, the hash, and a clickable link to view the transaction on the public XRPL Explorer!

---

## Important Files to Know

* **`.jsx` files (like `FileUpload.jsx`):** JSX stands for JavaScript XML. It is a special syntax that lets you write HTML code directly inside your JavaScript files so that the appearance and behavior of a component live in the same place.
* **`main.jsx`:** The "bridge" that grabs your React code and injects it into the actual web browser.
* **`App.jsx`:** The "Master Component" that acts as the giant baseplate. All other components are attached here.
* **`server/.env`:** The "Secret Safe." It holds sensitive information like your database password (`1234`) so it isn't hardcoded into the app.

---

## What happens if I upload the same deed twice?
1. **OCR extracts the same text.**
2. **The exact same SHA-256 fingerprint is made.**
3. **A second Blockchain Transaction is made:** You will receive a new receipt number (TxHash) because a new event occurred on the blockchain.
4. **A duplicate Database Record is saved:** A new row is created in the PostgreSQL database. 

*(In a real production app, you would add a check before Step 3 to see if the fingerprint already exists in the database to prevent duplicates!)*
