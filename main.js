const mysql = require('mysql');
const express = require('express');

const app = express();

// create user uni1;
// grant all on university.* to uni1;
// alter user uni1 identified WITH mysql_native_password BY 'uni1';

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
  let html = '<p><a href="/ingredients">Ingredient list</a></p>' +
      '<p><a href="/dishs?page=1">Dish list</a></p>'+
      '<p><a href="/dish_ingredients?page=1">Dish ingredient list</a></p>'+
      '<p><a href="/origins?page=1">Origin list</a></p>'+
      '<p><a href="/dish_origins?page=1">Dish origin list</a></p>'+
      '<p><a href="/categorys?page=1">Category list</a></p>'+
      '<p><a href="/dish_categorys?page=1">Dish category list</a></p>';
  res.send(html);
})
// ingredients 
app.all('/ingredient/:ingredient_id', (req, res) => {

    dbconnection.query('select * from department where ingredient_id=?',
        [req.params.ingredient_id],

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
    dbconnection.query('select ingredient_id from ingredient', (err, results) => {
        if (err) return res.send('Query error');

        let html = '<ul>';
        for (let i = 0; i < results.length; i++) {
            html += '<li><a href="/ingredient/' + results[i].ingredient_id + '">' +
                    results[i].ingredient_id + '</a></li>';
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
  
    dbconnection.query('SELECT dish_id FROM dish  ', (err, results) => {
      if (err) return res.send('Query error');
  
      const totalIDs = results.length;
      const totalPages = Math.ceil(totalIDs / limit);
  
      // Get the IDs for the requested page
      dbconnection.query(
        'SELECT dish_id FROM dish ORDER BY ID DESC LIMIT ? OFFSET ? ',
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
    dbconnection.query(
      'SELECT * FROM dish WHERE dish_id=? ',
      [req.params.ID],
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

  dbconnection.query('SELECT dish_id FROM dish_ingredient  ', (err, results) => {
    if (err) return res.send('Query error');

    const totalIDs = results.length;
    const totalPages = Math.ceil(totalIDs / limit);

    // Get the IDs for the requested page
    dbconnection.query(
      'SELECT dish_id FROM dish_ingredient ORDER BY ID DESC LIMIT ? OFFSET ? ',
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
  dbconnection.query(
    'SELECT * FROM dish_ingredient WHERE dish_id=? ',
    [req.params.ID],
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

  dbconnection.query('SELECT origin_id FROM origin  ', (err, results) => {
    if (err) return res.send('Query error');

    const totalIDs = results.length;
    const totalPages = Math.ceil(totalIDs / limit);

    // Get the IDs for the requested page
    dbconnection.query(
      'SELECT orgin_id FROM origin ORDER BY ID DESC LIMIT ? OFFSET ? ',
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
  dbconnection.query(
    'SELECT * FROM origin WHERE origin_id=? ',
    [req.params.ID],
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

  dbconnection.query('SELECT origin_id FROM dish_origin  ', (err, results) => {
    if (err) return res.send('Query error');

    const totalIDs = results.length;
    const totalPages = Math.ceil(totalIDs / limit);

    // Get the IDs for the requested page
    dbconnection.query(
      'SELECT orgin_id FROM dish_origin ORDER BY ID DESC LIMIT ? OFFSET ? ',
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
  dbconnection.query(
    'SELECT * FROM dish_origin WHERE origin_id=? ',
    [req.params.ID],
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

  dbconnection.query('SELECT category_id FROM category  ', (err, results) => {
    if (err) return res.send('Query error');

    const totalIDs = results.length;
    const totalPages = Math.ceil(totalIDs / limit);

    // Get the IDs for the requested page
    dbconnection.query(
      'SELECT category_id FROM category ORDER BY ID DESC LIMIT ? OFFSET ? ',
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
  dbconnection.query(
    'SELECT * FROM category WHERE category_id=? ',
    [req.params.ID],
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

  dbconnection.query('SELECT category_id FROM dish_category  ', (err, results) => {
    if (err) return res.send('Query error');

    const totalIDs = results.length;
    const totalPages = Math.ceil(totalIDs / limit);

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
  dbconnection.query(
    'SELECT * FROM dish_category WHERE category_id=? ',
    [req.params.ID],
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

app.listen(3333, (err) => {
    console.log('Web server is running');
});

