const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 3000;

// create user root;
// grant all on restaurant.* to root;
// alter user root  identified WITH mysql_native_password BY 'root';

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
    else console.log('Connected to database');
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.all('/', (req, res) => {
  res.render('index');
});


app.all('/ingredients', (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the current page from the query parameters
  const limit = 6; // Number of items per page
  const offset = (page - 1) * limit; // Calculate the offset

  const query = `SELECT i.ingredient_id, 
                        i.ingredient_name, 
                        i.quantity, 
                        i.import_date, 
                        i.expired_date, 
                        i.counting_unit,
                        i.ingredient_image_url,
                        GROUP_CONCAT(DISTINCT dish.dish_name SEPARATOR ', ') AS dishes
                 FROM ingredient i
                 LEFT JOIN dish_ingredient ON i.ingredient_id = dish_ingredient.ingredient_id
                 LEFT JOIN dish ON dish_ingredient.dish_id = dish.dish_id
                 GROUP BY i.ingredient_id
                 LIMIT ${limit}
                 OFFSET ${offset}`;

  dbconnection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing the query: ' + error.stack);
      return;
    }

    dbconnection.query('SELECT COUNT(*) AS total FROM ingredient', (error, countResult) => {
      if (error) {
        console.error('Error executing the query: ' + error.stack);
        return;
      }

      const totalItems = countResult[0].total; // Total number of items
      const totalPages = Math.ceil(totalItems / limit); // Total number of pages

      res.render('ingredients', { ingredients: results, currentPage: page, totalPages: totalPages });
    });
  });
});


app.all('/menu', (req, res) => {
  const page = req.query.page || 1; 
  const limit = 6; 
  const offset = (page - 1) * limit;

  const query = `SELECT dish.dish_id,
                        dish.dish_name, 
                        dish.price,
                        dish.available,
                        dish.dish_image_url, 
                        GROUP_CONCAT(DISTINCT origin.origin_name SEPARATOR ', ') AS origins, 
                        GROUP_CONCAT(DISTINCT category.category_name SEPARATOR ', ') AS categorys, 
                        GROUP_CONCAT(DISTINCT ingredient.ingredient_name SEPARATOR ', ') AS ingredients
                 FROM dish
                 LEFT JOIN dish_origin ON dish.dish_id = dish_origin.dish_id
                 LEFT JOIN origin ON dish_origin.origin_id = origin.origin_id
                 LEFT JOIN dish_category ON dish.dish_id = dish_category.dish_id
                 LEFT JOIN category ON dish_category.category_id = category.category_id
                 LEFT JOIN dish_ingredient ON dish.dish_id = dish_ingredient.dish_id
                 LEFT JOIN ingredient ON dish_ingredient.ingredient_id = ingredient.ingredient_id
                 GROUP BY dish.dish_id
                 LIMIT ${limit}
                 OFFSET ${offset}`;

  dbconnection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing the query: ' + error.stack);
      return;
    }

  dbconnection.query('SELECT COUNT(*) AS total FROM dish', (error, countResult) => {
      if (error) {
        console.error('Error executing the query: ' + error.stack);
        return;
      }
      const totalItems = countResult[0].total; 
      const totalPages = Math.ceil(totalItems / limit); 

      res.render('menu', { dishes: results, currentPage: page, totalPages: totalPages });
    });
  });
});


