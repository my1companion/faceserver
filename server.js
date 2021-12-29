const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const app = express();
app.use(bodyParser.json());
app.use(cors());

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const db = knex({
	client: 'pg',
	connection: {
		host:'127.0.0.1',
		user:'postgres',
		password:'1234',
		database: 'smart-brain'

	}
})


		 // connectionString: process.env.DATABASE_URL,
		 // ssl: {
	  //    rejectUnauthorized: false
	  // }
		// host:'127.0.0.1',
		// user:'postgres',
		// password:'1234',
		// database: 'smart-brain'


const database= {
	users:[
	{
	   id: "123",
	   name: "Hassan",
	   email: "ade@yahoo.com",
	   password: "cookies",
	   entries: 0,
	   joined: new Date()
	},		
	{
	   id: "124",
	   name: "Yinka",
	   email: "hassan@yahoo.com",
	   password: "cookies",
	   entries: 0,
	   joined: new Date()
	},
],
	login:[
	{
	   id: "978",
	   hash: "",
	   email: "ade@yahoo.com"
	 }		
	
	]		


	

}

app.get('/', (req, res) =>{ res.send('its fine')
	//const data = db.select('*').from('login').then(user=>	res.send(user))

}
);
app.post('/signin', (req, res) =>{

	const {email, password} = req.body;

	if(!email || !password){
		return res.status(400).json('credentials not set');
	}
	db.select('email','hash').from('login')
	.where('email', '=',req.body.email)
	.then(data=>{
		const isValid = bcrypt.compareSync(req.body.password, data[0].hash);

		if(isValid){
			db.select('*').from('users')
			.where('email','=',req.body.email)
			.then(user => {
				res.json(user[0]);
			})
			.catch(err => res.status(400).json('unable to get user'))

		}else{
			res.status(400).json('wrong credentials')
		}

	})
	.catch(err => res.status(400).json('wrong credentials'))

}
);
app.post('/register', (req,res) =>{
	const {email, name, password} = req.body;

	const hash = bcrypt.hashSync(password);


		db.transaction(trx=>{
			trx.insert({
				hash: hash,
				email:email
			}).into('login')
			.returning('email')
			.then(loginEmail=>{
				return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0],
					name:name,
					joined: new Date()
				})
				.then(user =>{
					res.json(user[0]);
				})
			}).then(trx.commit)
			.catch(trx.rollback)
		})
	
	

}
);

app.get('/profile/:id', (req, res) =>{
	const {id} = req.params;
	let found = false;
	database.users.forEach(user =>{
	
	if(user.id===id){
	found = true;
	return res.json(user);
	}

	
})
	if(!found){
		return res.json('User not found');
	}
});

app.put('/image', (req, res) =>{

	const {id} = req.body;

	let found = false;
	database.users.forEach(user=>{
	
	if(user.id === id){
	    found = true;
	    user.entries ++;
	    return res.json(user.entries);
}
});

	if(!found){
	    res.json('user not found');
}
});


app.listen(process.env.PORT || 3000, ()=>{
	console.log(`app is running on port ${process.env.PORT}`);
});
