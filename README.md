<div align="center">
  <br />
 <p>
    <a href="#"><img src="packages/game-center/public/GameCenterApp.png" alt="image" height="200" width="200"></a>
</p>

  <h2 align="center"><a href="https://github.com/yusufinann/GameHub">Game Center Game Platform</a></h2>

  <p align="center">
    Web-Based Live Game and Social Interaction Platform 🚀
    <br />
    Discover Fun with Bingo and More! 🎲
    <br />
    <a href="#project-summary"><strong>Project Summary</strong></a>
    ·
    <a href="#key-features"><strong>Key Features</strong></a>
    ·
    <a href="#technology-stack"><strong>Technology Stack</strong></a>
    ·
    <a href="#application-features-screen-based"><strong>Application Features</strong></a>
    ·
    <a href="#coming-soon"><strong>Coming Soon</strong></a>
  </p>
</div>

---

<h2 id="project-summary">✨ Project Summary</h2>

Game Center Game Platform is a **web-based dynamic game center** that offers players the opportunity to experience various games and socialize with friends from the comfort of their homes. Starting with Bingo, our platform's foundation, we aim to incorporate **various new and exciting games** in the future. Our goal is to provide our users not only with a platform to play games but also a place where they can **socialize in a live, interactive, and enjoyable digital environment**. With our user-friendly interface, real-time gaming experience, and rich social features, we promise players a **unique entertainment and community experience**.

---

<h2 id="key-features">🚀 Key Features</h2>

* **🕹️ Various Games on a Single Platform:** Easy access to a game collection catering to different tastes.
* **👥 Social Interaction Focused:** Setting up lobbies with friends, chatting, and enjoying games together.
* **⚡ Real-Time Live Gaming Experience:** Instant updates and real-time competition with WebSocket.
* **🎨 User-Friendly and Stylish Interface:** Modern and intuitive design with React and Material UI.
* **📱 Fully Responsive Design:** Seamless experience on desktop, tablet, and mobile devices.
* **🌙 Light & Dark Theme Options:** Personalize your experience with theme choices, including an eye-friendly dark mode.
* **🌐 Multi-Language Support (Coming Soon):** Reaching a wide audience with English and Turkish language options.
* **🔔 Smart Notification System:** Instant notifications for events, invitations, and updates.
* **📊 Detailed Player Profile:** Personal development tracking with statistics, game history, friends, and achievements.
* **💬 Community and Chat Areas:** Building a player community with global and private group chats.

---

<h2 id="technology-stack">🛠️ Technology Stack</h2>

Our application is built on modern and powerful web technologies:

### Frontend

* **⚛️ React:** Component-based, modular, and reusable interface development.
* **🗺️ react-router-dom:** Smooth and dynamic page routing and navigation.
* **📡 Axios:** HTTP client for reliable and fast Backend API communication.
* **🎨 Material UI:** Aesthetics and functionality with a rich, modern, and customizable UI components library (supports theming like Light/Dark modes).
* **📦 React Context:** Efficient and easy state management throughout the application.

### Backend

* **<img src="https://nodejs.org/static/images/logos/nodejs-new-pantone-black.svg" alt="Node.js" width="20" style="vertical-align: middle;"> NodeJS:** High performance, event-driven, and scalable server-side development.
* **🚄 Express:** Fast, flexible, and minimalist web application and API development framework.
* **<img src="https://webassets.mongodb.com/_com_assets-prod/assets/favicons/favicon-32x32.75907fb9d898814747a8cef5df4bf684.png" alt="MongoDB" width="20" style="vertical-align: middle;"> MongoDB:** NoSQL database offering flexible schema, high performance, and scalability.
* **🌱 Mongoose:** Elegant and powerful Object Data Modeling (ODM) library for MongoDB.
* **🔑 Jsonwebtoken:** Secure authentication and authorization with industry-standard JWT (JSON Web Token).
* **🔒 express-session & Memorystore:** Secure and efficient session management solutions.
* **🛡️ bcrypt:** Security of sensitive data with one-way encryption.
* **📦 body-parser & cookie-parser:** Easily processing HTTP request data and cookies.
* **🔄 Cors:** Secure Cross-Origin Request Management.
* **⚙️ Dotenv:** Managing environment variables in an organized and secure way.

