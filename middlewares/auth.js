const jwt = require('express-jwt');
const blacklist = require('express-jwt-blacklist');

var isRevokedCallback = function(req, payload, done){
    // new Error('JWT missing tokenId claim' + tokenId)
    return done(new Error('JWT missing tokenId claim'));
};

const getTokenFromHeaders = (req) => {
    const {headers: {authorization}} = req;
    if (authorization && authorization.split(' ')[0] === 'Bearer') {
        const token = authorization.split(' ')[1];
        return token;
    }
    console.log('null');

    return null;
};

const auth = {
    required: jwt({
        secret: 'your_jwt_secret',
        userProperty: 'payload',
        isRevoked: blacklist.isRevoked,
        //isRevoked: isRevokedCallback,
        getToken: getTokenFromHeaders,
    }),
    optional: jwt({
        secret: 'your_jwt_secret',
        userProperty: 'payload',
        getToken: getTokenFromHeaders,
        credentialsRequired: false,
    }),
    unauthorizedErrorHundler: (err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            return res.status(401).json({message: err.message});
        }
        next();
    }
};

module.exports = auth;
