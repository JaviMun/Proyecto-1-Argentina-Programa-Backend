const express = require('express');
const dotenv = require('dotenv');
const { getAll, getOneById, create, update, destroy } = require('./database/db.manage.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();

const { HOST, PORT } = process.env;
//Traer todos los productos
app.get('/products', async (req, res) => {
    getAll()
        .then((products) => res.status(200).json(products))
        .catch((error) => res.status(error.status).json(error));
});
//Crear un producto nuevo. Parametros Post: nombre(string), importe(number) y stock(number)
app.post('/products', async (req, res) => {
    const { nombre, importe, stock } = req.body;
    create({ nombre, importe, stock })
        .then((product) => res.status(product.status).json(product))
        .catch((error) => res.status(500).json(error));
});
//Traer un producto con un id específico. Parametros Get: id
app.get('/products/:id', async (req, res) => {
    //recuperamos el parametro id y lo parseamos a int para buscar el producto que queremos
    const id = parseInt(req.params.id);
    getOneById(id)
        //en caso de que el id no exista usamos el código de status en la respuesta sino usamos el código 200
        .then((product) => res.status(product.status || 200).json(product))
        .catch((error) => res.status(error.status).json(error));
});
/*
Actualizar un producto con un id específico.
Parametros Get: id, Parametros Post opcionales(mínimo 1): nombre(string), importe(number) y stock(number)
*/
app.put('/products/:id', async (req, res) => {
    //Consultamos si en el body existen propiedades para actualizar
    const { nombre, importe, stock } = req.body;
    if (!nombre && !importe && !stock) {
        return res.status(400).json({
            status: 400,
            message: "Se debe actualizar al menos una de las propiedades del producto(nombre, importe o stock)"
        });
    }
    //recuperamos el parametro id y lo parseamos a int para buscar el producto que queremos
    const index = parseInt(req.params.id);
    const updateProduct = {
        id: index,
        ...req.body
    };
    update(updateProduct)
        .then((data) => res.status(data.status).json(data))
        .catch((error) => res.status(500).json(error));
});
//Eliminar un producto con un id específico. Parametros Get: id
app.delete('/products/:id', async (req, res) => {
    //recuperamos el parametro id y lo parseamos a int para eliminar el producto que queremos
    const id = parseInt(req.params.id);
    destroy(id)
        .then((data) => res.status(data.status).json(data))
        .catch((error) => res.status(500).json(error));
});
//Manejo 404
app.use('*', (req, res) => {
    res.status(404).json({
        status: 404,
        message: "El recurso al que quieres acceder no existe!"
    });
});

app.listen(PORT, HOST, () => console.log(`Servidor levantado en http://${HOST}:${PORT}`));