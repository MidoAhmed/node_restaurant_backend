const express = require('express');
const bodyParser = require('body-parser');
const Users = require('../models/users');
const Articles = require('../models/articles');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const auth = require("./auth");
const blacklist = require('express-jwt-blacklist');
const multer = require('multer')
const upload = multer()

const router = express.Router();
router.use(bodyParser.json());

/**
 * @swagger
 *
 * /auth/signin:
 *   post:
 *     tags: ['user']
 *     summary: User Sign in
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

        //validate incoming params
        if (!req.body.email || !req.body.password) {
            return res.status(422).json({"message": "All fields required"});
        }

        passport.authenticate('local', {session: false}, (err, user, info) => {
            // If Passport throws/catches an error
            if (err) {
                return res.status(404).json(err);
            }

            if (!user) {
                // If user is not found || invalid credentials
                return res.status(401).json({message: info.message});
            }
            else {
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
                return res.json({user: user.toAuthJSON()});
            }
        })(req, res);
    });

/**
 * @swagger
 *
 * /auth/register:
 *   post:
 *     tags: ['user']
 *     summary: User Sign up
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
    .post(async (req, res, next) => {
        const email = req.body.email;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const phone = req.body.phone;
        const password = req.body.password;
        const confirmed_password = req.body.confirmed_password;

        //validate incoming params
        if (!email || !lastName || !firstName || !phone || !password || !confirmed_password) {
            return res.status(422).json({"message": "All fields required"});
        }

        //Check the database for an existing user by Email
        try {
            const user = await Users.findOne({email});
            if (user) {
                return res.status(409).json({"message": "An account already exists with this email."});
            }
        } catch (error) {
            return res.status(404).json(error);
        }

        //Compare the password fields
        if (password !== confirmed_password) {
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
                () => res.json({message: 'Successfully created new user.', user: user.toAuthJSON()})
            ).catch((err) => next(err));
    });


/**
 * @swagger
 *
 * /auth/logout:
 *   post:
 *     tags: ['user']
 *     summary: User Sign out
 *     description: Returns success message
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Logged Out Successfully
 *       401:
 *         description: Unauthorized
 */
router.route('/auth/logout')
    .get(auth.required, auth.unauthorizedErrorHundler, (req, res, next) => {
        blacklist.revoke(req.payload);
        res.status(200).json({logout: "true"});
    });


/**
 * @swagger
 *
 * /auth/authenticated:
 *   post:
 *     tags: ['user']
 *     summary: User token verification
 *     description: Returns the authenticated user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: User still authenticated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource doesn’t exist
 *
 */
router.get('/auth/authenticated', auth.required, auth.unauthorizedErrorHundler, (req, res, next) => {
    const {payload: {id}} = req;

    return Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({message: 'User not Found'});
            }

            return res.json({user: user});
        });
});


router.route('/articles')
    .post(upload.none(), auth.required, auth.unauthorizedErrorHundler, (req, res, next) => {
        // check
        try {
            const {payload} = req;
            if (!payload) {
                return res.status(401).json({"message": "User not found"});
            }

            console.log(req)

            //validate incoming params
            if (!req.body.title || !req.body.description) {
                return res.status(422).json({"message": "Some fields are required"});
            }

            let article = new Articles();
            article.title = req.body.title;
            article.description = req.body.description;
            article.image = req.body.image;
            article.category = req.body.category;
            article.comments = req.body.comments;
            article.author = payload._id;

            return article.save()
                .then(
                    () => res.status(200).json({article: article.toWeb(), message: 'Successfully created new article.'})
                ).catch((err) => next(err));
        } catch (error) {
            return res.status(404).json(error);
        }

    });

router.route('/articles')
    .get(auth.required, auth.unauthorizedErrorHundler, (req, res, next) => {
        Articles.find({})
            .populate('comments.author')
            .then((articles) => {
                res.status(200).json(articles);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = router;