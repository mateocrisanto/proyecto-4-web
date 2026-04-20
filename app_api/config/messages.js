const apiMessages = {
  common: {
    errorStatus: 'error'
  },
  users: {
    notFoundList: 'No se encontraron usuarios',
    createError: 'Error al crear el usuario',
    listError: 'Error al listar los usuarios',
    notFoundById: (id) => `No se encontro el usuario con Id: ${id}`,
    readByIdError: (id) => `Error al buscar el usuario con Id: ${id}`,
    updateError: (id) => `Error al actualizar el usuario con Id: ${id}`,
    deleteError: (id) => `Error al eliminar el usuario con Id: ${id}`
  },
  products: {
    notFound: 'Producto no encontrado',
    missingProductId: 'No se encontro productid en la solicitud',
    productIdRequired: 'Se requiere productid',
    productIdNotFound: 'productid no encontrado',
    missingProductIdShort: 'No se encontro productid'
  },
  cart: {
    sessionRequired: 'Se requiere sessionId',
    sessionAndProductRequired: 'Se requieren sessionId y productId',
    sessionProductAndQuantityRequired: 'Se requieren sessionId, productId y cantidad',
    notFound: 'Carrito no encontrado',
    productNotFound: 'Producto no encontrado',
    productNotInCart: 'Producto no encontrado en el carrito'
  }
};

module.exports = apiMessages;
