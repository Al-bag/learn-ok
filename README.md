# VibeChat - Perfected Chat Application

This is a real-time chat application built with Node.js, Express, and Socket.IO. It has been significantly improved with new features, a better user experience, and a more robust backend structure.

## ✨ Key Features & Improvements

- **Real-Time Messaging**: Instant messaging within rooms using WebSockets.
- **User Authentication**: Secure signup and login system with client-side password hashing.
- **Room Management**: Users can create, join, and delete chat rooms.
- **File Sharing**: Upload and share files directly in the chat.
- **Typing Indicators**: See when other users are typing a message.
- **Online User List**: View a list of users currently active in the room.
- **Message Deletion**: Users can delete their own messages.
- **Improved UI/UX**: Replaced all native \`alert()\` and \`prompt()\` dialogs with clean Bootstrap modals for a seamless experience.
- **Responsive Design**: A modern, dark-themed, and responsive UI that works on all devices.
- **Server-Side Timestamps**: Accurate and consistent message timestamps for all users.

---

## 🚀 How to Run Locally

1.  **Prerequisites**: Make sure you have [Node.js](https://nodejs.org/) installed.
2.  **Download Files**: Save all the provided files (\`index.js\`, \`package.json\`, etc.) into a new project folder. Make sure to create the \`public/js\` and \`public/css\` subdirectories and place the files accordingly.
3.  **Install Dependencies**: Open a terminal in your project folder and run:
    \`\`\`bash
    npm install
    \`\`\`
4.  **Start the Server**: Run the following command:
    \`\`\`bash
    npm start
    \`\`\`
5.  **Open the App**: Navigate to \`http://localhost:3456\` in your web browser.

---

## ☁️ How to Deploy to Render (Free Hosting)

This application is designed to be deployed on a platform like Render. However, it uses the local filesystem to store data, which is **ephemeral** on most hosting platforms (meaning data is deleted on every restart or deploy).

**For a real, persistent application, you MUST use a database and cloud storage.** For this project, you can use Render's free **Persistent Disks** to make the file storage work.

### Step-by-Step Deployment Guide:

1.  **Push to GitHub**:
    * Create a new repository on [GitHub](https://github.com/).
    * Push your project folder (containing all the files) to this new repository.

2.  **Create a Render Account**:
    * Sign up for a free account at [render.com](https://render.com/).

3.  **Create a New Web Service**:
    * On your Render dashboard, click **"New +"** and select **"Web Service"**.
    * Connect your GitHub account and select the repository you just created.
    * Give your service a unique name (e.g., \`my-vibechat-app\`).

4.  **Configure the Service**:
    * **Region**: Choose a region near you.
    * **Branch**: Select your main branch (e.g., \`main\` or \`master\`).
    * **Root Directory**: Leave this as is unless you have a different project structure.
    * **Runtime**: Select **Node**.
    * **Build Command**: \`npm install\`
    * **Start Command**: \`npm start\`
    * **Instance Type**: Select the **Free** plan.

5.  **Add a Persistent Disk (CRITICAL STEP)**:
    * Scroll down to the **"Advanced"** section.
    * Click **"Add Disk"**.
    * **Name**: Give it a name, e.g., \`data\`.
    * **Mount Path**: Set this to \`./data\`
    * **Size (GB)**: The free plan allows for 1 GB, which is plenty.
    * Click **"Save"**.

6.  **Update Code for Render Disk**:
    * You must modify your \`index.js\` file to use this new \`./data\` directory instead of the root directory for storage. Change these lines:
    \`\`\`javascript
    // Change this:
    const USERS_DIR = path.join(__dirname, 'users');
    const CHATS_DIR = path.join(__dirname, 'chats');
    const UPLOADS_DIR = path.join(__dirname, 'uploads');

    // To this:
    const DATA_DIR = path.join(__dirname, 'data');
    const USERS_DIR = path.join(DATA_DIR, 'users');
    const CHATS_DIR = path.join(DATA_DIR, 'chats');
    const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
    \`\`\`
    * Commit and push this change to GitHub. Render will automatically detect the push and redeploy.

7.  **Deploy!**:
    * Click **"Create Web Service"**.
    * Render will now build and deploy your application. You can watch the logs in the "Logs" tab.
    * Once it's live, you can access your chat app at the URL provided on your Render dashboard (e.g., \`https://my-vibechat-app.onrender.com\`).
    
