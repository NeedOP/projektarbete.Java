package se.eli.projektarbete.Java.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import se.eli.projektarbete.Java.entity.OrderEntity;

import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUserId(Long userId);
}