### Other Tools

* **🕸️ WebSocket:** Real-time, two-way, and low-latency communication channel.
* **🏗️ Lerna:** Monorepo management and optimizing package dependencies in large projects.
* **🛠️ craco:** Easy React configuration customization tool.
* **<img src="https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png" alt="Git" width="20" style="vertical-align: middle;"> Git:** Distributed version control system for team collaboration and code management.

---

<h2 id="application-features-screen-based">🎮 Application Features (Screen-Based)</h2>

### 🚪 Login Screen

* **🔑 Secure Login with Email & Password:** Standard and reliable user authentication.
* **🍪 "Remember Me" Option:** Fast and automatic login with cookies.
* **❓ "Forgot Password" Function:** Easy password reset via email.
* **🔒 Secure Session Management with JWT:** Securely storing user information and session in LocalStorage.
* **🔄 Automatic Token Check:** Seamless login experience every time the page loads.
* **👤 Quick Login Avatar:** Personalized quick login with the "Remember Me" option.

### 🏠 Main Screen

* **🚪 Lobby Listing:** Dynamically listing active game lobbies (type, status, encryption).
* **🎨 Animations and Visual Richness:** Interactive elements that make the interface lively and user-friendly.
* **<img src="https://cdn-icons-png.flaticon.com/512/929/929679.png" alt="Menu" width="20" style="vertical-align: middle;"> Left Fixed Menu (Sidebar):** Easy access for main navigation (Main Screen, Games, Community, Chat, Profile).
* **<img src="https://cdn-icons-png.flaticon.com/512/447/447315.png" alt="Friends" width="20" style="vertical-align: middle;"> Right Fixed Friend List (Sidebar):** Online friends and quick social interaction.
* **🖼️ Animated Slideshow:** Dynamic presentation of platform and game promotions.
* **🔍 User Search Area:** Quickly finding user profiles and sending friend requests.
* **👤 Profile Icon:** Instant access to personal profile.
* **🔔 Notification Icon:** Instant notifications for important updates and interactions.
* **<img src="https://cdn-icons-png.flaticon.com/512/107/107832.png" alt="Tabs" width="20" style="vertical-align: middle;"> Lobby Type Tabs:** Easy filtering with "All Lobbies", "Normal", "Event", "Lobbies I'm In".
* **🔒 Encrypted/Open Lobby Distinction:** Quick visual recognition with lock icons.
* **⏱️ Event Lobby Time Indicator:** Countdown or date information for event start.
* **✨ Animated Lobby Elements:** Visually appealing and interactive lobby list.
* **🛠️ Lobby CRUD Operations:** User management of their own lobbies (create, update, delete).
* **🚪 "Enter Lobby You Are In" Button:** One-click access to registered lobbies.
* **➕ "Create Lobby" / "Go to Your Lobby" Buttons:** Creating a new lobby or redirecting to an existing lobby.

### ➕ Create Lobby Area

* **<img src="https://cdn-icons-png.flaticon.com/512/93/93634.png" alt="Modal" width="20" style="vertical-align: middle;"> Create Lobby Modal:** Configuring all lobby settings from a single place.
* **📝 Lobby Name (Required):** Unique name that defines the lobby.
* **🎲 Game Selection (Dropdown):** Easily selecting the game type to be played (Bingo).
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446813.png" alt="Type" width="20" style="vertical-align: middle;"> Lobby Type Selection (Radio Buttons):** Determining "Normal" or "Event" lobby type.
    * **<img src="https://cdn-icons-png.flaticon.com/512/446/446824.png" alt="Normal" width="20" style="vertical-align: middle;"> Normal Lobby:** Always open and always playable.
    * **<img src="https://cdn-icons-png.flaticon.com/512/446/446859.png" alt="Event" width="20" style="vertical-align: middle;"> Event Lobby:** Planned events with a specific time range.
