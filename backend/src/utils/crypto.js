const bcrypt = require('bcryptjs');

async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function generateSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function hashCode(code) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(code, salt);
}

async function compareCode(code, hash) {
  return bcrypt.compare(code, hash);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateSixDigitCode,
  hashCode,
  compareCode,
};
