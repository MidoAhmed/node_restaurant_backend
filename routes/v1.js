const express = require('express');
const bodyParser = require('body-parser');
const auth = require("../middlewares/auth");
const multer = require('../config/multer.config');
const ArticleController = require('../controllers/article.controller');
const AuthController = require('../controllers/auth.controller');
const router = express.Router();


//********* API Routes **********

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
router.post(    '/auth/signin',       AuthController.signIn);

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
router.post(    '/auth/register',     AuthController.signUp);

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
router.get(    '/auth/logout',  auth.required, auth.unauthorizedErrorHundler,   AuthController.logOut);

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
router.get(    '/auth/authenticated',  auth.required, auth.unauthorizedErrorHundler,  AuthController.isAuthenticated);



router.post('/articles', auth.required, auth.unauthorizedErrorHundler, multer.single('image'), ArticleController.create);
/*router.route('/articles')
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
                    // return res.status(422).json({errors: errors.array()});
                    return ReE(res, errors.array(), 422);

                }

                const {payload} = req;
                if (!payload) {
                    let err = new CutomError('User not found', 'unknown');
                    return ReE(res, err, 401);
                }

                //validate incoming params
                /!*if (!req.body.title || !req.body.description) {
                    return res.status(422).json({"message": "Some fields are required"});
                }*!/

                req.body.owner = payload.id;
                let article = new Article(req.body);

                let [err, _article] = await to(article.save());
                if (err) return ReE(res, err, 422);

                return ReS(res, {article: _article.toWeb()}, 201, 'Successfully created new article.', 'articles.getAll');

            } catch (error) {
                console.log(error);
                return res.status(400).json(error);
            }

        });*/
router.get('/articles', auth.required, auth.unauthorizedErrorHundler, ArticleController.getAll);
router.delete('/articles', auth.required, auth.unauthorizedErrorHundler, ArticleController.removeAll);
router.put('/articles', auth.required, auth.unauthorizedErrorHundler, ArticleController.putAllNotAllowed);

router.get('/articles/:articleId', auth.required, auth.unauthorizedErrorHundler, ArticleController.get);
router.post('/articles/:articleId', auth.required, auth.unauthorizedErrorHundler, ArticleController.postNotAllowed);
router.put('/articles/:articleId', auth.required, auth.unauthorizedErrorHundler, multer.single('image'), ArticleController.update);
router.delete('/articles/:articleId', auth.required, auth.unauthorizedErrorHundler, ArticleController.remove);


module.exports = router;