const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { paginate, sortProducts } = require('../utils/productUtils');
const registeredCompanies = require('../data/registeredCompanies.json');

const TEST_SERVER_URL = 'http://20.244.56.144/test/companies';

const fetchProducts = async (company, category, minPrice, maxPrice) => {
    const url = `${TEST_SERVER_URL}/${company}/categories/${category}/products?top=100&minPrice=${minPrice}&maxPrice=${maxPrice}`;
    const response = await axios.get(url);
    return response.data;
};

const getTopProducts = async (req, res) => {
    const { categoryname } = req.params;
    const { n = 10, page = 1, minPrice = 0, maxPrice = Infinity, sort = 'rating', order = 'desc' } = req.query;
    
    try {
        const allProducts = [];
        for (const company of registeredCompanies) {
            const products = await fetchProducts(company, categoryname, minPrice, maxPrice);
            allProducts.push(...products.map(product => ({
                ...product,
                id: uuidv4(),
                company
            })));
        }

        const sortedProducts = sortProducts(allProducts, sort, order);
        const paginatedProducts = paginate(sortedProducts, n, page);

        res.json(paginatedProducts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const getProductById = (req, res) => {
    const { categoryname, productid } = req.params;

    const allProducts = global.productCache[categoryname] || [];

    const product = allProducts.find(prod => prod.id === productid);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
};

module.exports = { getTopProducts, getProductById };
