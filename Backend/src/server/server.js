require("dotenv").config();

const Hapi = require("@hapi/hapi");
const routes = require("../server/routes");
const loadModel = require("../services/loadModel");
const InputError = require("../exceptions/InputError");
const maxPayload = 1000000;

(async () => {
        const server = Hapi.server({
        port: process.env.PORT,
        host: '0.0.0.0',
        routes: {
            cors: {
            origin: ["*"],
            },
            payload: {
                maxBytes: maxPayload,
            },
        },
    });

    const model = await loadModel();
    server.app.model = model;

    server.route(routes);

    server.ext('onPreResponse', function (request, h) {
        const response = request.response;

        if (response instanceof InputError) {
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message}`
            })
            newResponse.code(response.statusCode)
            return newResponse;
        }

        if (response.isBoom) {
            if (response.output.statusCode === 413) {
                const newResponse = h.response({
                    status: 'fail',
                    message: `Payload content length greater than maximum allowed: ${maxPayload}`,
                });
                newResponse.code(response.output.statusCode);
                return newResponse;
            } else {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message,
                });
                newResponse.code(response.output.statusCode);
                return newResponse;
            }
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();