* **👥 Number of Members (Dropdown, Required):** Maximum number of players that can join the lobby.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446849.png" alt="Password" width="20" style="vertical-align: middle;"> Lobby Password (Optional):** Option to create a private and secure lobby.
* **❌ "Cancel" & ✅ "Create Lobby" Buttons:** Easily managing the process.
* **🎉 "Lobby Created Successfully" Screen:** Information with lobby code, link, and sharing tools.
* **<img src="https://cdn-icons-png.flaticon.com/512/545/545717.png" alt="Code" width="20" style="vertical-align: middle;"> Lobby Code:** Easy lobby sharing with a unique code and copy icon.
* **🔗 Lobby Link:** Direct participation link and quick copy option.
* **👤 Lobby Members List:** Instant viewing of participants (initially only host).
* **<img src="https://cdn-icons-png.flaticon.com/512/59/59354.png" alt="Share" width="20" style="vertical-align: middle;"> Social Media Sharing Icons:** Quickly announcing the lobby on social platforms.
* **<img src="https://cdn-icons-png.flaticon.com/512/189/189675.png" alt="Close" width="20" style="vertical-align: middle;"> "Close" Button.**
* **🚪 "Go to Your Lobby" Button:** Instant transition to the created lobby.

### ⚙️ Lobby Management

Our Game Platform offers users powerful and intuitive lobby management tools. There are various management features for both lobby creators (hosts) and players joining the lobby:

#### ➕ Lobby Creation and Types

* **🎨 Lobby Creation Modal:** Easily configure lobby settings with a user-friendly modal interface.
* **📝 Lobby Name:** Specify a custom name that defines your lobby (required).
* **🎲 Game Selection:** Select the type of game you want to play (currently Bingo).
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446813.png" alt="Type" width="20" style="vertical-align: middle;"> Lobby Types:** Choose the lobby type that suits your needs:
    * **<img src="https://cdn-icons-png.flaticon.com/512/446/446824.png" alt="Normal" width="20" style="vertical-align: middle;"> Normal Lobbies:**
        * Lobbies that remain open continuously, where you can play games whenever you want.
        * You can meet up with your friends or other players and enjoy gaming at any time.
    * **<img src="https://cdn-icons-png.flaticon.com/512/446/446859.png" alt="Event" width="20" style="vertical-align: middle;"> Event Lobbies:**
        * Ideal for pre-planned events. They have a specific start and end time.
        * Event lobbies are perfect for organizing tournaments or special game events.
        * The event start time is clearly indicated to players with a countdown timer.
        * If there are more than 24 hours until the event, the event start date is shown; if there are less than 24 hours, a countdown timer is displayed.
* **👥 Maximum Number of Members:** Determine how many players can join your lobby (required).
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446849.png" alt="Password" width="20" style="vertical-align: middle;"> Optional Password Protection:** Make your lobby private and exclusive to people who know the password.

#### 🚪 Lobby Listing and Joining

* **🚪 Dynamic Lobby List:** View active lobbies in real-time on the main screen.
* **<img src="https://cdn-icons-png.flaticon.com/512/107/107832.png" alt="Tabs" width="20" style="vertical-align: middle;"> Lobby Filtering Tabs:** Filter the lobby list by type:
    * **"All Lobbies":** Shows all active lobbies on the platform.
    * **"Normal":** Lists only normal type lobbies.
    * **"Event":** Displays only event lobbies.
    * **"Lobbies I'm In":** Shows only the lobbies you are a member of.
* **🔒 Encrypted/Open Lobby Indicators:** Easily distinguish whether lobbies are encrypted or not with lock icons.
    * <img src="https://cdn-icons-png.flaticon.com/512/446/446849.png" alt="Encrypted" width="20" style="vertical-align: middle;"> Orange lock icon: Encrypted lobby.
    * <img src="https://cdn-icons-png.flaticon.com/512/446/446828.png" alt="Open" width="20" style="vertical-align: middle;"> Green lock icon: Unencrypted lobby.
