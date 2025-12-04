package se.eli.projektarbete.Java.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import se.eli.projektarbete.Java.dto.ProductDto;
import se.eli.projektarbete.Java.entity.Product;
import se.eli.projektarbete.Java.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        try {
            List<Product> products = productService.getAllProducts();
            log.info("Retrieved {} products", products.size());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            log.error("Error getting products: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve products");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            log.warn("Product not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            log.error("Error getting product: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve product");
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductDto productDto) {
        try {
            log.info("Creating product: {}", productDto.getName());

            Product product = new Product();
            product.setName(productDto.getName());
            product.setDescription(productDto.getDescription());
            product.setPrice(productDto.getPrice());
            product.setStock(productDto.getStock() != null ? productDto.getStock() : 0);

            Product createdProduct = productService.createProduct(product);
            log.info("Product created successfully: {}", createdProduct.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);

        } catch (Exception e) {
            log.error("Error creating product: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create product: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id,
                                           @Valid @RequestBody ProductDto productDto) {
        try {
            log.info("Updating product: {}", id);

            Product product = new Product();
            product.setName(productDto.getName());
            product.setDescription(productDto.getDescription());
            product.setPrice(productDto.getPrice());
            product.setStock(productDto.getStock() != null ? productDto.getStock() : 0);

            Product updatedProduct = productService.updateProduct(id, product);
            log.info("Product updated successfully: {}", id);

            return ResponseEntity.ok(updatedProduct);

        } catch (RuntimeException e) {
            log.warn("Product not found for update: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            log.error("Error updating product: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to update product: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            log.info("Deleting product: {}", id);

            if (!productService.getProductById(id).isPresent()) {
                throw new RuntimeException("Product not found with id: " + id);
            }

            productService.deleteProduct(id);
            log.info("Product deleted successfully: {}", id);

            return ResponseEntity.ok("Product deleted successfully");

        } catch (RuntimeException e) {
            log.warn("Product not found for deletion: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            log.error("Error deleting product: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete product");
        }
    }
}