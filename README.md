# Chef Connect

A full-stack recipe sharing and management web application where food enthusiasts can create accounts, manage their personal recipe collections, and explore cooking content.

---

## Features

- **User Authentication** — Register and log in securely with encrypted passwords and session management
- **Recipe Management** — Add, edit, and delete your own recipes with ingredients, instructions, cooking time, and serving size
- **Favourites** — Save and revisit your favourite recipes
- **Cooking Techniques** — Browse dedicated pages for culinary tips, tricks, and techniques
- **Blog** — Read cooking-related blog posts and articles
- **Cuisine Explorer** — Discover recipes by cuisine type
- **User Settings** — Manage your account and profile
- **Contact Page** — Get in touch via the contact form
- **Password Recovery** — Forgot password and reset password functionality

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Database | MySQL |
| Authentication | bcrypt, express-session |
| File Uploads | Formidable |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MySQL](https://www.mysql.com/) installed and running

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Chef-Connect.git
   cd Chef-Connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Make sure MySQL is running
   - The app will automatically create the `ChefConnect` database and required tables on first run

4. **Configure your database credentials**
   - Open `db_connection_handling.js`
   - Update the host, user, and password to match your MySQL setup:
   ```js
   const db = mysql.createConnection({
       host: 'localhost',
       user: 'your_username',
       password: 'your_password',
       database: 'chefconnect'
   });
   ```

5. **Start the server**
   ```bash
   node chef_connect_server.js
   ```

6. **Open your browser and go to:**
   ```
   http://localhost:8080
   ```

---

## Project Structure

```
Chef-Connect/
├── views/               # HTML pages
├── css/                 # Stylesheets
├── javascript/          # Client-side JS
├── images/              # Static images
├── chef_connect_server.js   # Main server
├── db_connection_handling.js # Database setup
├── session.js           # Session management
├── module.js            # Helper modules
├── Register.js          # Registration logic
└── package.json
```

---

## Important Notes

- Do **not** upload the `node_modules/` folder — run `npm install` to regenerate it
- Avoid hardcoding database credentials in production — use environment variables instead
- This project is intended for educational purposes

---

## License

This project is open source and available under the [ISC License](LICENSE).