* **⏱️ Event Time Indicator:** Track the start time and countdown in event lobbies.
* **✨ Visual Lobby Elements:** Animated and moving elements that make lobbies more attractive.
* **🚪 "Join" Button:** Join any lobby from the list with a single click.
* **🔗 Joining with Lobby Link:** Easily access the lobby directly with a lobby invitation link.

#### 👑 Lobby Manager (Host) Capabilities

Lobby creators can keep their lobbies under full control:

* **🛠️ Lobby Editing:** Update your created lobby settings (name, type, number of members, password) at any time.
    * Open the modal with the edit icon in the lobby list and make changes.
    * Receive instant notification after successful update.
* **🗑️ Lobby Deletion:** Delete your created lobby completely at any time.
    * Permanently remove the lobby with the delete icon in the lobby list.
* **⏳ Automatic Lobby Deletion (Normal Lobbies):** In normal lobbies, if the host leaves the lobby and does not return within 8 hours, the lobby is automatically deleted. This efficiently utilizes system resources and prevents unnecessary lobby clutter.
* **🎮 Game Control:** As the host, you have the authority to start the game, choose the game mode, and competition style. Guide your players for the best gaming experience.

#### 🚪 Player Lobby Management

Players can also take an active role within the lobby:

* **🚪 Leaving Lobby:** You can leave the lobby at any time.
* **🚀 "Go to Lobby I'm In" Button:** Quickly access the lobbies you are a member of from the main screen or your profile.

#### 🔔 Lobby Operations Notifications

Our platform supports your lobby management operations with instant notifications:

* **✅ Lobby Created Successfully:** Instant notification message after lobby creation.
* **✅ Lobby Updated Successfully:** Confirmation notification when lobby settings are updated.
* **🗑️ Lobby Deleted Notification:** Animated modal notification to players in the lobby when the lobby is deleted.
* **🚪 User Joined Lobby Notification:** Instant snackbar notification and notification icon update when a new player joins the lobby.
* **⏰ Event Start Notification:** Instant notification to members when event lobbies start.
* **⏳ Event Lobby Approaching End Warning:** Warning notification to players 5 minutes before the event time expires.

### ℹ️ Game Detail Page

* **<img src="https://cdn-icons-png.flaticon.com/512/446/446827.png" alt="Mode" width="20" style="vertical-align: middle;"> Game Modes and Rules:** Different game modes (Classic, Extended, Super Fast) and detailed descriptions.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446861.png" alt="Competition" width="20" style="vertical-align: middle;"> Competition Styles:** Information about competitive and relaxed game styles.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446837.png" alt="How to Play" width="20" style="vertical-align: middle;"> "How to Play?" Section:** Step-by-step simple game guide for new players.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446857.png" alt="History" width="20" style="vertical-align: middle;"> Game History Section:** User's game history and performance statistics (with pagination).
* **🚪 Active Lobby List (Game Page):** List of active lobbies specific to the selected game type.
* **➕ "Create Lobby" Button (Game Page):** Quick lobby creation shortcut for this game type.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446822.png" alt="Animation" width="20" style="vertical-align: middle;"> Animated Page Transition:** Smooth and visually rich user experience.

### 🎲 Game Screen (Bingo Game)

**Bingo in Normal Lobby:**

