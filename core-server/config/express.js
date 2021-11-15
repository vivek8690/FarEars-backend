const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const Sentry = require("@sentry/node");
const routes = require('../api/routes/v1');
const { logs } = require('./vars');
const error = require('../api/middlewares/error');

global.__basedir = path.join(__dirname, '..');

/**
 * Express instance
 * @public
 */
const app = express();
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// request logging. dev: console | production: file
app.use(morgan(logs));
app.use(bodyparser.json())
// parse body params and attache them to req.body
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// mount api v1 routes
app.use('/api', routes);
// Add your custom data extracted from the request

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);


module.exports = app;
