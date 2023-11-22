import { connection } from "../../db_config.js";

export class ProductMd {
  static async getAll(name) {
    try {
      if (!name) {
        const [products, _info] = await connection.query(
          `SELECT
          p.name, 
          GROUP_CONCAT(c.name SEPARATOR ', ') AS catalog,
          p.price,
          p.descript, BIN_TO_UUID(p.id) AS id
          FROM
          products p
          JOIN
          products_catalog pc ON pc.products_id = p.id
          JOIN
          catalog c ON pc.catalog_id = c.id
          GROUP BY
           p.id;`
        );

        return products.length ? products : null;
      }

      const [products, _info] = await connection.query(
        `SELECT p.name, c.name as catalog, p.price, p.descript, BIN_TO_UUID(p.id) AS id FROM products p JOIN products_catalog pc ON pc.products_id = p.id JOIN catalog c ON pc.catalog_id = c.id WHERE p.name = ?`,
        [name]
      );
      console.log(products);
      return products.length ? products : null;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    const [productos, _info] = await connection.query(
      `SELECT
        p.name, 
        GROUP_CONCAT(c.name SEPARATOR ', ') AS catalog,
        p.price,
        p.descript, BIN_TO_UUID(p.id) AS id
      FROM
        products p
      JOIN
        products_catalog pc ON pc.products_id = p.id
      JOIN
        catalog c ON pc.catalog_id = c.id
      WHERE
        p.id = UUID_TO_BIN(?)
      GROUP BY
        p.id`,
      [id]
    );

    return productos.length ? productos : null;
  }
  static async deleteOne(id) {
    const [info] = await connection.query(
      `DELETE FROM products WHERE products.id = UUID_TO_BIN(?)`,
      [id]
    );
    return info.affectedRows;
  }
  static async addOne(product) {
    const { name, price, descript, picture, catalog } = product;

    const result = await connection.query(
      `
    INSERT INTO products (name, price, descript, picture) 
    VALUES (?,?,?,?)`,
      [name, price, descript, picture]
    );
    for (const cat of catalog) {
      await connection.query(
        `
      INSERT INTO products_catalog (products_id, catalog_id) SELECT p.id, c.id
      FROM products p JOIN catalog c ON p.name = ? AND c.name IN ('${cat}')`,
        [name]
      );
    }
    console.log(result);
    return result ? result : null;
  }
  static async updateOne(id, partialProduct) {
    const productId = id; // Asumiendo que el ID proporcionado es el ID de productos

    const catalog = partialProduct.catalog; // Asegúrate de tener el campo 'catalog' en el cuerpo de la solicitud

    // Elimina 'catalog' del objeto partialProduct antes de generar la cadena de consulta
    delete partialProduct.catalog;

    let queryString = "";
    for (const key in partialProduct) {
      queryString += `${key} = ?, `;
    }
    queryString = queryString.slice(0, -2);

    try {
      // Realiza la actualización en la tabla 'products'
      const [result, _info] = await connection.query(
        `UPDATE products SET ${queryString} WHERE id = UUID_TO_BIN(?)`,
        [...Object.values(partialProduct), productId]
      );

      // Actualiza la relación en la tabla 'products_catalog' solo si hay cambios en el catálogo
      if (catalog && catalog.length > 0) {
        // Elimina las entradas antiguas para este producto en 'products_catalog'
        await connection.query(
          `DELETE FROM products_catalog WHERE products_id = UUID_TO_BIN(?)`,
          [productId]
        );

        // Inserta las nuevas entradas en 'products_catalog'
        for (const cat of catalog) {
          await connection.query(
            `
                        INSERT INTO products_catalog (products_id, catalog_id)
                        SELECT p.id, c.id FROM products p
                        JOIN catalog c ON p.name = ? AND c.name = ?
                    `,
            [partialProduct.name, cat]
          );
        }
      }

      return result.affectedRows;
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      throw error;
    }
  }
}