* **👑 Host Control:** Lobby creator's authority over game settings and starting.
* **🚪 Easy User Participation:** Quick participation via lobby link, main screen, or game detail page.
* **🏁 Game Start:** Start by host and 5-second countdown timer.
* **⚙️ Game Mode and Style Selection (Host):** Flexibility to adjust mode and style before game starts.
* **⚡ Real-Time Gaming Experience:** Real-time and synchronized game flow.
* **🔊 In-Game Sound Control:** Option to turn sound effects on/off.
* **💬 In-Game Messaging (Chat):** Communication with animated chat area and emoji support.
* **😄 Quick Emoji Sending:** Ability to quickly express emotions.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446833.png" alt="Area" width="20" style="vertical-align: middle;"> Game Area:** Basic interface of the Bingo game.
* **📣 "Call Bingo!" Button:** Button activated when Bingo is achieved.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446847.png" alt="Draw" width="20" style="vertical-align: middle;"> "Draw Number" Button (Manual Mode):** Manual number drawing control.
* **🔢 Drawn Numbers List:** Ability to track all drawn numbers.
* **🔥 Active Numbers Area:** Highlighting the latest drawn numbers.
* **🎫 Bingo Ticket (Your Ticket):** Player's personal bingo card.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446823.png" alt="Card" width="20" style="vertical-align: middle;"> Card Selection:** Switching between multiple tickets.
* **🏆 Completing Players List:** Real-time list of players who have achieved Bingo.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446854png" alt="Ranking" width="20" style="vertical-align: middle;"> Game Over and Ranking Table:** Game results, ranking, and "Play Again" options.
* **💾 Game History Recording (Database):** Permanently storing game results.
* **⏳ If Host Leaves Lobby:** Lobby automatically closes if they do not return within 8 hours.

**Event Lobby:**

* **⏱️ Event Timer:** Dynamically showing the time remaining until the event starts.
* **👑 Host Control (Event Lobby):** Event owner host's authority to start the game.
* **🔔 Event Start Notification:** Instant notification to lobby members when the event starts.
* **🚀 Starting Game in Event Lobby:** Start with game mode selection modal.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446831.png" alt="Countdown" width="20" style="vertical-align: middle;"> Countdown and Game Start (Event Lobby):** Exciting start with a 3-second countdown.
* **🎲 Bingo in Event Lobby:** Same rich gaming experience as normal lobby.
* **💬 In-Game Snackbar Notifications:** Instant notifications during gameplay.
* **⏰ Event End Warning 5 Minutes Before:** Warning notification to players 5 minutes before the event time expires.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446835.png" alt="Joining" width="20" style="vertical-align: middle;"> Notifications to Users When Joining Game:** Instant notification when a new player joins.
* **❌ Incorrect Bingo Call Notification (Audible and Silent):** Instant feedback and buzzer sound in case of error.
* **🚪 User Joining Lobby Notification (Audible and Silent):** Instant notification when a new player joins the lobby.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446851.png" alt="Deletion" width="20" style="vertical-align: middle;"> Notification When Lobby is Deleted (Animated Modal):** Animated notification when lobby is deleted or event ends.
    * **🗑️ Lobby Deleted by Host:** "Lobby No Longer Available" modal and countdown.
    * **⌛ Event Lobby Time Expired:** "Lobby No Longer Available" modal and countdown.

### 👤 Profile Screen

* **👤 User Profile Information:** Basic information such as name, level, location, membership date, level progress.
* **📊 Bingo General Statistics:** Total games, wins, average score, win rate, longest streak (summary and graphs).
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446857.png" alt="History" width="20" style="vertical-align: middle;"> Bingo Game History:** Detailed list of games (regular display with pagination).
* **<img src="https://cdn-icons-png.flaticon.com/512/447/447315.png" alt="Friends" width="20" style="vertical-align: middle;"> Friends List:** Viewing current friends.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446826.png" alt="Achievements" width="20" style="vertical-align: middle;"> Achievements:** Visual display of earned achievements.
* **➕ Send/Add Friend Request:** "ADD FRIEND" button and status indicator.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446845.png" alt="Requests" width="20" style="vertical-align: middle;"> Manage Friend Requests:** Accept/reject with "Friend Requests" modal.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446843.png" alt="Remove" width="20" style="vertical-align: middle;"> Remove Friend:** "REMOVE FRIEND" button and confirmation modal.

### 🏘️ Community Screen

