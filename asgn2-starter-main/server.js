const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');
const fileUpload = require('express-fileupload');


/* create the server */
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(fileUpload());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* host public/ directory to serve: images, css, js, etc. */
app.use(express.static('public'));

/* path routing and endpoints */
app.use('/', require('./path_router'));

/* start the server */
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});