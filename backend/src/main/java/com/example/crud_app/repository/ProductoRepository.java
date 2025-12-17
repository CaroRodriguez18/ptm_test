package com.example.crud_app.repository;

import com.example.crud_app.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    // Solo productos activos
    boolean existsByNombreAndActivoTrue(String nombre);

    boolean existsByNombreAndIdNotAndActivoTrue(String nombre, Integer id);
}