* **<img src="https://cdn-icons-png.flaticon.com/512/446/446863.png" alt="Global" width="20" style="vertical-align: middle;"> Global Community (Common Message Area):** General chat channel where all players can participate.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446839.png" alt="Groups" width="20" style="vertical-align: middle;"> Community Groups (Private Groups):** Area where users can create private chat groups.
    * **<img src="https://cdn-icons-png.flaticon.com/512/446/446855.png" alt="My Groups" width="20" style="vertical-align: middle;"> "MY GROUPS":** Groups the user is a member of.
    * **<img src="https://cdn-icons-png.flaticon.com/512/446/446841.png" alt="Join" width="20" style="vertical-align: middle;"> "JOIN GROUPS":** List of existing groups to join.
* **➕ Create Group:** Group creation modal with "+" icon in "MY GROUPS" section.
* **🚪 Join Group:** Joining groups listed in "JOIN GROUPS" section with "JOIN" button.
* **🔗 Group Link Invitation:** Ability to create and share group invitation link.
* **🚪 Leave Group:** "Leave Group" option from "..." menu in "MY GROUPS" section.
* **🗑️ Delete Group:** "Delete Group" option from "..." menu in "MY GROUPS" section (host only).
* **⚡ Real-Time Chat (WebSocket):** Instant messaging experience.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446853.png" alt="History" width="20" style="vertical-align: middle;"> Last 12 Hours Chat History (Global Community):** Chat history is stored in Community Groups.
* **♻️ Reusable ChatBox Component:** Reusable chat box.
* **⏱️ Timing Indicator (ChatBox):** Displaying message times in a user-friendly format.
* **😄 Emoji Support:** Emoji usage in chats.
* **👥 Member List (Group):** Viewing member list in modal by clicking on group title.
* **🔍 Group Search (in JOIN GROUPS section):** Searching by group names.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446849.png" alt="Password" width="20" style="vertical-align: middle;"> Group Encryption (Optional):** Password protection for private groups.
* **👑 Group Host Management:** Host permissions and automatic host transfer.
* **🗑️ Group Automatic Deletion:** Automatic deletion of the group when no members remain.
* **💬 Group Operations Notifications (Snackbar):** Instant notifications about group operations.

### 💬 Conversation Screen

* **<img src="https://cdn-icons-png.flaticon.com/512/446/446865.png" alt="Tabs" width="20" style="vertical-align: middle;"> "All, Friends, Friend Groups" Tabs:** Categorizing chat types and easy access.
    * **<img src="https://cdn-icons-png.flaticon.com/512/446/446820.png" alt="All" width="20" style="vertical-align: middle;"> "All":** Combined view of all chats.
    * **<img src="https://cdn-icons-png.flaticon.com/512/447/447315.png" alt="Friends" width="20" style="vertical-align: middle;"> "Friends":** Only one-on-one friend chats.
    * **<img src="https://cdn-icons-png.flaticon.com/512/446/446839.png" alt="Groups" width="20" style="vertical-align: middle;"> "Friend Groups":** Only friend group chats.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446829.png" alt="Private" width="20" style="vertical-align: middle;"> Private Chat with Friends (One-on-One):** Private messaging in "Friends" tab.
* **<img src="https://cdn-icons-png.flaticon.com/512/446/446839.png" alt="Group" width="20" style="vertical-align: middle;"> Create and Manage Friend Groups:** Group creation and management tools in "Friend Groups" tab.
* **➕ Create Group:** "+ CREATE GROUP" button and friend group creation modal.
* **🚪 Join Group:** "Friend Group Invitations" modal and group link join options.
* **🔔 Group Invitation Notification:** Invitation notifications with snackbar and notification icon.
* **🔗 Join Group via Link:** Creating and sharing invitation link.
* **🚪 Leave Group:** "Leave Group" option from "..." menu in "Friend Groups" tab.
* **🗑️ Delete Group:** "Delete Group" option from "..." menu in "Friend Groups" tab (host only).
* **👉 Guidance to Start Chatting:** Guide message on initial opening.

