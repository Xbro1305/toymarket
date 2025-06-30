export const calculatePrice = (inCart, product) => {
  if (!inCart.quantity || !product) return 0;

  const quantity =
    parseInt(inCart.quantity * product.inBox) % product.inPackage !== 0
      ? Math.ceil(inCart.quantity * product.inBox)
      : parseInt(inCart.quantity * product.inBox);

  return quantity * product.price;
};

export const calculateQuantity = (product) => {
  return parseInt(product.quantity * product.inBox) % product.inPackage !== 0
    ? Math.ceil(product.quantity * product.inBox)
    : parseInt(product.quantity * product.inBox);
};
