const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 3000;


// connect to SQL server
const dbconnection = mysql.createConnection({
    host: "localhost",
    user: "uni1",
    password: "uni1",
    database: "sqlthaykien",
    insecureAuth: true
});
dbconnection.connect(err => {
    if (err) 
        console.log('Failed to connect: ' + err);
    else console.log('Connected to database');
});

app.all('/', (req, res) => {
    // Read the HTML file to template
    const fs = require('fs');
    const template = fs.readFileSync('projectSQL.html', 'utf8');

    // render the template
    res.send(template);
});
app.all('/ingredient/:ingredient_id', (req, res) => {

    const selectQuery='select * from department where ingredient_id=?';
    const ingredientID=req.params.ingredient_id;
    dbconnection.query(selectQuery,[ingredientID],
        (err, results) => {
        if (err) return res.send('Query error');

        if (results.length == 0) return res.send("No ingredient  with that ID");

        let html = '<p>Ingredient ID: ' + results[0].ingredient_id + '</p>' +
            '<p>Ingredient Name: ' + results[0].ingredient_name + '</p>' +
            '<p>Quantity: ' + results[0].quantity + '</p>'+
            '<p>Import date: ' + results[0].import_date + '</p>'+
            '<p>Expired date: ' + results[0].expired_date + '</p>'+
            '<p>Counting unit: ' + results[0].counting_unit + '</p>';
        res.send(html);
    });
})
app.all('/ingredients', (req, res) => {
    const selectQuery='select ingredient_id from ingredient';
    dbconnection.query(selectQuery, (err, results) => {
        if (err) return res.send('Query error');

        let html = '<ul>';
        for (let i = 0; i < results.length; i++) {
            html += '<li><button onclick="location.href=\'/ingredient/' + results[i].ingredient_id + '\';">' +
                    results[i].ingredient_id + '</button></li>';
        }
        html += '</ul>';

        res.send(html);
    })
})

// dishs
app.all('/dishs', (req, res) => {
    const page = req.query.page || 1; // Get the requested page number from query parameters (default: 1)
    const limit = 20; // Number of IDs per page
  
    // Calculate the offset based on the requested page number and limit
    const offset = (page - 1) * limit;
    
    const selectQuery='select * from dish';
    dbconnection.query(selectQuery, (err, results) => {
      if (err) return res.send('Query error');
  
      const totalIDs = results.length;
      const totalPages = Math.ceil(totalIDs / limit);
      const queryConnection='SELECT dish_id FROM dish ORDER BY ID DESC LIMIT ? OFFSET ? ';
      queryConnection.query(
        queryConnetction,
        [limit, offset],
        (err, results) => {
          if (err) return res.send('Query error');
  
          let html = '<ul>';
          for (let i = 0; i < results.length; i++) {
            html +=
              '<li><a href="/dish/' + results[i].dish_id + '">' + results[i].dish_id + '</a></li>';
          }
          html += '</ul>';
  
          // Append pagination information to the HTML response
          html += `<p>Page ${page} of ${totalPages}</p>`;
  
          // Append pagination links if there are more pages
          if (totalPages > 1 && page < totalPages) {
            html += `<a href="/dishs?page=${parseInt(page) + 1}">Next</a>`;
          }
          if (totalPages > 1 && page > 1) {
            html += `<a href="/dishs?page=${parseInt(page) - 1}">   Previous</a>`;
          }
          res.send(html);
        }
      );
    });
  });
  
  app.all('/dish/:dish_id', (req, res) => {
    const queryConnection='select * from dish where dish_id=?';
    const dishID=req.params.dish_id;
    dbconnection.query(queryConnection,[dishID],
      (err, results) => {
        if (err) return res.send('Query error');
  
        if (results.length === 0) return res.send("No information");
  
        const html =
          '<p>ID dish: ' +
          results[0].dish_id +
          '</p>' +
          '<p>Name dish: ' +
          results[0].dish_name +
          '</p>' +
          '<p>Price: ' +
          results[0].price +
          '</p>' +
          '<p>Avaiable: ' +
          results[0].avaiable +
          '</p>';
        res.send(html);
      }
    );
  });
////dish_ingerdients 
app.all('/dish_ingredients', (req, res) => {
  const page = req.query.page || 1; // Get the requested page number from query parameters (default: 1)
  const limit = 20; // Number of IDs per page

  // Calculate the offset based on the requested page number and limit
  const offset = (page - 1) * limit;
  const selectQuery='SELECT dish_id FROM dish_ingredient'
  dbconnection.query(selectQuery, (err, results) => {
    if (err) return res.send('Query error');

    const totalIDs = results.length;
    const totalPages = Math.ceil(totalIDs / limit);
    
    const queryConnection='SELECT dish_id FROM dish_ingredient ORDER BY ID DESC LIMIT ? OFFSET ? ';
    // Get the IDs for the requested page
    dbconnection.query(
      queryConnection,
      [limit, offset],
      (err, results) => {
        if (err) return res.send('Query error');

        let html = '<ul>';
        for (let i = 0; i < results.length; i++) {
          html +=
            '<li><a href="/dish_ingredient/' + results[i].dish_id + '">' + results[i].dish_id + '</a></li>';
        }
        html += '</ul>';

        // Append pagination information to the HTML response
        html += `<p>Page ${page} of ${totalPages}</p>`;

        // Append pagination links if there are more pages
        if (totalPages > 1 && page < totalPages) {
          html += `<a href="/dish_ingredients?page=${parseInt(page) + 1}">Next</a>`;
        }
        if (totalPages > 1 && page > 1) {
          html += `<a href="/dish_ingredients?page=${parseInt(page) - 1}">   Previous</a>`;
        }
        res.send(html);
      }
    );
  });
});

