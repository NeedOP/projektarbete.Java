package se.eli.projektarbete.Java.dto;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Data
public class CheckoutDto {
    @NotEmpty
    private List<ItemDto> items;

    @Data
    public static class ItemDto {
        @NotNull
        private Long productId;
        @NotNull
        private Integer quantity;
    }
}