app.get('/search_menu', (req, res) => {
  const origin = req.query.origin;
  const category = req.query.category;
  const ingredients = req.query.ingredient;

  let query = `
    SELECT dish.dish_id, 
           dish.dish_name, 
           dish.price,
           dish.available,
           dish.dish_image_url,  
           GROUP_CONCAT(DISTINCT origin.origin_name SEPARATOR ', ') AS origins, 
           GROUP_CONCAT(DISTINCT category.category_name SEPARATOR ', ') AS categorys, 
           GROUP_CONCAT(DISTINCT ingredient.ingredient_name SEPARATOR ', ') AS ingredients
    FROM dish
    LEFT JOIN dish_origin ON dish.dish_id = dish_origin.dish_id
    LEFT JOIN origin ON dish_origin.origin_id = origin.origin_id
    LEFT JOIN dish_category ON dish.dish_id = dish_category.dish_id
    LEFT JOIN category ON dish_category.category_id = category.category_id
    LEFT JOIN dish_ingredient ON dish.dish_id = dish_ingredient.dish_id
    LEFT JOIN ingredient ON dish_ingredient.ingredient_id = ingredient.ingredient_id
    WHERE 1=1`; // Thêm điều kiện WHERE 1=1

  const params = []; // Mảng chứa các tham số truy vấn

  // Kiểm tra và xây dựng điều kiện truy vấn cho origin, category và ingredients
  if (origin && origin.length > 0) {
    query += " AND origin.origin_name IN (?)";
    params.push(origin);
  }
  
  if (category && category.length > 0) {
    query += " AND category.category_name IN (?)";
    params.push(category);
  }

  if (ingredients && ingredients.length > 0) {
    query += " AND ingredient.ingredient_name IN (?)";
    params.push(ingredients);
  }

  query += `
    GROUP BY dish.dish_id
    ORDER BY dish.dish_id`;

  dbconnection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error executing the query: ' + error.stack);
      return;
    }

    // Truy vấn danh sách tất cả các danh mục, nguyên liệu và nguồn gốc từ cơ sở dữ liệu
    const selectCategoriesQuery = `SELECT DISTINCT category_name AS category FROM category`;
    const selectIngredientsQuery = `SELECT DISTINCT ingredient_name AS ingredient FROM ingredient`;
    const selectOriginsQuery = `SELECT DISTINCT origin_name AS origin FROM origin`;    

    dbconnection.query(selectCategoriesQuery, (error, categories) => {
      if (error) {
        console.error('Error executing the query: ' + error.stack);
        return;
      }

      dbconnection.query(selectIngredientsQuery, (error, ingredients) => {
        if (error) {
          console.error('Error executing the query: ' + error.stack);
          return;
        }

        dbconnection.query(selectOriginsQuery, (error, origins) => {
          if (error) {
            console.error('Error executing the query: ' + error.stack);
            return;
          }

          res.render('search_menu', { 
            search_results: results, 
            selectOptions: {
              categories: categories,
              ingredients: ingredients,
              origins: origins
            }
          });
        });
      });
    });
  });
});


app.get('/dishID=:dishId', (req, res) => {
  const dishId = req.params.dishId;

  const query = `SELECT dish.dish_id,
                        dish.dish_name, 
                        dish.price_unit,
                        dish.price,
                        dish.available,
                        dish.dish_image_url, 
                        GROUP_CONCAT(DISTINCT origin.origin_name SEPARATOR ', ') AS origins, 
                        GROUP_CONCAT(DISTINCT category.category_name SEPARATOR ', ') AS categorys, 
                        GROUP_CONCAT(DISTINCT ingredient.ingredient_name SEPARATOR ', ') AS ingredients
                 FROM dish
                 LEFT JOIN dish_origin ON dish.dish_id = dish_origin.dish_id
                 LEFT JOIN origin ON dish_origin.origin_id = origin.origin_id
                 LEFT JOIN dish_category ON dish.dish_id = dish_category.dish_id
                 LEFT JOIN category ON dish_category.category_id = category.category_id
                 LEFT JOIN dish_ingredient ON dish.dish_id = dish_ingredient.dish_id
                 LEFT JOIN ingredient ON dish_ingredient.ingredient_id = ingredient.ingredient_id
                 WHERE dish.dish_id = ?
                 GROUP BY dish.dish_id`;

  dbconnection.query(query, [dishId], (error, results) => {
    if (error) {
      console.error('Error executing the query: ' + error.stack);
      return;
    }

    console.log('dish_detail:', results[0]);
    res.render('dish_details', { dish_detail: results[0] });
  });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});