### ⚙️ Settings Screen

*   **<img src="https://cdn-icons-png.flaticon.com/512/606/606788.png" alt="Theme" width="20" style="vertical-align: middle;"> In-App Theme Selection (Light/Dark):** Easily switch between light and dark modes to suit your preference.
*   **<img src="https://cdn-icons-png.flaticon.com/512/2037/2037790.png" alt="Language" width="20" style="vertical-align: middle;"> In-App Language Selection (Coming Soon):** Choose your preferred language for the application interface.
*   **<img src="https://cdn-icons-png.flaticon.com/512/878/878439.png" alt="Sound" width="20" style="vertical-align: middle;"> Game Sound Management:** Control and adjust game sound effects volume or mute them entirely.
*   **<img src="https://cdn-icons-png.flaticon.com/512/929/929679.png" alt="Sidebar" width="20" style="vertical-align: middle;"> Sidebar Theme Control:** The theme can also be conveniently controlled directly from the sidebar.
  
---

<h2 id="coming-soon">⏳ Coming Soon</h2>

* **🌐 Multi-Language Support:** Turkish and English language options.
* **🎲 New Games:** Different game types in addition to Bingo (e.g., poker, okey, etc.).
* **🚀 Mobile Applications:** Mobile applications for iOS and Android platforms.

---

<h2 id="installation-and-setup">🔧 Installation and Setup</h2>

Follow these steps to get the Game Center running on your local machine:

### Prerequisites

*   **Node.js:** Ensure you have Node.js (v16 or higher recommended) and Yarn installed.
*   **Git:** Required for cloning the repository.
*   **MongoDB:** You need a running instance of MongoDB (local or cloud).
*   **(Optional) API Client:** A tool like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/), or familiarity with `curl` command line tool to create initial users.

### Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/yusufinann/GameHub.git
    cd GameHub
    ```

2.  **Install Dependencies:**
    Install dependencies for the entire project from the root directory using Yarn.
    ```bash
    yarn install
    ```

3.  **Configure Backend Environment Variables:**
    *   Navigate to the backend directory: `cd backend`
    *   **Create a `.env` file** in this `backend` directory.
    *   Copy the structure below and **replace values with your own configuration**:

        ```dotenv
        # .env file in backend directory
        PORT=3001
        FRONTEND_URL=http://localhost:3000
        MONGO_DB_URI=YOUR_MONGO_DB_CONNECTION_STRING_HERE # Replace with your MongoDB connection string
        SESSION_SECRET=your_strong_random_session_secret_key # Replace with a unique random string
        JWT_SECRET=your_different_strong_random_jwt_secret_key # Replace with a different unique random string
        ```
    *   **Crucially, set your `MONGO_DB_URI`, `SESSION_SECRET`, and `JWT_SECRET`.** Use `3001` for `PORT` unless that port is taken.

4.  **Ensure MongoDB is Running:**
    Make sure your MongoDB server instance (specified in your `MONGO_DB_URI`) is running and accessible.

5.  **Run the Backend Server:**
    *   While in the `backend` directory:
        ```bash
        yarn start
        ```
    *   The backend server should now be running (e.g., on `http://localhost:3001`). **Keep this terminal window open.**

