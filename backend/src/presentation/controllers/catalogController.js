const catalogService = require('../../application/services/catalogService');

async function list(req, res) {
  const result = await catalogService.list(req.params.resource, req.query);
  res.json(result);
}

async function getById(req, res) {
  const result = await catalogService.getById(req.params.resource, req.params.id);
  res.json(result);
}

async function create(req, res) {
  const result = await catalogService.create(req.params.resource, req.body);
  res.status(201).json(result);
}

async function update(req, res) {
  const result = await catalogService.update(req.params.resource, req.params.id, req.body);
  res.json(result);
}

async function remove(req, res) {
  await catalogService.remove(req.params.resource, req.params.id);
  res.status(204).send();
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
