const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const formidable = require('formidable');
const querystring = require('querystring');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let db;

const connectToDB = () => {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'admin',
        database: 'chefconnect'
    });
};

db = connectToDB();
db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

const handlers = {
    login: function (res) {
        fs.readFile(path.join(__dirname, 'views', 'Login_Page.html'), (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                return res.end('404 Not Found');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            return res.end();
        });
    },
    logout: function (res) {
        fs.readFile(path.join(__dirname, 'views', 'Login_Page.html'), (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            db.end();
            return res.end();
        });
    },
    navigateToUpload: function (res) {
        fs.readFile(path.join(__dirname, 'views', 'MyRecipe.html'), (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            return res.end();
        });
    },
    editRecipe: function (res) {
        fs.readFile(path.join(__dirname, 'views', 'EditRecipe.html'), (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                return res.end('404 Not Found');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            return res.end();
        });
    },
    getRecipesByUserId: function (res, userId, callback) {
        const sql = 'SELECT * FROM recipes WHERE user_id = ?';
        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Error: Failed to retrieve recipes');
                return;
            }
            callback(res, results);
        });
    }
};

function registration(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        body = querystring.parse(body);
        const { user_first_name, user_last_name, user_email, user_username, user_password } = body;

        bcrypt.hash(user_password, saltRounds, (err, hash) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Internal Server Error');
                return;
            }
            const sql_query = 'INSERT INTO users (user_first_name, user_last_name, user_email, user_username, user_password) VALUES (?, ?, ?, ?, ?)';
            const values = [user_first_name, user_last_name, user_email, user_username, hash];

            db.query(sql_query, values, (err, result) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('Error: Failed to register user');
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('User successfully registered!');
            });
        });
    });
}

function login(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        body = querystring.parse(body);
        const { user_username, user_password } = body;

        const sql_query = 'SELECT * FROM users WHERE user_username = ?';
        db.query(sql_query, [user_username], (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Internal Server Error');
                return;
            }
            if (results.length === 0) {
                res.writeHead(401, { 'Content-Type': 'text/html' });
                res.end('Invalid username or password');
                return;
            }

            const user = results[0];
            bcrypt.compare(user_password, user.user_password, (err, result) => {
                if (result) {
                    const sessId = createSession(user.user_id);
                    res.writeHead(302, {
                        'Set-Cookie': `sessId=${sessId}; HttpOnly`,
                        'Location': '/MyRecipe'
                    });
                    res.end();
                } else {
                    res.writeHead(401, { 'Content-Type': 'text/html' });
                    res.end('Invalid username or password');
                }
            });
        });
    });
}

http.createServer((req, res) => {
    if (req.url === "/Login_Page" && req.method === 'POST') {
        login(req, res);
    } else if (req.url === "/REGISTRATION_PAGE" && req.method === 'POST') {
        registration(req, res);
    } else if (req.url === "/MyRecipe") {
        const sessId = getSessionId(req);
        if (sess.getSess(sessId)) {
            handlers.getUser(res, sess.getSess(sessId), handlers.navigateToUpload);
        } else {
            handlers.login(res);
        }
    } else if (req.url === "/Logout") {
        const sessId = getSessionId(req);
        sess.deleteSession(sessId);
        handlers.logout(res);
    } else if (req.url === "/edit") {
        const sessId = getSessionId(req);
        if (sess.getSess(sessId)) {
            handlers.editRecipe(res);
        } else {
            handlers.login(res);
        }
    } else if (req.url === "/MyRecipes") {
        const sessId = getSessionId(req);
        if (sess.getSess(sessId)) {
            handleUserRecipe(res, sess.getSess(sessId).user_id);
        } else {
            handlers.login(res);
        }
    } else if (req.url === '/addRecipe' && req.method === 'POST') {
        const sessId = getSessionId(req);
        if (sess.getSess(sessId)) {
            const form = new formidable.IncomingForm();
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error(err);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('Internal Server Error');
                    return;
                }
                const { category_name, recipe_name, cooking_time, serving_size, ingredients, instructions } = fields;
                const sql_query = 'INSERT INTO recipes (category_name, recipe_name, cooking_time, serving_size, ingredients, instructions, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
                const values = [category_name, recipe_name, cooking_time, serving_size, ingredients, instructions, sess.getSess(sessId).user_id];

                db.query(sql_query, values, (err, result) => {
                    if (err) {
                        console.error(err);
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('Error: Failed to insert recipe into the database');
                        return;
                    }
                    console.log("Recipe inserted into the database!");
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end("The recipe is successfully added!");
                });
            });
        } else {
            handlers.login(res);
        }
    } else if (req.url === '/MyRecipes.css') {
        serveStaticFile(res, path.join(__dirname, 'css', 'MyRecipes.css'), 'text/css');
    } else if (req.url === '/') {
        serveStaticFile(res, path.join(__dirname, 'views', 'MyRecipe.html'), 'text/html');
    } else {
        handlers.login(res);
    }
}).listen(3333);

console.log('Server for My recipes running at http://localhost:3333/');

function serveStaticFile(res, filename, contentType) {
    fs.readFile(filename, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.write(data);
        return res.end();
    });
}

function handleUserRecipe(res, user_id) {
    const sql_query = 'SELECT * FROM recipes WHERE user_id = ?';
    db.query(sql_query, [user_id], (err, results) => {
        if (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('Internal Server Error');
            return;
        }
        let html = '<html><head><title>My Recipes</title></head><body>';
        html += '<h1>My Recipes</h1><ul>';
        results.forEach(recipe => {
            html += `<li>
                        <h2>${recipe.category_name}</h2>
                        <p>${recipe.recipe_name}</p>
                        <p>Cooking Time: ${recipe.cooking_time} minutes</p>
                        <p>Serving Size: ${recipe.serving_size}</p>
                        <p>Ingredients: ${recipe.ingredients}</p>
                        <p>Instructions: ${recipe.instructions}</p>
                    </li>`;
        });
        html += '</ul></body></html>';
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    });
}

function getSessionId(req) {
    const cookies = req.headers.cookie;
    if (!cookies) return null;

    const sessId = cookies.split(';').find(cookie => cookie.trim().startsWith('sessId='));
    if (!sessId) return null;

    return sessId.split('=')[1];
}

const sess = {
    sessions: {},
    createSession: function (userId) {
        const sessId = Date.now() + Math.random().toString(36).substr(2);
        this.sessions[sessId] = { user_id: userId };
        return sessId;
    },
    getSess: function (sessId) {
        return this.sessions[sessId];
    },
    deleteSession: function (sessId) {
        delete this.sessions[sessId];
    }
};
