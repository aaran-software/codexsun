"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var app = (0, express_1.default)();
var port = 3000;
// Middleware to parse JSON
app.use(express_1.default.json());
// Basic route for welcome message
app.get('/', function (req, res) {
    res.send('Welcome to the Express TypeScript Server!');
});
// Start the server
app.listen(port, function () {
    console.log("Server is running on http://localhost:".concat(port));
});
