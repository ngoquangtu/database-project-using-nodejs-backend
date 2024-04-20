const express = require('express');
const functions=require('firebase-functions');
const app = express();
const port = 3000;

const ingredientData = [
    { ingredient_id: 1, ingredient_name: 'Salt', quantity: 100, import_date: '2024-04-20', expired_date: '2024-12-31', counting_unit: 'g' },
    { ingredient_id: 2, ingredient_name: 'Sugar', quantity: 200, import_date: '2024-04-18', expired_date: '2024-12-31', counting_unit: 'g' },
];

const dishData = [
    { dish_id: 1, dish_name: 'Pizza', price: 10.99, available: true },
    { dish_id: 2, dish_name: 'Burger', price: 8.99, available: true },
];

app.set('view engine', 'ejs');
app.use(express.static('public'));


// Route handler for serving the index.js file
app.get('/index.js', (req, res) => {
    // Send the index.js file
    res.sendFile(__dirname + '/index.js');
});

  
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/ingredients', (req, res) => {
    // Truyền dữ liệu nguyên liệu đến trang ingredients
    res.render('ingredients', { ingredients: ingredientData });
});

app.get('/menu', (req, res) => {
    // Truyền dữ liệu món ăn đến trang menu
    res.render('menu', { dishes: dishData });
});

app.get('/search_menu', (req, res) => {
    // Xử lý logic tìm kiếm menu
});

app.get('/dish/:dishId', (req, res) => {
    const dishId = req.params.dishId;
    // Tìm kiếm món ăn theo ID
    const dish = dishData.find(dish => dish.dish_id == dishId);
    if (dish) {
        res.render('dish_details', { dish_detail: dish });
    } else {
        res.status(404).send('Dish not found');
    }
});

// Khởi động máy chủ
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
exports.app=functions.https.onRequest(app);