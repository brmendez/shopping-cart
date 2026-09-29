const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const getPaginationParams = (limit, page) => {
  const limitNumber = Number(limit) || DEFAULT_LIMIT;

  if (limitNumber < 0) {
    throw new Error('Limit must be a positive number');
  }

  const limited = limitNumber > MAX_LIMIT ? MAX_LIMIT : limitNumber;
  const pageNumber = Math.max(1, Number(page) || 1);

  return {
    limit: limited,
    page: pageNumber,
  };
};

module.exports = getPaginationParams;
