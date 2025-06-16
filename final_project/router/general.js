const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
	let username = req.body.username;
	let password = req.body.password;
	if (!username) {
		res.status(400).send("Please include a username.");
		return;
	}
	if (!password) {
		res.status(400).send("Please include a password.");
		return;
	}
	let existingUser = users.find(user => user.username === username);
	if (existingUser) {
		res.status(400).send("Username taken.");
		return;
	}
	users.push({
		username,
		password,
	});
	res.send(`User ${username} added.`);
});

function retrieveBooks () {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(books);
		}, 2000);
	});
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
	let booksJson = await retrieveBooks();
	res.send(JSON.stringify(booksJson, null, "\t"));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
	let booksJson = await retrieveBooks();
	res.send(JSON.stringify(booksJson[req.params.isbn] || {
		"error": "No book found with that ISBN.",
	}, null, "\t"));
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
	let booksJson = await retrieveBooks();
	res.send(JSON.stringify(Object.values(booksJson).filter(book => book.author === req.params.author), null, "\t"));
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
	let booksJson = await retrieveBooks();
	res.send(JSON.stringify(Object.values(booksJson).filter(book => book.title === req.params.title), null, "\t"));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
	res.send(JSON.stringify((req.params.isbn in books) ? books[req.params.isbn].reviews : {
		"error": "No book with that ISBN.",
	}));
});

module.exports.general = public_users;
