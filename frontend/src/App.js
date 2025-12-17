import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:8080/api";

function App() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    precio: "",
    cantidadStock: ""
  });
  const [totalInventario, setTotalInventario] = useState(0);
  const [productoMayorInventario, setProductoMayorInventario] = useState(null);

  const [valorCombinaciones, setValorCombinaciones] = useState("");
  const [combinaciones, setCombinaciones] = useState([]);
  const [buscado, setBuscado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [valorBuscado, setValorBuscado] = useState(null);
  const [formError, setFormError] = useState("");


  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [showCatModal, setShowCatModal] = useState(false);
  const [catFacts, setCatFacts] = useState([]);
  const [uselessFact, setUselessFact] = useState("");

  // --- Backend data ---

  const loadProductos = async () => {
    const res = await axios.get(`${API_BASE}/productos`);
    const data = res.data;
    setProductos(data);
    calcularProductoMayorInventario(data);
  };

  const loadTotalInventario = async () => {
    const res = await axios.get(`${API_BASE}/productos/inventario/total`);
    setTotalInventario(res.data);
  };

  const calcularProductoMayorInventario = (lista) => {
    if (!lista.length) {
      setProductoMayorInventario(null);
      return;
    }
    const mayor = [...lista].reduce((max, p) => {
      const valor = Number(p.precio) * Number(p.cantidadStock);
      const maxValor = Number(max.precio) * Number(max.cantidadStock);
      return valor > maxValor ? p : max;
    });
    setProductoMayorInventario(mayor);
  };

  // --- CRUD ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      cantidadStock: Number(form.cantidadStock),
    };

    try {
      if (form.id == null) {
        await axios.post(`${API_BASE}/productos`, payload);
      } else {
        await axios.put(`${API_BASE}/productos/${form.id}`, payload);
      }

      setForm({ id: null, nombre: "", descripcion: "", precio: "", cantidadStock: "" });
      await loadProductos();
      await loadTotalInventario();
    } catch (err) {
      console.error("error response data:", err.response?.data);
      if (err.response && err.response.data) {
        const data = err.response.data; // { timestamp, status, error, path }

        let msg = "Error al guardar el producto";
        if (data.error === "Bad Request" && data.status === 400) {
          msg = "Ya existe un producto con ese nombre";
        }

        setFormError(msg);
      } else {
        setFormError("No se pudo comunicar con el servidor");
      }
    }
  };

  const handleEdit = (p) => {
    setForm({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      cantidadStock: p.cantidadStock
    });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("¿Seguro que quieres eliminar este producto?");
    if (!ok) return;

    await axios.delete(`${API_BASE}/productos/${id}`);
    await loadProductos();
    await loadTotalInventario();
  };

  // --- Combinaciones ---

  const handleCombinaciones = async () => {
    if (!valorCombinaciones) return;
    setBuscado(true);
    setCargando(true);
    setValorBuscado(valorCombinaciones);

    try {
      const res = await axios.get(
        `${API_BASE}/productos/combinaciones?valor=${valorCombinaciones}`
      );
      setCombinaciones(res.data);
    } catch (e) {
      console.error(e);
      setCombinaciones([]);
    } finally {
      setCargando(false);
    }
  };

  // --- Sort in frontend ---

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProductos = React.useMemo(() => {
    const items = [...productos];
    if (sortConfig.key != null) {
      items.sort((a, b) => {
        const va = a[sortConfig.key];
        const vb = b[sortConfig.key];
        if (typeof va === "number" && typeof vb === "number") {
          return sortConfig.direction === "asc" ? va - vb : vb - va;
        }
        const sa = String(va).toLowerCase();
        const sb = String(vb).toLowerCase();
        if (sa < sb) return sortConfig.direction === "asc" ? -1 : 1;
        if (sa > sb) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [productos, sortConfig]);

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  // --- External APIs ---

  const loadCatFacts = async () => {
    try {
      const res = await axios.get(
        "https://meowfacts.herokuapp.com/?count=2&lang=esp"
      );
      const facts = res.data?.data || [];
      setCatFacts(facts);
      setShowCatModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUselessFact = async () => {
    try {
      const res = await axios.get(
        "https://uselessfacts.jsph.pl/api/v2/facts/today"
      );
      setUselessFact(res.data?.text || "");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProductos();
    loadTotalInventario();
    loadCatFacts();
    loadUselessFact();
  }, []);

  // --- UI ---

  return (
    <div className="app-container">
      <h1>Productos</h1>

      <section className="card">
        <h2>{form.id == null ? "Agregar producto" : "Editar producto"}</h2>

        {form.id != null && (
          <p className="edit-info">
            Editando ID {form.id}: <strong>{form.nombre}</strong>
          </p>
        )}

        {formError && <div className="alert-error">{formError}</div>}

        <form onSubmit={handleSubmit} className="form-inline">
          <div className="form-group">
            <label>Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <input
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Precio</label>
            <input
              type="number"
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Cantidad</label>
            <input
              type="number"
              value={form.cantidadStock}
              onChange={(e) =>
                setForm({ ...form, cantidadStock: e.target.value })
              }
            />
          </div>

          <button type="submit">
              {form.id == null ? "Crear" : "Actualizar"}
            </button>

            {form.id != null && (
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setForm({
                    id: null,
                    nombre: "",
                    descripcion: "",
                    precio: "",
                    cantidadStock: ""
                  })
                }
              >
                Cancelar edición
              </button>
            )}
        </form>
      </section>

      <section className="card">
        <h2>Listado de productos</h2>
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort("id")}>
                ID{getSortIndicator("id")}
              </th>
              <th onClick={() => requestSort("nombre")}>
                Nombre{getSortIndicator("nombre")}
              </th>
              <th onClick={() => requestSort("descripcion")}>
                Descripción{getSortIndicator("descripcion")}
              </th>
              <th onClick={() => requestSort("precio")}>
                Precio{getSortIndicator("precio")}
              </th>
              <th onClick={() => requestSort("cantidadStock")}>
                Cantidad{getSortIndicator("cantidadStock")}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedProductos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.descripcion}</td>
                <td>{p.precio}</td>
                <td>{p.cantidadStock}</td>
                <td>
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => handleEdit(p)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    style={{ marginLeft: "0.4rem" }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Resumen de inventario</h2>

        <h3 className="total-inventario">
          Total inventario: ${totalInventario}
        </h3>

        {productoMayorInventario && (
          <p>
            Producto con mayor valor de inventario:{" "}
            <strong>
              {productoMayorInventario.nombre} ($
              {Number(productoMayorInventario.precio) *
                Number(productoMayorInventario.cantidadStock)}
              )
            </strong>
          </p>
        )}

        <div className="combinaciones-header">
          <h2>Combinaciones</h2>
          <div className="combinaciones-controls">
            <input
              type="number"
              placeholder="Valor máximo"
              value={valorCombinaciones}
              onChange={(e) => setValorCombinaciones(e.target.value)}
            />
            <button
              type="button"
              onClick={handleCombinaciones}
              disabled={cargando || !valorCombinaciones}
            >
              {cargando ? "Calculando..." : "Calcular"}
            </button>
          </div>
        </div>

        {!buscado && (
          <p className="hint">
            Ingresa un valor y pulsa “Calcular” para ver combinaciones.
          </p>
        )}

        {buscado && !cargando && combinaciones.length > 0 && (
          <ul className="combinaciones-list">
            {combinaciones.map((c, index) => (
              <li key={index}>
                {c.nombres.join(" + ")} = ${c.suma}
              </li>
            ))}
          </ul>
        )}

        {buscado && !cargando && combinaciones.length === 0 && (
          <div className="badge badge-warning">
            No hay combinaciones para el valor ingresado: {valorBuscado}.
          </div>
        )}
      </section>

      {/* Cat facts modal */}
      {showCatModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-title">¿Sabías que...? 🐱</div>
            <ul>
              {catFacts.map((fact, idx) => (
                <li key={idx}>{fact}</li>
              ))}
            </ul>
            <button onClick={() => setShowCatModal(false)}>❤️</button>
          </div>
        </div>
      )}

      {/* Footer with useless fact */}
      <footer className="footer">
        <h4>Dato inútil del día</h4>
        <p>{uselessFact}</p>
      </footer>
    </div>
  );
}

export default App;
