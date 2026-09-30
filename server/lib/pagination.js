const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const DEFAULT_PAGE = 1;

const getPaginationParams = (limit, page) => {
  const limitNumber = Math.floor(Number(limit));
  const limited =
    limitNumber > 0 ? Math.min(limitNumber, MAX_LIMIT) : DEFAULT_LIMIT;
  const pageNumber = Math.max(
    DEFAULT_PAGE,
    Math.floor(Number(page)) || DEFAULT_PAGE
  );

  return {
    limit: limited,
    page: pageNumber,
  };
};

module.exports = getPaginationParams;
