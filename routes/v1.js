const express = require('express');
const bodyParser = require('body-parser');
const Users = require('../models/users');
const Article = require('../models/articleModel');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const auth = require("../middlewares/auth");
const blacklist = require('express-jwt-blacklist');
const multer = require('../config/multer.config');
const {check, validationResult, body} = require('express-validator/check');
const {to, ReE, ReS} = require('../utils/utils');
const CutomError = require('../utils/customError');

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
    .post(auth.required,
        auth.unauthorizedErrorHundler,
        multer.single('image'), [
            check('title').exists().withMessage('required'),
            check('description').exists().isLength({min: 5}).withMessage('must be at least 5 chars long')
        ], async (req, res, next) => {

            try {
                // Finds the validation errors in this request and wraps them in an object with handy functions
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(422).json({errors: errors.array()});
                }

                const {payload} = req;
                if (!payload) {
                    let err = new CutomError('User not found', 'unknown');
                    return ReE(res, err, 401);
                }

                //validate incoming params
                /*if (!req.body.title || !req.body.description) {
                    return res.status(422).json({"message": "Some fields are required"});
                }*/

                req.body.owner = payload.id;
                let article = new Article(req.body);

                let [err, _article] = await to(article.save());
                if (err) return ReE(res, err, 422);

                return ReS(res, {article: _article.toWeb()}, 201, 'Successfully created new article.', 'articles.getAll');

            } catch (error) {
                console.log(error);
                return res.status(400).json(error);
            }

        });

router.route('/articles')
    .get(auth.required, auth.unauthorizedErrorHundler, (req, res, next) => {
        Article.find({})
        //.populate('comments.author')
        //.populate('owner')
            .then((articles) => {
                res.status(200).json(articles);
            })
            .catch((err) => next(err));
    });


router.route('/articles')
    .delete(auth.required, auth.unauthorizedErrorHundler, (req, res, next) => {
        Article.remove({})
            .then((result) => {
                res.status(200).json(result);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

router.route('/articles')
    .put(auth.required, auth.unauthorizedErrorHundler, (req, res, next) => {
        let err = new Error('PUT operation not supported on /articles');
        err.status = 403;
        return next(err);
    });


router.route('/articles/:articleId')
    .get(auth.required, auth.unauthorizedErrorHundler, async (req, res, next) => {

        try {
            let articleId = req.params.articleId;

            let [err, article] = await to(Article.findById(articleId));
            if (err) return res.status(422).json({Error: "Error finding article"});

            if (!article) return res.status(422).json({Error: `ArticleId not found with id: ${articleId}`});

            return res.status(200).json({
                article: article.toWeb()
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json(error);
        }
    });

router.route('/articles/:articleId')
    .post(auth.required, auth.unauthorizedErrorHundler, (req, res, next) => {
        let err = new Error('POST operation not supported on /articles/' + req.params.leaderId);
        err.status = 403;
        return next(err);
    });


router.route('/articles/:articleId')
    .put(auth.required, auth.unauthorizedErrorHundler,
        multer.single('image'), [
            check('title').exists().withMessage('required'),
            check('description').exists().isLength({min: 5}).withMessage('must be at least 5 chars long')
        ], async (req, res, next) => {

            try {
                // Finds the validation errors in this request and wraps them in an object with handy functions
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(422).json({errors: errors.array()});
                }

                let articleId = req.params.articleId;
                let [err, article] = await to(Article.findByIdAndUpdate(articleId, {$set: req.body}, {new: true}));

                if (err) return res.status(422).json({Error: "Error occured trying to update the article"});

                return res.status(200).json({
                    article: article.toWeb()
                });

            } catch (error) {
                console.log(error);
                return res.status(400).json(error);
            }
        });

router.route('/articles/:articleId')
    .delete(auth.required, auth.unauthorizedErrorHundler, async (req, res, next) => {

        try {
            let articleId = req.params.articleId;
            let [err, result] = await to(Article.findByIdAndRemove(articleId));

            if (err) return res.status(422).json({Error: "Error occured trying to delete the article"});

            return res.status(200).json({result: result, message: 'Deleted Article'});
        } catch (error) {
            console.log(error);
            return res.status(400).json(error);
        }
    });


module.exports = router;