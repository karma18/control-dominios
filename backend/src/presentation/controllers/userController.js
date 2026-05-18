const userService = require('../../application/services/userService');

async function list(req, res) {
  const result = await userService.list(req.query);
  res.json(result);
}

async function getById(req, res) {
  const result = await userService.getById(req.params.id);
  res.json(result);
}

async function create(req, res) {
  const result = await userService.create(req.body);
  res.status(201).json(result);
}

async function update(req, res) {
  const result = await userService.update(req.params.id, req.body);
  res.json(result);
}

async function remove(req, res) {
  await userService.remove(req.params.id);
  res.status(204).send();
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
