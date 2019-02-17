const express = require('express');
const bodyParser = require('body-parser');
const Users = require('../models/users');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const router = express.Router();
router.use(bodyParser.json());

router.route('/auth')
    .get((req, res, next) => {
        res.status(200).json({ok:"ok"});
    });

/**
 * @swagger
 *
 * /auth/signin:
 *   post:
 *     tags: ['user']
 *     summary: User Login
 *     description: Returns Bearer Token for JWT authentication
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: email to use for login.
 *         in: body
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Logged In Successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Unprocessable entity
 */
router.route('/auth/signin')
    .post((req, res, next) => {

        //`validate incoming params
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

/**
 * @swagger
 *
 * /auth/register:
 *   post:
 *     tags: ['user']
 *     summary: User Registration
 *     description: Returns Bearer Token for JWT authentication
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: email to use for login.
 *         in: body
 *         required: true
 *         type: string
 *       - name: firstName
 *         description: user name.
 *         in: body
 *         required: true
 *         type: string
 *       - name: firstName
 *         description: user name.
 *         in: body
 *         required: true
 *         type: string
 *       - name: lastName
 *         description: user name.
 *         in: body
 *         required: true
 *         type: string
 *       - name: phone
 *         description: user name.
 *         in: body
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: body
 *         required: true
 *         type: string
 *       - name: confirmed_password
 *         description: User's password confirmation.
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Logged In Successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Unprocessable entity
 */
router.route('/auth/register')
    .post(async  (req, res, next) => {
        const email = req.body.email;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const phone = req.body.phone;
        const password = req.body.password;
        const confirmed_password = req.body.confirmed_password;

        //validate incoming params
        if(!email || !lastName || !firstName || !phone || !password || !confirmed_password) {
            return res.status(422).json({"message": "All fields required"});
        }

        //Check the database for an existing user by Email
        try {
            const user = await Users.findOne({email});
            if(user){
                return res.status(409).json({"message": "An account already exists with this email."});
            }
        }catch (error) {
            return res.status(404).json(error);
        }

        //Compare the password fields
        if(password !== confirmed_password){
            return res.status(422).json({"message": "Password and confirm password does not match"});
        }

        var user = new Users();
        user.email = email;
        user.firstName = firstName;
        user.lastName = req.body.lastName;
        user.phone = req.body.phone;
        user.setPassword(req.body.password);

        return user.save()
            .then(
                () => res.json({message:'Successfully created new user.', user: user.toAuthJSON() })
            ).catch((err) => next(err));
    });

module.exports = router;