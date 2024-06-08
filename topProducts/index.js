const express = require('express');
const { getTopProducts, getProductById } = require('./services/ecomService');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/categories/:categoryname/products', getTopProducts);
app.get('/categories/:categoryname/products/:productid', getProductById);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
