const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

//only registered users can login
regd_users.post("/login", (req, res) => {
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
	
	let user = users.find(user => (user.username === username) && (user.password === password));

	// Authenticate user
	if (!user) {
		res.send("Incorrect credentials.");
		return;
	}
	// Generate JWT access token
	let accessToken = jwt.sign({
		data: password
	}, 'access', { expiresIn: 60 * 60 });

	// Store access token and username in session
	req.session.authorization = {
		accessToken, username
	};
	res.send("User successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
	let isbn = req.params.isbn;
	let review = req.body.review;
	if (!(isbn in books)) {
		res.status(400).send("No book found with that ISBN.");
		return;
	}
	if (!review) {
		res.status(400).send("Please include a review.");
		return;
	}
	books[isbn].reviews[req.session.authorization.username] = review;
	res.send("Review successfully added.");
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
	let isbn = req.params.isbn;
	if (!(isbn in books)) {
		res.status(400).send("No book found with that ISBN.");
		return;
	}
	delete books[isbn].reviews[req.session.authorization.username];
	res.send("Review deleted.");
});

module.exports.authenticated = regd_users;
module.exports.users = users;
