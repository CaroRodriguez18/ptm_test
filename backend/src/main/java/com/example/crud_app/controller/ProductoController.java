package com.example.crud_app.controller;

import com.example.crud_app.model.Producto;
import com.example.crud_app.service.ProductoService;
import com.example.crud_app.service.ProductoService.CombinacionDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<Producto> listar() {
        return productoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Integer id) {
        return productoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        return productoService.save(producto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Integer id,
                                               @RequestBody Producto producto) {
        return productoService.findById(id)
                .map(existente -> {
                    existente.setNombre(producto.getNombre());
                    existente.setDescripcion(producto.getDescripcion());
                    existente.setPrecio(producto.getPrecio());
                    existente.setCantidadStock(producto.getCantidadStock());
                    return ResponseEntity.ok(productoService.save(existente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        productoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/inventario/total")
    public BigDecimal totalInventario() {
        return productoService.calcularTotalInventario();
    }

    @GetMapping("/combinaciones")
    public List<CombinacionDTO> combinaciones(@RequestParam("valor") BigDecimal valor) {
        return productoService.obtenerCombinaciones(valor);
    }
}
