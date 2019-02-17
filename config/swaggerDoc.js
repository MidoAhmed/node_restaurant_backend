const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    swaggerDefinition: {
        // Like the one described here: https://swagger.io/specification/#infoObject
       //openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
        swagger: '2.0',
        info: {
            title: 'Trends API',
            version: '1.0.0',
            description: 'Trends Express API with autogenerated swagger doc',
        },
        host: "localhost:3000",
        basePath: "/api",
        schemes: [
            "http"
        ],
        consumes: [
            "application/json"
        ],
        produces: [
            "application/json"
        ]
    },

    // List of files to be processes. You can also set globs './routes/*.js'
    // Path to the API docs
    apis: ['routes/v1.js'],
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJsdoc(options);

module.exports = (app) =>{
    app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};