app.all('/dish_ingredient/:dish_id', (req, res) => {
  selectQuery='SELECT * FROM dish_ingredient WHERE dish_id=? ';
  dishID=req.params.dish_id;
  dbconnection.query(
    selectQuery,
    [dishID],
    (err, results) => {
      if (err) return res.send('Query error');

      if (results.length === 0) return res.send("No information");

      const html =
        '<p>ID dish: ' +
        results[0].dish_id +
        '</p>' +
        '<p>Ingredient ID: ' +
        results[0].ingredient_id +
        '</p>';
      res.send(html);
    }
  );
});

// origin

app.all('/origins', (req, res) => {
  const page = req.query.page || 1; // Get the requested page number from query parameters (default: 1)
  const limit = 20; // Number of IDs per page

  // Calculate the offset based on the requested page number and limit
  const offset = (page - 1) * limit;
  
  const selectQuery='SELECT origin_id FROM origin  ';
  dbconnection.query(selectQuery, (err, results) => {
    if (err) return res.send('Query error');

    const totalIDs = results.length;
    const totalPages = Math.ceil(totalIDs / limit);

    const queryConnection='SELECT orgin_id FROM origin ORDER BY ID DESC LIMIT ? OFFSET ? ';
    // Get the IDs for the requested page
    dbconnection.query(
      queryConnection,
      [limit, offset],
      (err, results) => {
        if (err) return res.send('Query error');

        let html = '<ul>';
        for (let i = 0; i < results.length; i++) {
          html +=
            '<li><a href="/origin/' + results[i].origin_id + '">' + results[i].origin_id + '</a></li>';
        }
        html += '</ul>';

        // Append pagination information to the HTML response
        html += `<p>Page ${page} of ${totalPages}</p>`;

        // Append pagination links if there are more pages
        if (totalPages > 1 && page < totalPages) {
          html += `<a href="/origins?page=${parseInt(page) + 1}">Next</a>`;
        }
        if (totalPages > 1 && page > 1) {
          html += `<a href="/origins?page=${parseInt(page) - 1}">   Previous</a>`;
        }
        res.send(html);
      }
    );
  });
});

app.all('/origin/:origin_id', (req, res) => {

  const selectQuery='SELECT * FROM origin WHERE origin_id=? ';
  const originID=req.params.origin_id;
  dbconnection.query(
    selectQuery,
    [originID],
    (err, results) => {
      if (err) return res.send('Query error');

      if (results.length === 0) return res.send("No information");

      const html =
        '<p>ID origin: ' +
        results[0].origin_id +
        '</p>' +
        '<p>Name origin: ' +
        results[0].origin_name +
        '</p>';
      res.send(html);
    }
  );
});
// dish_origin
app.all('/dish_origins', (req, res) => {
  const page = req.query.page || 1; // Get the requested page number from query parameters (default: 1)
  const limit = 20; // Number of IDs per page

  // Calculate the offset based on the requested page number and limit
  const offset = (page - 1) * limit;

  const selectQuery='SELECT origin_id FROM dish_origin  ';
  dbconnection.query(selectQuery, (err, results) => {
    if (err) return res.send('Query error');

    const totalIDs = results.length;
    const totalPages = Math.ceil(totalIDs / limit);

    const queryConnection='SELECT orgin_id FROM dish_origin ORDER BY ID DESC LIMIT ? OFFSET ? ';
    // Get the IDs for the requested page
    dbconnection.query(
      queryConnection,
      [limit, offset],
      (err, results) => {
        if (err) return res.send('Query error');

        let html = '<ul>';
        for (let i = 0; i < results.length; i++) {
          html +=
            '<li><a href="/dish_origin/' + results[i].origin_id + '">' + results[i].origin_id + '</a></li>';
        }
        html += '</ul>';

        // Append pagination information to the HTML response
        html += `<p>Page ${page} of ${totalPages}</p>`;

        // Append pagination links if there are more pages
        if (totalPages > 1 && page < totalPages) {
          html += `<a href="/dish_origins?page=${parseInt(page) + 1}">Next</a>`;
        }
        if (totalPages > 1 && page > 1) {
          html += `<a href="/dish_origins?page=${parseInt(page) - 1}">   Previous</a>`;
        }
        res.send(html);
      }
    );
  });
});

