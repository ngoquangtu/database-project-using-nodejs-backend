create table ingredient(
ingredient_id INT ,
ingredient_name varchar(255),
quantity decimal(10,2),
import_date date,
expired_date date,
counting_unit varchar(50),
primary key (ingredient_id)
);
create table dish(
dish_id int,
dish_name varchar(255),
price decimal(10,2),
available tinyint(1),
primary key (dish_id)
);
create table dish_ingredient(
dish_id int,
ingredient_id int,
foreign key(dish_id) references ingredient(dish_id),
foreign key(ingredient_id) references ingredient(ingredient_id)
);
create table origin(
origin_id int,
origin_name varchar(255),
primary key (origin_id)
);
create table dish_origin(
dish_id int,
origin_id int,
foreign key(dish_id) references dish(dish_id),
foreign key(origin_id) references origin(origin_id)
);
create table category
(
category_id int,
category_name varchar(255),
primary key (category_id)
);
create table dish_category
(
dish_id int,
category_id int,
foreign key (dish_id) references dish(dish_id),
foreign key(category_id) references category(category_id)
)
