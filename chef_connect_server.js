var http = require('http');
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var formidable = require('formidable');
var module = require('./module');
var querystring  = require('querystring');
var bcrypt = require('bcrypt');
const saltRounds = 10;

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin",
    database: "chefconnect"
});

db.connect(function(err) {
    if (err) throw err;
    console.log('Connected to mySQL database.');
});

function registration(req, res) {
    var body = ' ';
    req.on('data',function(chunk) {
        body += chunk.toString();
    });
    req.on('end', function () {
        body = querystring.parse(body);
        var ufirst_name = body.user_first_name;
        var ulast_name = body.user_last_name;
        var email = body.user_email;
        var u_username = body.user_username;
        var u_password = body.user_password;

        bcrypt.hash(u_password, saltRounds, function(err, hash){
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Internal Server Error');
                return;
            }
            var sql_query = "INSERT INTO users (user_first_name, user_last_name, user_email, user_username, user_password) VALUES (?, ?, ?, ?, ?)";
            var values = [];

            con.query(sql, values, function (err, result) {
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
    var body = '';

    req.on('data', function (chunk) {
        body += chunk.toString();
    });

    req.on('end', function () {
        body = querystring.parse(body);
        var u_username = body.user_username;
        var u_password = body.user_password;

        var sql_query = 'select * from users where user_username = ?';
        db.query(sql_query,[u_username],function(err, results) {
            if (err){
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Internal Server Error');
                return;
            }
            if (results.length === 0) {
                res.writeHead(401, { 'Content-Type': 'text/html' });
                res.end('Invalid username or password');
                return;
            }

            var user = results[0];
            bcrypt.compare(u_password, user.user_password, function (err, result) {
                if (result) {
                    var sessId = sess.createSession(user.user_id);
                    res.writeHead(302, {
                        'Set-Cookie': 'sessId=${sessId}; HttpOnly',
                        'Location': '/MyRecipe'
                    });
                    res.end();
                } else {
                    res.writeHead(401, { 'Content-Type': 'text/html' });
                    res.end('Invalid email or password');
                }
            });
        });
    });
}

http.createServer(function(req,res) {
    var body = '';

    if (req.url == "/Login_Page" && req.method === 'POST') {
        login(req, res);
    } else if (req.url == "/REGISTRATION_PAGE" && req.method === 'POST') {
        registration(req,res);
    } else if (req.url == "/MyRecipe") {
        var sessId = getSessionId(req);
        if (sess.getSess(sessId)){
            module.getUser(res, sess.getSess(sessId),module.navigateToAddRecipe);
        } else {
            module.login(res);
        }
    } else if (req.url == "/Logout") {
        var sessId = getSessionId(req);
        sess.deleteSession(sessId);
        module.logout(res);
    } else if (req.url == "/edit") {
        var sessId = getSessionId(req);
        if (sess.getSess(sessId)){
        module.editRecipe(res);
    } else {
        module.login(res);
    }
    } else if (req.url == "/MyRecipes"){
        var sessId = getSessionId(req);
        if(sess.getSess(sessId)) {
            handleUserRecipe(res, sess.getSess(sessId).user_id);
        } else {
            module.login(res);
        }
    } else if (req.url === '/addRecipe' && req.method === 'POST') {
        var sessId = getSessionId(req);
        if (sess.getSess(sessId)) {
            var form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                if (err)
                    console.error(err);
                res.writeHead(500, {'Content-Type' : 'text/html'});
                res.end('Internal Server Error');
                return;
            })
            var category_name = category_name;
            var recipe_name = recipe_name;
            var cooking_time = cooking_time;
            var serving_size = serving_size;
            var ingredients = ingredients;
            var instructions = instructions;

            var sql_query = "INSERT INTO recipes (category_name, recipe_name, cooking_time, serving_size, ingredients, instructions) VALUES (?,?,?,?,?,?)";
            var values = [category_name, recipe_name, cooking_time, serving_size, ingredients, instructions, sess.getSess(sessId).user_id];

            db.query(sql_query, values, function(err,result){
                if (err) {
                    console.error(err);
                    res.writeHead(500,{'Content-Type' : 'text/html' });
                    res.end('Error: Failed to insert recipe into the database');
                    return;
                }
                console.log("Recipe inserted into the database!");
                res.writeHead(200, {'Content-Type':'text/html' });
                res.end("The recipe is successfully added!");
            });
        } else {
            module.login(res);
        }
    } else if (req.url === '/MyRecipes.css') {
        serveStaticFile(res, path.join(__dirname, 'css', 'MyRecipes.css'), 'text/css');
    
    } else if (req.url === '/') {
        serveStaticFile(res, path.join(__dirname, 'views','MyRecipe.html'), 'text/html');

    }else {
        module.login(res);
    }

    }).listen(8080);

    console.log('Server for My recipes running at http://localhost:3333/');

    function serveStaticFile(res, filename, contentType) {
        fs.readFile(filename, function(err, data){
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
    var sql_query = "SELECT * FROM recipes WHERE user_id = ?";
    db.query(sql_query, [user_id], function(err, results){
        if (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('Internal Server Error');
            return;
        }
        var html = '<html><head><title>My Recipes</title></head><body>';
        html += '<h1>My Recipes</h1><ul>';
        results.forEach(function (recipe) {
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
    var cookies = req.headers.cookies;
    if (!cookies) return null;

    var sessId = cookies.split(';').find(cookie => cookie.trim().startsWith('sessId='));
    if (!sessId) return null;

    return sessId.split('=')[1];
}