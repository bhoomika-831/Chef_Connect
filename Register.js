var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var mysql = require('mysql');
var querystring = require('querystring');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin", 
    database: "chefconnect"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL database!")
});

var mainFolfer = './Chef-Connect';

http.createServer(function (req, res) {
    var parseUrl = url.parse(req.url, true);
    var pathname = parseUrl.pathname;

    if (req.method === 'POST') {
        if (pathname === '/Login_Page') {
            handle_login(req, res);
        } else if (pathname === '/REGISTRATION_PAGE') {
            handle_register(req, res);
        } else {
            res.writeHead(404, { 'Content-Type':'text/html'});
            res.end('404 Not Found');
        }
    } else {
        var contentType = getContentType(pathname);

        var filePath;
        if (pathname === '/') {
            filePath = path.join(mainFolder, 'index.html');
        } else if (pathname.endsWith('.html') || pathname.endsWith('.js') || pathname.endsWith('.css')) {
            filePath = path.join(mainFolder, pathname);
        } else if (pathname.startsWith('/image/')) {
            filePath = path.join(__dirname, pathname);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end('404 Not Found');
        }

        fs.readFile(filePath, function(err, Content) {
            if (err) {
                console.log(err);
                res.writeHead(404, { 'Content-Type':'text/html'});
                return res.end('404 Not Found');
            }
            res.writeHead(200, { 'Content-Type':contentType});
            res.end(Content);
        });
    }
}).listen(8080);

console.log('File server running at http://localhost:8080/');

function getContentType(pathname) {
    if (pathname.endsWith('.html')) {
        return 'text/html';
    } else if (pathname.endsWith('.js')) {
        return 'application/javascript';
    } else if (pathname.endsWith('.css')) {
        return 'text/css';
    } else if (pathname.endsWith('.png')) {
        return 'image/png';
    } else if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
        return 'image/jpeg';
    } else {
        return 'text/html';
    }
}

function handle_login(req, res) {
    let body = ' ';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const parse_body = querystring.parse(body);
        const email = parse_body.user_email;
        const u_password = parse_body.user_password;

        con.query('select * from users where user_email = ? and user_password = ?', [email, u_password], (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Internal Server Error');
                return;
            }
            if (results.length > 0) {
                res.writeHead(302, {'Location':'/Login_Page.html'});
                res.end();
            } else {
                res.writeHead(401, { 'Content-Type': 'text/html' });
                res.end('Invalid email or password');
            }
        });
    });
}

function handle_register(req, res) {
    let body = ' ';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const parse_body = querystring.parse(body);
        const ufirst_name = parse_body.user_first_name;
        const ulast_name = parse_body.user_last_name;
        const email = parse_body.user_email;
        const u_password = parse_body.user_password;
        const u_username = parse_body.user_username;

        const sql = 'INSERT INTO users (user_first_name, user_last_name, user_email, user_username, user_password) VALUES (?,?,?,?,?)';
        con.query(sql, [ufirst_name, ulast_name, email, u_password, u_username], (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Internal Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('Registration successful! Please <a href="/">Login_Page</a>.');
        });
    });
}