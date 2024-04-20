const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 3000;

// connect to SQL server
const dbconnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "restaurant",
    insecureAuth: true
});

dbconnection.connect(err => {
    if (err) 
        console.log('Failed to connect: ' + err);
    else {
        console.log('Connected to database');
        // Thực thi các câu lệnh SQL ở đây
        const createRestUserQuery = "CREATE USER 'rest1'@'localhost'";
        const grantPermissionsQuery = "GRANT ALL ON restaurant.* TO 'rest1'@'localhost'";
        const alterUserQuery = "ALTER USER 'rest1'@'localhost' IDENTIFIED WITH mysql_native_password BY 'rest1'";

        dbconnection.query(createRestUserQuery, (err, result) => {
            if (err) throw err;
            console.log("User 'rest1' created");

            dbconnection.query(grantPermissionsQuery, (err, result) => {
                if (err) throw err;
                console.log("Permissions granted to 'rest1'");

                dbconnection.query(alterUserQuery, (err, result) => {
                    if (err) throw err;
                    console.log("User 'rest1' identified with mysql_native_password");
                });
            });
        });
    }
});

// Rest of your Express app code