6.  **(IMPORTANT) Create Sample Users:**
    *   Since there is no registration screen, manually create users using an API client (like Postman) or `curl`.
    *   Send **POST** requests to your running backend: `http://localhost:3001/api/users/` (use the port set in `backend/.env`).
    *   Set `Content-Type` header to `application/json`.
    *   Use the following JSON data in the request body for each user:

        **User 1:**
        ```json
        {
          "email": "user1@example.com",
          "password": "password1",
          "name": "John Doe",
          "username": "johndoe",
          "avatar": "https://mighty.tools/mockmind-api/content/human/112.jpg"
        }
        ```
        **User 2:**
         ```json
        {
          "email": "user2@example.com",
          "password": "password2",
          "name": "Jane Smith",
          "username": "janesmith",
          "avatar": "https://mighty.tools/mockmind-api/content/human/79.jpg"
        }
        ```
        **User 3:**
        ```json
        {
          "email": "user3@example.com",
          "password": "password3",
          "name": "Alice Johnson",
          "username": "alicejohnson",
          "avatar": "https://mighty.tools/mockmind-api/content/human/124.jpg"
        }
        ```
        **User 4:**
        ```json
        {
          "email": "user4@example.com",
          "password": "password4",
          "name": "Bob Brown",
          "username": "bobbrown",
          "avatar": "https://mighty.tools/mockmind-api/content/human/102.jpg"
        }
        ```
        **User 5:**
        ```json
        {
          "email": "user5@example.com",
          "password": "password5",
          "name": "Charlie Davis",
          "username": "charliedavis",
          "avatar": "https://mighty.tools/mockmind-api/content/human/5.jpg"
        }
        ```
    *   Ensure you get a successful response (e.g., 201 Created) for each user.

7.  **Configure Frontend API Connection (If Necessary):**
    *   The frontend connects to the backend API at the address specified by the `REACT_APP_API_BASE_URL` environment variable, defaulting to `http://localhost:3001`.
    *   **If you kept the backend `PORT` as `3001` in `backend/.env`, you don't need to do anything here.**
    *   **If you changed the backend `PORT`** (e.g., to `5000`), you **must** tell the frontend the new address:
        *   Create a file named `.env` in the **project root directory** (the main `GameHub` folder, where the top-level `package.json` is).
        *   Add the following line to this **root** `.env` file, replacing `5000` with the actual port you set for the backend:
            ```dotenv
            # .env file in the project ROOT directory
            REACT_APP_API_BASE_URL=http://localhost:5000
            ```

8.  **Run the Frontend Application:**
    *   Open a **new terminal window** or tab.
    *   Navigate to the **root** directory of the project (`cd ..` if you're in `backend`, otherwise navigate to `GameHub`).
    *   Start the React development server **from the root directory**:
        ```bash
        yarn start
        ```
    *   **(If you created/modified a root `.env` file in the previous step, you might need to stop and restart this `yarn start` command for the changes to take effect).**
    *   The application should open automatically in your browser, typically at `http://localhost:3000`.

### Logging In

Once the frontend application is running (and the backend server is also running with users created in your database via **Step 6**), you can log in using the credentials of the users you created:

*   **Email:** `user1@example.com` / **Password:** `password1`
*   **Email:** `user2@example.com` / **Password:** `password2`
*   **Email:** `user3@example.com` / **Password:** `password3`
*   **Email:** `user4@example.com` / **Password:** `password4`
*   **Email:** `user5@example.com` / **Password:** `password5`

*(Note: Ensure the backend server is running, accessible, and you have successfully created users via the API before attempting to log in.)*

---

<div align="center">
  <p>
    <a href="#">
      <img src="https://img.shields.io/badge/Platform-Web-blue.svg?style=for-the-badge&logo=html5" alt="Platform">
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Backend-Node.js-green.svg?style=for-the-badge&logo=node.js" alt="Backend">
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Frontend-React-blueviolet.svg?style=for-the-badge&logo=react" alt="Frontend">
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Database-MongoDB-orange.svg?style=for-the-badge&logo=mongodb" alt="Database">
    </a>
  </p>
  <p>
    <a href="#">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge&logo=mit" alt="License">
    </a>
    <a href="https://github.com/your-username/your-repo-name/issues">
      <img src="https://img.shields.io/badge/Issues-Open-red.svg?style=for-the-badge&logo=github" alt="Issues">
    </a>
    <a href="https://github.com/your-username/your-repo-name/pulls">
      <img src="https://img.shields.io/badge/Pull%20Requests-Welcome-brightgreen.svg?style=for-the-badge&logo=github" alt="Pull Requests">
    </a>
  </p>
</div>
