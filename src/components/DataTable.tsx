
import { useState, useEffect } from "react";
import React from "react";
import { Button, Table, Container } from "reactstrap";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
  }[];
  searchKeys: (keyof T)[];
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  onEditar?: (item: T) => void;
  onEliminar?: (id: number | string) => void;
  onNuevo?: () => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys,
  itemsPerPageOptions = [5, 10, 20],
  defaultItemsPerPage = 10,
  onEditar,
  onEliminar,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((item) =>
    searchKeys.some((key) =>
      String(item[key]).toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pageData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  return (
    <Container className="mt-4">
      <div>
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex gap-2 w-100">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded w-75"
            />
          </div>
        </div>

        <div
          className="table-responsive"
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          <Table
            size="sm"
            hover
            responsive
            className="align-middle text-center mb-1"
          >
            <thead className="table-light">
              <tr>
                {columns.map(({ key, label }) => (
                  <th
                    key={String(key)}
                    className="fw-semibold text-uppercase small"
                  >
                    {label}
                  </th>
                ))}
                {(onEditar || onEliminar) && (
                  <th className="fw-semibold text-uppercase small">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {pageData.map((item, index) => (
                <tr key={index}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} style={{ whiteSpace: "nowrap" }}>
                      {col.render ? col.render(item) : String(item[col.key])}
                    </td>
                  ))}
                  {(onEditar || onEliminar) && (
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        {onEditar && (
                          <Button
                            size="sm"
                            color="primary"
                            onClick={() => onEditar(item)}
                          >
                            <i className="bi bi-pencil-square me-1" />
                          </Button>
                        )}
                        {onEliminar && (
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() =>
                            onEliminar(
                              item.idConductores ||
                              item.idEnvios ||
                              item.idMantenimientos ||
                              item.idUnidades ||
                              item.idUsuarios ||
                              item.id
                            )
                          }
                        >
                          <i className="bi bi-trash me-1" />
                        </Button>
                      )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <label>Items por página:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="ms-2 form-select form-select-sm d-inline-block"
              style={{ width: "auto" }}
            >
              {itemsPerPageOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-sm btn-outline-primary me-2"
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-sm btn-outline-primary ms-2"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
