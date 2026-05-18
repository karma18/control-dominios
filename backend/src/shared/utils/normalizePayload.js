function normalizeValue(value, field) {
  if (value === '') {
    return field.nullable ? null : value;
  }

  if (field.type === 'boolean') {
    return value === true || value === 'true' || value === 1 || value === '1';
  }

  if (field.type === 'number') {
    return value === null || value === undefined ? value : Number(value);
  }

  return value;
}

function pickAllowedFields(payload, fields) {
  return Object.entries(fields).reduce((data, [name, field]) => {
    if (Object.prototype.hasOwnProperty.call(payload, name)) {
      data[name] = normalizeValue(payload[name], field);
    }

    return data;
  }, {});
}

function validateRequiredFields(payload, fields) {
  const missingFields = Object.entries(fields)
    .filter(([, field]) => field.required)
    .map(([name]) => name)
    .filter((name) => payload[name] === undefined || payload[name] === null || payload[name] === '');

  return missingFields;
}

module.exports = {
  pickAllowedFields,
  validateRequiredFields,
};
