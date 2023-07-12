import express from 'express';
import bodyParser from 'body-parser';
import * as handlers from './handlers/handlers.js';
import * as dal from './dal/dal.js';
import * as orm from './dal/orm.js'
import { uuidv4 } from './helpers/util.js';
import * as auth from './helpers/auth.js'
import * as exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';
import * as handlebarHelpers from './helpers/handlebars.js'
import { registerWorkers } from './workers/register.js'
import * as workers from './workers/utils.js'
import expressPromiseRouter from 'express-promise-router'
import * as assert from 'assert'

import { initLogger } from './helpers/logger.js';
import { fileURLToPath } from 'url'
const logger = initLogger(fileURLToPath(import.meta.url));

export const app = express();
app.enable('trust proxy')
const hbs = exphbs.create({
    helpers:handlebarHelpers,
    defaultLayout: 'default',
});
app.engine('handlebars', hbs.engine as any);
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('XXX:this-must-be-a-secret'));
app.use(function addUser(req, res, next) {
    req.uid = req.signedCookies['uid']; //when signed in a user should have a 'uid' cookie which is used for auth
    next()
})

const router = expressPromiseRouter() as express.Router;
app.use('', router);
router.get('/_health', handlers.health);
router.get('/hello', auth.userAuth, handlers.hello) //example

app.use(express.static('public'));
if (app.get('env') === 'testing') {
    // Do not register any error handlers if we are in the tests
} else if (app.get('env') === 'development') {
    //express error handling
    app.use(function (err: any, req: express.Request, res: express.Response, next: any) {
        logger.error(`exception calling handler ${req.url}`, { err });
        res.status(err.status || 500);
        res.json({
            status: err.status || 500,
            message: err.message,
            error: err,
            stack: err.stack,
        });
    });
} else {
    // production error handler... no stacktraces leaked to user
    app.use(function (err: any, req: express.Request, res: express.Response, next: any) {
        if (err.status !== 404) logger.error(`exception calling handler ${req.url}`, { err });
        res.status(err.status || 500);
        res.json({
            status: err.status || 500,
            message: err.status ? err.message : 'Internal Error',
        });
    });
}

const PORT = process.env.WEB_PORT || 3000;
async function main() {
    const server = app.listen(PORT, async function mainApp() {
        assert.ok(process.env.DATABASE_URL, 'must provide DATABASE_URL as env var')
        assert.ok(process.env.RABBIT_URL, 'must provide RABBIT_URL as env var')
        try {
            logger.info(`Connecting to postgres at ${process.env.DATABASE_URL}...`);
            orm.connect(process.env.DATABASE_URL);
            await orm.pool.query('SELECT 1;'); //make sure connection works
            logger.info('Connected to postgres');
        } catch (err) {
            logger.error('webserver listen error', err);
            throw err;
        }
        try {
            registerWorkers()
            logger.info(`Connecting to rabbitmq...`)
            await workers.connect(process.env.RABBIT_URL)
            logger.info('Connected to rabbitmq')
        } catch (err) {
            logger.error('Error connecting to rabbitmq', err);
            throw err;
        }
        if (!process.env.DISABLE_WORKERS) {
            logger.info('Starting rabbit workers...');
            await workers.startWorkers()
            logger.info('Rabbit workerss started');
        }
        logger.info(`Listening on port ${PORT}...`);
    });
    server.setTimeout(330 * 1000); // must be more than 300s so nginx closes first
    process.on('SIGTERM', function shutDown() {
        logger.info('Received SIGTERM signal, shutting down gracefully');
        server.close(() => {
            logger.info('Closed out remaining connections');
            process.exit(0);
        });
    });
}

main();
