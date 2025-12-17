package com.example.crud_app.service;

import com.example.crud_app.model.Producto;
import com.example.crud_app.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;


@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> findAll() {
        return productoRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getActivo()))
                .toList();
    }

    public Optional<Producto> findById(Integer id) { return productoRepository.findById(id); }

    public Producto save(Producto producto) {
        // Crear: bloquear si ya hay un activo con ese nombre
        if (producto.getId() == null) {
            if (productoRepository.existsByNombreAndActivoTrue(producto.getNombre())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Ya existe un producto activo con ese nombre"
                );
            }
        } else { // Update
            if (productoRepository.existsByNombreAndIdNotAndActivoTrue(
                    producto.getNombre(), producto.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Ya existe otro producto activo con ese nombre"
                );
            }
        }

        return productoRepository.save(producto);
    }


    // Borrado lógico
    public void deleteById(Integer id) {
        productoRepository.findById(id).ifPresent(p -> {
            p.setActivo(false);
            productoRepository.save(p);
        });
    }

    public BigDecimal calcularTotalInventario() {
        return productoRepository.findAll().stream()
                .map(p -> p.getPrecio().multiply(BigDecimal.valueOf(p.getCantidadStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public static class CombinacionDTO {
        private List<String> nombres;
        private BigDecimal suma;

        public CombinacionDTO(List<String> nombres, BigDecimal suma) {
            this.nombres = nombres;
            this.suma = suma;
        }

        public List<String> getNombres() { return nombres; }
        public BigDecimal getSuma() { return suma; }
    }

    public List<CombinacionDTO> obtenerCombinaciones(BigDecimal valorMaximo) {
        List<Producto> productos = findAll();
        List<CombinacionDTO> resultado = new ArrayList<>();
        int n = productos.size();

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                Producto p1 = productos.get(i);
                Producto p2 = productos.get(j);
                BigDecimal suma = p1.getPrecio().add(p2.getPrecio());
                if (suma.compareTo(valorMaximo) <= 0) {
                    resultado.add(new CombinacionDTO(
                            Arrays.asList(p1.getNombre(), p2.getNombre()),
                            suma
                    ));
                }
            }
        }

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                for (int k = j + 1; k < n; k++) {
                    Producto p1 = productos.get(i);
                    Producto p2 = productos.get(j);
                    Producto p3 = productos.get(k);
                    BigDecimal suma = p1.getPrecio().add(p2.getPrecio()).add(p3.getPrecio());
                    if (suma.compareTo(valorMaximo) <= 0) {
                        resultado.add(new CombinacionDTO(
                                Arrays.asList(p1.getNombre(), p2.getNombre(), p3.getNombre()),
                                suma
                        ));
                    }
                }
            }
        }

        return resultado.stream()
                .sorted(Comparator.comparing(CombinacionDTO::getSuma).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }
}
