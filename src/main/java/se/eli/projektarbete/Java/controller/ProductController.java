package se.eli.projektarbete.Java.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import se.eli.projektarbete.Java.service.ProductService;
import se.eli.projektarbete.Java.entity.Product;
import se.eli.projektarbete.Java.dto.ProductDto;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.listAll();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.get(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductDto dto) {
        try {
            System.out.println("📦 Creating new product: " + dto.getName());

            // Validate required fields
            if (dto.getName() == null || dto.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Product name is required");
            }
            if (dto.getPrice() == null || dto.getPrice() <= 0) {
                return ResponseEntity.badRequest().body("Price must be greater than 0");
            }

            // Create product
            Product product = new Product();
            product.setName(dto.getName().trim());
            product.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : "");
            product.setPrice(dto.getPrice());
            product.setStock(dto.getStock() != null ? dto.getStock() : 0);

            // Save product
            Product savedProduct = productService.save(product);
            System.out.println("✅ Product created with ID: " + savedProduct.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);

        } catch (Exception e) {
            System.err.println("❌ Error creating product: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating product: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDto dto) {
        try {
            System.out.println("🔄 Updating product ID: " + id);

            // Get existing product
            Product existingProduct = productService.get(id);

            // Update fields
            if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
                existingProduct.setName(dto.getName().trim());
            }
            if (dto.getDescription() != null) {
                existingProduct.setDescription(dto.getDescription().trim());
            }
            if (dto.getPrice() != null && dto.getPrice() > 0) {
                existingProduct.setPrice(dto.getPrice());
            }
            if (dto.getStock() != null) {
                existingProduct.setStock(dto.getStock());
            }

            // Save updated product
            Product updatedProduct = productService.save(existingProduct);
            System.out.println("✅ Product updated: " + updatedProduct.getId());

            return ResponseEntity.ok(updatedProduct);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Product not found with ID: " + id);
        } catch (Exception e) {
            System.err.println("❌ Error updating product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating product: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            System.out.println("🗑️ Deleting product ID: " + id);
            productService.delete(id);
            System.out.println("✅ Product deleted: " + id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Product not found with ID: " + id);
        } catch (Exception e) {
            System.err.println("❌ Error deleting product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting product: " + e.getMessage());
        }
    }

    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Product controller is working!");
    }
}