import 'dotenv/config';
import redis from 'redis';
const mysql = require('mysql');
const express = require('express');
import 'dotenv/config';
import redis from 'redis';
require('dotenv').config();


const app = express();

const port=3333;
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

app.get('/redis',async(req,res)=>{
try 
{
	const rc = redis.createClient({ url:"redis://<username>:<password>@redis-17747.c302.asia-northeast1-1.gce.cloud.redislabs.com:17747" });
	rc.on('error', err => console.log(`Redis error: ${err}`));
	await rc.connect();

	console.log('Connected to Redis');
	// const studentID="1000";
	redisquery='student:1000'
	rc.hgetall(redisquery,async(err,value)=>
	{
		if (err){
			console.log(`Error: ${err}`);
			const selectQuery='select * from student where student.ID=?';
			dbconnection.query(selectQuery, (err, results) => {
			if(err)
			{
				console.log('SQL query error: ' + err);
				return res.send('Failed to query data from SQL');
			}
			let html = '<ul>';
			for (let i = 0; i < results.length; i++) {
				html += '<li><a href="/ingredient/' + results[i].ingredient_id + '">' +
						results[i].ingredient_id + '</a></li>';
			}
			html += '</ul>';
	
			res.send(html);
		});
	}
		else
		{
			console.log(value);
			console.log("Dữ liệu từ Redis:", value);
			return res.send('Date retrieved form REDIS');
		}
	});
	const v = await rc.get('hello');
	console.log(v);
}
catch(err) 
{
	console.log(err);
	return res.send('Error: ' + err.message);
} 
finally 
{
	process.exit(0);
}
});
