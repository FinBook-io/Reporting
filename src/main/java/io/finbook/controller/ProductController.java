package io.finbook.controller;

import com.google.gson.Gson;
import io.finbook.http.MyResponse;
import io.finbook.http.StandardResponse;
import io.finbook.spark.ResponseCreator;
import io.finbook.model.Product;
import io.finbook.service.ProductService;
import org.bson.json.JsonReader;

import java.util.HashMap;

public class ProductController {

    private static ProductService productService = new ProductService();

    public static ResponseCreator create(String body) {
        Product product = new Gson().fromJson(body, Product.class);
        productService.addProduct(product);
        return MyResponse.ok(
                new StandardResponse(null, "index")
        );
    }

    public static ResponseCreator getList() {
        HashMap<String, Object> data = new HashMap<>();
        data.put("products", productService.getAllProduct());
        // new Gson().toJsonTree(productService.getAllProduct())
        return MyResponse.ok(
                new StandardResponse(null, "index")
        );
    }

}