app.all('/dish_origin/:origin_id', (req, res) => {
  const selectQuery='SELECT * FROM dish_origin WHERE origin_id=? ';
  const originID=req.params.origin_id;
  dbconnection.query(
    selectQuery,
    [originID],
    (err, results) => {
      if (err) return res.send('Query error');

      if (results.length === 0) return res.send("No information");

      const html =
        '<p>ID dish: ' +
        results[0].dish_id +
        '</p>' +
        '<p>ID origin: ' +
        results[0].origin_id +
        '</p>';
      res.send(html);
    }
  );
});

// category

app.all('/categorys', (req, res) => {
  const page = req.query.page || 1; // Get the requested page number from query parameters (default: 1)
  const limit = 20; // Number of IDs per page

  // Calculate the offset based on the requested page number and limit
  const offset = (page - 1) * limit;

  const selectQuery='SELECT category_id FROM category ';
  dbconnection.query(selectQuery, (err, results) => {
    if (err) return res.send('Query error');

    const totalIDs = results.length;
    const totalPages = Math.ceil(totalIDs / limit);


    const queryConnection='SELECT category_id FROM category ORDER BY ID DESC LIMIT ? OFFSET ? ';
    // Get the IDs for the requested page
    dbconnection.query(
      queryConnection,
      [limit, offset],
      (err, results) => {
        if (err) return res.send('Query error');

        let html = '<ul>';
        for (let i = 0; i < results.length; i++) {
          html +=
            '<li><a href="/category/' + results[i].category_id + '">' + results[i].category_id + '</a></li>';
        }
        html += '</ul>';

        // Append pagination information to the HTML response
        html += `<p>Page ${page} of ${totalPages}</p>`;

        // Append pagination links if there are more pages
        if (totalPages > 1 && page < totalPages) {
          html += `<a href="/categorys?page=${parseInt(page) + 1}">Next</a>`;
        }
        if (totalPages > 1 && page > 1) {
          html += `<a href="/categorys?page=${parseInt(page) - 1}">   Previous</a>`;
        }
        res.send(html);
      }
    );
  });
});

app.all('/category/:category_id', (req, res) => {
  const selectQuery='SELECT * FROM category WHERE category_id=? ';
  const categoryID=req.params.category_id;
  dbconnection.query(
    selectQuery,
    [categoryID],
    (err, results) => {
      if (err) return res.send('Query error');

      if (results.length === 0) return res.send("No information");

      const html =
        '<p>ID category: ' +
        results[0].category_id +
        '</p>' +
        '<p>Name category: ' +
        results[0].category_name +
        '</p>';
      res.send(html);
    }
  );
});
// dish_category
app.all('/dish_categorys', (req, res) => {
  const page = req.query.page || 1; // Get the requested page number from query parameters (default: 1)
  const limit = 20; // Number of IDs per page

  // Calculate the offset based on the requested page number and limit
  const offset = (page - 1) * limit;

  const queryConnection='SELECT category_id FROM dish_category  ';
  dbconnection.query(queryConnection, (err, results) => {
    if (err) return res.send('Query error');

    const totalIDs = results.length;
    const totalPages = Math.ceil(totalIDs / limit);

    const queryConnection='SELECT category_id FROM dish_category ORDER BY ID DESC LIMIT ? OFFSET ? ';
    // Get the IDs for the requested page
    dbconnection.query(
      'SELECT category_id FROM dish_category ORDER BY ID DESC LIMIT ? OFFSET ? ',
      [limit, offset],
      (err, results) => {
        if (err) return res.send('Query error');

        let html = '<ul>';
        for (let i = 0; i < results.length; i++) {
          html +=
            '<li><a href="/dish_category/' + results[i].category_id + '">' + results[i].category_id + '</a></li>';
        }
        html += '</ul>';

        // Append pagination information to the HTML response
        html += `<p>Page ${page} of ${totalPages}</p>`;

        // Append pagination links if there are more pages
        if (totalPages > 1 && page < totalPages) {
          html += `<a href="/dish_categorys?page=${parseInt(page) + 1}">Next</a>`;
        }
        if (totalPages > 1 && page > 1) {
          html += `<a href="/dish_categorys?page=${parseInt(page) - 1}">   Previous</a>`;
        }
        res.send(html);
      }
    );
  });
});

app.all('/dish_category/:category_id', (req, res) => {
  const selectQuery='SELECT * FROM dish_category WHERE category_id=? ';
  const categoryID=req.params.ID;
  dbconnection.query(
    selectQuery,
    [categoryID],
    (err, results) => {
      if (err) return res.send('Query error');

      if (results.length === 0) return res.send("No information");

      const html =
        '<p>ID dish category: ' +
        results[0].category_id +
        '</p>' +
        '<p>ID category: ' +
        results[0].category_id +
        '</p>';
      res.send(html);
    }
  );
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
