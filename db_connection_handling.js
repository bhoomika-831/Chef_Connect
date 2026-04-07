const mysql = require('mysql');

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'chefconnect'
});

// Connecting to MYSQL 
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL!');
// creating a database 
    db.query('CREATE DATABASE IF NOT EXISTS ChefConnect', (err) => {
        if (err) {
            console.error('Error creating database ChefConnect:', err);
            db.end(); 
            return;
        }
        console.log('Database ChefConnect created or already exists.');

        db.query('USE ChefConnect', (err) => {
            if (err) {
                console.error('Error using database ChefConnect:', err);
                db.end(); 
                return;
            }
            console.log('Using ChefConnect database.');
// creating a table 'user'
            const createUserTableSql = `
                CREATE TABLE IF NOT EXISTS users (
                    user_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_first_name VARCHAR(50),
                    user_last_name VARCHAR(50),
                    user_email VARCHAR(255) UNIQUE,
                    user_username VARCHAR(50) UNIQUE,
                    user_password VARCHAR(255)
                )`;
            db.query(createUserTableSql, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    db.end(); 
                    return;
                }
                console.log('Users table created or already exists.');

                const createRecipesTableSql = `
                    CREATE TABLE IF NOT EXISTS recipes (
                        recipe_id INT AUTO_INCREMENT PRIMARY KEY,
                        category_name VARCHAR(255) NOT NULL,
                        recipe_name VARCHAR(255) NOT NULL,
                        cooking_time VARCHAR(255)NOT NULL,
                        serving_size INT NOT NULL,
                        ingredients TEXT,
                        instructions TEXT,
                        user_id INT NOT NULL
                    )`;
                db.query(createRecipesTableSql, (err) => {
                    if (err) {
                        console.error('Error creating recipes table:', err);
                        db.end(); 
                        return;
                    }
                    console.log('Recipes table created or already exists.');

                    db.end((err) => {
                        if (err) {
                            console.error('Error closing connection:', err);
                        }
                        console.log('MySQL connection closed.');
                    });
                });
            });
        });
    });
});

module.exports = db;
