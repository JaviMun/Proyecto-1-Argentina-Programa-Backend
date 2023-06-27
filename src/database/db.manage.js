const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const route = path.join(__dirname, process.env.DB_NAME);

//Lee el archivo que hace las veces de base de datos
function readDatabase() {
    return new Promise((resolve, reject) => {
        fs.readFile(route, "utf8", (err, data) => {
            if (err) return reject({ status: 500, message: err.message });
            return resolve(JSON.parse(data));
        });
    });
}
//Escribe el archivo que hace las veces de base de datos
function writeDatabase(data) {
    const products = JSON.stringify(data);
    return new Promise((resolve, reject) => {
        fs.writeFile(route, products, "utf8", (err) => {
            if (err) return reject({ status: 500, mensage: err.message });
            return resolve({
                status: 200,
                message: "La base de datos ha sido actualizada con éxito!"
            });
        });
    });
}

//Función para generar id, toma el id del último elemento de nuestra base de datos, le suma uno y devuelve el resultado
function generateIndex(products) {
    const index = products[products.length - 1].id + 1;
    return index;
}
//retorna todos los productos que tenemos guardados en la base de datos
async function getAll() {
    const data = await readDatabase();
    return data;
}
//recibe el id de un producto específico y de existir ese id asociado a un producto lo retorna
async function getOneById(id) {
    if (!id) return { status: 400, message: "Id no esta definido" };
    const data = await readDatabase();
    const product = data.find((e) => e.id === id);
    if (product) {
        return product;
    } else {
        return {
            status: 400,
            message: "El id enviado no corresponde a ningún producto"
        };
    }
}
/*
Recibe un objeto con las propiedades del producto, le agrega un id y lo registra en la base de datos.
Retorna un mensaje de error o de éxito según el caso
*/
async function create(product) {
    if (!product?.nombre || !product?.importe || !product?.stock) return { status: 400, message: "Todos los campos son requeridos" };
    const data = await readDatabase();
    const newProduct = {
        id: generateIndex(data),
        ...product
    };
    data.push(newProduct);
    await writeDatabase(data);
    return {
        status: 201,
        message: "El producto ha sido agregado con éxito!",
        product: newProduct
    };
}
/*
Recibe un objeto producto, busca si existe el mismo a través del id y en caso de que lo encuentre actualiza los datos
con los valores recibidos. En caso de no recibir ningún valor para la propiedad, deja el valor existente. Sólo el id
del producto es indispensable.
*/
async function update(product) {
    if (!product.id) return { status: 400, message: "El id es necesario para saber que producto actualizar!" };
    const data = await readDatabase();
    const index = data.findIndex((element) => element.id === product.id);
    if (index < 0) return { status: 400, message: "El id enviado no corresponde a ningún producto" };
    //creamos un nuevo objeto para que en caso de que se quiera hacer una actualización parcial, mantenga los valores que ya tenía
    const updateProduct = {
        id: product.id,
        nombre: product.nombre || data[index].nombre,
        importe: product.importe || data[index].importe,
        stock: product.stock || data[index].stock
    };
    data[index] = updateProduct;
    await writeDatabase(data);
    return {
        status: 200,
        message: "El producto se ha actualizado con éxito!",
        product: updateProduct
    };
}
//Recibe un id y elimina el producto que tiene ese id. Retorna un mensaje, ya sea de éxito o de error.
async function destroy(id) {
    if (!id) return { status: 400, message: "El id es necesario para saber que producto eliminar!" };
    const data = await readDatabase();
    const index = data.findIndex((element) => element.id === id);
    if (index < 0) return { status: 400, message: "El id enviado no corresponde a ningún producto" };
    const deleted = data.splice(index, 1);
    await writeDatabase(data);
    return {
        status: 200,
        message: "El producto ha sido eliminado con éxito!",
        productDeleted: deleted[0]
    };
}

module.exports = { getAll, getOneById, create, update, destroy };