const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');
const getData = require('../services/getData');

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const { confidenceScore, label, explanation, suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    "id": id,
    "result": label,
    "suggestion": suggestion,
    "createdAt": createdAt
  }

  await storeData(id, data);

  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully.',
    data
  })
  response.code(201);
  return response;
}

async function getPredictHistoriesHandler(request, h) {
  try {
      const histories = await getData();
      return h.response({
          status: 'success',
          data: histories
      }).code(200);
  } catch (error) {
      console.error('Error fetching prediction histories:', error);
      return h.response({
          status: 'fail',
          message: 'Failed to fetch prediction histories'
      }).code(500);
  }
}

module.exports = { postPredictHandler, getPredictHistoriesHandler };
