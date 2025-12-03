package se.eli.projektarbete.Java.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class ProductDto {
    private Long id;
    @NotBlank
    private String name;
    private String description;
    @NotNull
    private Double price;
    private Integer stock;
}
