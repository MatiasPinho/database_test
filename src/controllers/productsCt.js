import { ProductMd } from "../models/productMd.js";
import { isValidUUID } from "../../utils/isValidUUID.js";
export class ProductCt {
  static async getAll(req, res) {
    const { name } = req.query;
    const products = await ProductMd.getAll(name);

    products
      ? res.status(200).json(products)
      : res.status(404).json({ message: "products not found" });
  }
  static async getById(req, res) {
    const { id } = req.params;
    const isValidID = isValidUUID(id);
    if (!isValidID) return res.status(400).json({ message: "Not valid Id" });
    const product = await ProductMd.getById(id);
    if (!product.length)
      return res.status(404).json({ message: "product not found" });
    res.status(200).json(product);
  }

  static async deleteOne(req, res) {
    const { id } = req.params;
    const isValidID = isValidUUID(id);
    if (!isValidID) return res.status(400).json({ message: "Not valid Id" });
    const result = await ProductMd.deleteOne(id);
    if (!result) {
      return res.status(404).json({ message: "product not found" });
    } else {
      res.status(200).json({ message: "product deleted" });
    }
  }
  static async addOne(req, res) {
    const productCreated = await ProductMd.addOne(req.body);
    productCreated
      ? res.status(201).json({ message: "product created" })
      : res.status(500).json({ message: "internal server error" });
  }
  static async updateOne(req, res) {
    const { id } = req.params;
    const isValidID = isValidUUID(id);
    if (!isValidID) {
      return res.status(400).json({ message: "Not valid Id" });
    }
    const isProduct = await ProductMd.getById(id);
    if (!isProduct.length) {
      return res.status(400).json({ message: "Product not found" });
    }
    const updateProduct = await ProductMd.updateOne(id, req.body);
    updateProduct
      ? res.status(201).json({ message: "product Updated" })
      : res.status(500).json({ message: "internal server error" });
  }
}
