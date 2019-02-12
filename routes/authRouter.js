const express = require('express');
const bodyParser = require('body-parser');
const Users = require('../models/users');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const authRouter = express.Router();
authRouter.use(bodyParser.json());

authRouter.route('/')
    .get((req,res,next) => {
        Users.find({})
            .then((dishes) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

authRouter.route('/signin')
    .post((req, res, next) => {

        //validate incoming params
        if(!req.body.email || !req.body.password) {
            return res.status(422).json({"message": "All fields required"});
        }

        passport.authenticate('local', {session: false}, (err, user, info) => {
            // If Passport throws/catches an error
            if (err) {
                return res.status(404).json(err);
            }

            if(!user){
                // If user is not found || invalid credentials
                return res.status(401).json({message: info.message});
            }
            else{
                // If a user is found && valid credentials
                /*req.login(user, {session: false}, (err) => {
                    if (err) {
                        res.send(err);
                    }
                    // generate a signed son web token with the contents of user object and return it in the response
                    const token = jwt.sign(user.toJSON(), 'your_jwt_secret', {
                        expiresIn: 604800 // 1 week
                    });
                    return res.json({user, token});
                });*/
                user.token = user.generateJWT();
                return res.json({ user: user.toAuthJSON() });
            }
        })(req, res);
    });


authRouter.route('/register')
    .post((req, res, next) => {

        //validate incoming params
        if(!req.body.name || !req.body.email || !req.body.password) {
            return res.status(422).json({"message": "All fields required"});
         }

        var user = new Users();
        user.email = req.body.email;
        user.name = req.body.name;

        user.setPassword(req.body.password);

        return user.save()
            .then(
                () => res.json({ user: user.toAuthJSON() })
            ).catch((err) => next(err));
    });

module.exports = authRouter;