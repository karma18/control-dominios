const domainService = require('../../application/services/domainService');

async function list(req, res) {
  const result = await domainService.list(req.query);
  res.json(result);
}

async function getById(req, res) {
  const result = await domainService.getById(req.params.id);
  res.json(result);
}

async function create(req, res) {
  const result = await domainService.create(req.body);
  res.status(201).json(result);
}

async function update(req, res) {
  const result = await domainService.update(req.params.id, req.body);
  res.json(result);
}

async function remove(req, res) {
  await domainService.remove(req.params.id);
  res.status(204).send();
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
