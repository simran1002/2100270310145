const paginate = (items, pageSize, pageNumber) => {
    return items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
};

const sortProducts = (products, sortBy, order) => {
    return products.sort((a, b) => {
        if (order === 'asc') {
            return a[sortBy] > b[sortBy] ? 1 : -1;
        } else {
            return a[sortBy] < b[sortBy] ? 1 : -1;
        }
    });
};

module.exports = { paginate, sortProducts };
