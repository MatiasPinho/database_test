import { connection } from "../../db_config.js";

export class ProductMd {
  static async getAll(name) {
    try {
      if (!name) {
        const [products, _info] = await connection.query(
          `SELECT p.name, c.name as catalog, p.price, p.descript, BIN_TO_UUID(p.id) AS id FROM products p  JOIN products_catalog pc ON pc.products_id = p.id  JOIN catalog c ON pc.catalog_id = c.id`
        );

        return products.length ? products : null;
      }

      const [products, _info] = await connection.query(
        `SELECT p.name, c.name as catalog, p.price, p.descript, BIN_TO_UUID(p.id) AS id FROM products p JOIN products_catalog pc ON pc.products_id = p.id JOIN catalog c ON pc.catalog_id = c.id WHERE p.name = ?`,
        [name]
      );

      return products.length ? products : null;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    const [products, _info] = await connection.query(
      `SELECT * FROM products WHERE id = UUID_TO_BIN(?)`,
      [id]
    );

    return products;
  }
  static async deleteOne(id) {
    const [info] = await connection.query(
      `DELETE FROM products WHERE products.id = UUID_TO_BIN(?)`,
      [id]
    );
    return info.affectedRows;
  }
  static async addOne(product) {
    const { name, picture, price, descript, catalog } = product;

    try {
      // Insertar el producto en la tabla 'products'
      const result = await connection.query(
        `
        INSERT INTO products (name, picture, price, descript) 
        VALUES (?, ?, ?, ?)`,
        [name, picture, price, descript]
      );
      console.log(result);
      // Obtener el ID del producto recién insertado
      const productId = result.insertId;

      // Insertar las asociaciones entre el producto y las categorías en 'products_catalog'
      for (const cat of catalog) {
        await connection.query(
          `
          INSERT INTO products_catalog (products_id, catalog_id) 
          SELECT ?, c.id
          FROM catalog c
          WHERE c.name = ?`,
          [productId, cat]
        );
      }
      return result ? result : null;
    } catch (error) {
      throw error;
    }
  }

  static async updatedOne(id, partialProduct) {
    let queryString = "";
    for (const key in partialProduct) {
      queryString += `${key} = "${partialProduct[key]}", `;
    }
    queryString = queryString.slice(0, -2);
    const [result, _info] = await connection.query(
      `UPDATE products SET ${queryString}  WHERE products.id = UUID_TO_BIN(?)`,
      [id]
    );
    return result.affectedRows;
  }
}
