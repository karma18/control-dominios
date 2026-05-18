const authService = require('../../application/services/authService');

async function login(req, res) {
  const result = await authService.login(req.body.email, req.body.password);
  res.json(result);
}

async function me(req, res) {
  const user = await authService.me(req.user.id);
  res.json(user);
}

module.exports = {
  login,
  me,
};
