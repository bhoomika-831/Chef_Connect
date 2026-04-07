// Require necessary modules
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
let db;

// MySQL connection configuration
const connectToDB = () => {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'admin',
        database: 'chefconnect' 
    });
};

// Connect to the database
db = connectToDB();
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

// Authenticate user credentials
exports.authenticateUser = function (res, body, sess, myCallback) {
    const u_Username = body.user_username;
    const u_Password = body.user_password;

    db = connectToDB();
    db.connect(function (err) {
        if (err) throw err;

        const sql_query = "SELECT * from users WHERE user_username = ? AND user_password = ?";
        con.query(sql_query, [u_Username, u_Password], function (err, result) {
            if (err) throw err;
            if (result && result.length > 0) {
                myCallback(res, sess, result[0].user_id, body);
            } else {
                const message = "<script>document.getElementById(\"demo_error_message\").innerHTML = \"You have entered an incorrect username or password!\";</script>";
                fs.readFile("Login_Page.html", function (err, data) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    return res.end(message);
                });
            }
        });
    });
};

// Handle login page request
exports.login = function (res) {
    fs.readFile("Login_Page.html", function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
};

// Handle user logout
exports.logout = function (res) {
    fs.readFile("login.html", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        con.destroy();
        return res.end();
    });
};

// Navigate to home page
exports.navigateToAddRecipe = function (res) {
    fs.readFile("MyRecipe.html", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
};

// Function to retrieve recipes by user ID
exports.getRecipesByUserId = function (res, user_id, callback) {
    const sql = "SELECT * FROM recipes WHERE user_id = ?";
    con.query(sql, [user_id], function (err, results) {
        if (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('Error: Failed to retrieve recipes');
            return;
        }
        callback(res, results);
    });
};

// Function to render recipes on the page
function renderRecipesPage(res, recipes) {
    fs.readFile(path.join(__dirname, 'views','MyRecipes.html'), 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('Error: Failed to load page');
            return;
        }
        const renderedPage = data.replace('{{recipes}}', JSON.stringify(recipes));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(renderedPage);
    });
}

// Function to navigate to the All Recipes page and dynamically show user's recipes
exports.navigateToMyRecipes = function (res, recipes) {
    fs.readFile("MyRecipe.html", function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data.toString());
        res.write("<script>");
        res.write("const recipes = " + JSON.stringify(recipes) + ";\n");
        res.write("const recipesContainer = document.getElementById('recipesContainer');\n");
        res.write("recipesContainer.innerHTML = '<h2>My Recipes</h2>';\n");
        res.write("recipes.forEach(recipe => {\n");
        res.write("    recipesContainer.innerHTML += `<div class=\"recipe\">\n");
        res.write("        <p>Recipe ID: ${recipe.recipe_id}</p>\n");
        res.write("        <p>Food Pic: <img src=\"/uploads/${recipe.food_pic}\" alt=\"Food Pic\" width=\"100\"></p>\n");
        res.write("        <p>Description: ${recipe.recipe_description}</p>\n");
        res.write("        <p>Cooking Duration: ${recipe.cooking_duration}</p>\n");
        res.write("        <p>Author: ${recipe.author_name}</p>\n");
        res.write("        <p>Cuisine Type: ${recipe.cuisine_type}</p>\n");
        res.write("        <button onclick=\"editRecipe(${recipe.recipe_id})\">Edit</button>\n");
        res.write("        <button onclick=\"deleteRecipe(${recipe.recipe_id})\">Delete</button>\n");
        res.write("    </div><hr>`;\n");
        res.write("});\n");
        res.write("</script>");
        return res.end();
    });
};

// Handle request to edit a recipe
exports.editRecipe = function (res) {
    fs.readFile("edit.html", function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
};

// Save recipe information to the database
exports.saveRecipe = function (recipeData, callback) {
    const { recipeName, recipeDescription, cookingDuration, authorName, cuisineType, foodPic } = recipeData;

    const sql = 'INSERT INTO recipes (recipe_name, recipe_description, cooking_duration, author_name, cuisine_type, food_pic) VALUES (?, ?, ?, ?, ?, ?)';
    con.query(sql, [recipeName, recipeDescription, cookingDuration, authorName, cuisineType, foodPic], (err, result) => {
        if (err) {
            console.error('Error inserting into database:', err);
            return callback(err, null);
        }
        console.log('Recipe inserted into database with ID:', result.insertId);
        callback(null, result.insertId);
    });
};