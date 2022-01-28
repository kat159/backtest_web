import * as users from './users_model.mjs';
import express from 'express';

const PORT = 3000;

const app = express();  

app.use(express.static('public'));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

/**
 * Create a new user with the username, password and strategies provided in the body
 */
app.post('/users', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("signup: ", req.body, req.query);
    const {username, password, strategies} = req.body.username === undefined ? req.query : req.body;
    let filter = { username: username };
    users.findUsers(filter, '', 0)
        .then(user => {
            if (user.length !== 0) {
                console.log("user exist");
                res.json({ err: "user exist" });
            } else {
                users.createUser(username, password, strategies)
                    .then(user => {
                        res.status(201).json(user);
                    })
                    .catch(error => {
                        console.error(error);
                        // In case of an error, send back status code 400 in case of an error.
                        // A better approach will be to examine the error and send an
                        // error status code corresponding to the error.
                        res.status(400).json({ Error: 'Request failed' });
                    });
            }
        })
});


/**
 * Retrive the user corresponding to the ID provided in the URL.
 */
app.get('/users/:_id', (req, res) => {
    const userId = req.params._id;
    users.findUserById(userId)
        .then(user => {
            if (user !== null) {
                res.json(user);
            } else {
                res.status(404).json({ error: 'Resource not found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ error: 'Request failed' });
        });
});

/**
 * Retrive users. 
 * If the query parameters include a username, then only the users for that username are returned.
 * Otherwise, all users are returned.
 */
app.get('/users', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let filter = {};
    // Is there a query parameter named username? If so add a filter based on its value.
    if (req.query.username !== undefined) {
        filter = { username: req.query.username };
    }
    users.findUsers(filter, '', 0)
        .then(users => {
            res.json(users);
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ Error: 'Request failed' });
        });
});

/**
 * Update the user whose id is provided in the path parameter and set
 * its username, password and strategies to the values provided in the body.
 */
app.put('/users/:_id', (req, res) => {
    users.replaceUser(req.params._id, req.body.username, req.body.password, req.body.strategies)
        .then(numUpdated => {
            if (numUpdated === 1) {
                res.json({ _id: req.params._id, username: req.body.username, password: req.body.password, strategies: req.body.strategies })
            } else {
                res.status(404).json({ Error: 'Resource not found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ Error: 'Request failed' });
        });
});

/**
 * Delete the user whose id is provided in the query parameters
 */
app.delete('/users/:_id', (req, res) => {
    users.deleteById(req.params._id)
        .then(deletedCount => {
            if (deletedCount === 1) {
                res.status(204).send();
            } else {
                res.status(404).json({ Error: 'Resource not found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.send({ error: 'Request failed' });
        });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});