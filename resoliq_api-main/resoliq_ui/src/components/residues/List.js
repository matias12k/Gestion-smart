import React, { useContext, useEffect } from "react";
import { Table, Button, Row, Col, Popconfirm, notification, Modal } from "antd";
import api from "../../api/endpoints";
import { WasteContext } from "../../containers/Waste";
import {
  DeleteFilled,
  RightCircleFilled,
  FileExcelFilled,
  MinusOutlined,
  PlusOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";

const List = () => {
  const { state, dispatch } = useContext(WasteContext);

  async function getResidues() {
    await api.residues.list(state.list.page).then((x) => {
      dispatch({
        type: "add_residues",
        payload: x,
      });
    });
  }

  const selectResidue = (residue) => {
    dispatch({
      type: "select_to_edit",
      payload: { residue },
    });
  };

  const deleteResidue = async (residue) => {
    const response = await api.residues.delete(residue.id).then(() => {
      dispatch({
        type: "update_list",
      });
      dispatch({
        type: "change_page",
        page: 1,
      });
      notification.success({ message: "Producto eliminado" });
    });
  };
  const downloadDataToExcel = async () => {
    const pageSize = 10; // Número de elementos por página
    let currentPage = 1; // Página actual
    let allData = []; // Array para almacenar todos los datos

    // Función para obtener los datos de una página específica
    const getDataPage = async (page) => {
      const rq = await api.residues.list(page);
      return rq.results;
    };

    // Obtener los datos de la primera página
    let pageData = await getDataPage(currentPage);
    allData = allData.concat(pageData);

    // Obtener los datos de las páginas restantes
    while (pageData.length === pageSize) {
      currentPage++;
      pageData = await getDataPage(currentPage);
      allData = allData.concat(pageData);
    }

    // Dividir los datos en lotes más pequeños

    const filteredData = allData.map((item) => ({
      "Fecha creacion": item.created.slice(0, 10),
      Nombre: item.name,
      Medida: item.type_medition,
      Tipo_prodcto: item.product_type,
      Cantidad: item.quantity,
      Precio: Math.floor(item.price),
    }));

    // Crear el archivo Excel y descargarlo
    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    // Set column widths based on the length of the title text
    const columnWidths = Object.keys(worksheet).reduce((widths, cell) => {
      const column = cell.replace(/[0-9]/g, "");
      const value = worksheet[cell].v;
      const length = value ? value.toString().length : 10; // Default width if value is empty
      widths[column] = Math.max(widths[column] || 0, length);
      return widths;
    }, {});

    // Apply column widths to the worksheets
    worksheet["!cols"] = Object.keys(columnWidths).map((column) => ({
      wch: columnWidths[column],
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

    // Función para aplicar estilos a las celdas
    const applyStyles = (worksheet, range, style) => {
      const { s, e } = XLSX.utils.decode_range(range);
      for (let row = s.r; row <= e.r; row++) {
        for (let col = s.c; col <= e.c; col++) {
          const cell = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cell]) {
            worksheet[cell] = {};
          }
          worksheet[cell].s = style;
        }
      }
    };

    // Crear estilos para las celdas
    const borderStyle = {
      border: {
        top: { style: "thin", color: { rgb: "00000000" } },
        bottom: { style: "thin", color: { rgb: "00000000" } },
        left: { style: "thin", color: { rgb: "00000000" } },
        right: { style: "thin", color: { rgb: "00000000" } },
      },
    };

    const headerStyle = {
      fill: { fgColor: { rgb: "00000000" } },
      font: { color: { rgb: "FFFFFFFF" } },
    };

    // Aplicar estilos a las celdas con datos
    applyStyles(worksheet, "A1:Z1000", borderStyle);

    // Aplicar estilo a la primera fila
    applyStyles(worksheet, "A1:Z1", headerStyle);

    XLSX.writeFile(workbook, `listado_productos.xlsx`);
  };

 

  useEffect(() => {
    

   
  }, []);

  

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    {
      title: "Tipo Producto",
      dataIndex: "product_type",
    },
    {
      title: "Precio",
      dataIndex: "price",
      render: (price) => new Intl.NumberFormat('es-ES', {
        style: 'decimal',
        minimumFractionDigits: 0,  // No mostrar decimales
        maximumFractionDigits: 0   // No mostrar decimales
      }).format(price)
    },

    {
      title: "Existencias",
      width: "50%",
      render: (x) => {
        const lowStockLimit = 10; // Define el límite para bajo stock
        return (
          <Row justify={"space-around"}>
            <Col span={12} >
            <span
              style={{
                color: x.quantity < lowStockLimit ? "red" : "black", // Cambia el color si la cantidad es baja
                }}
              >
                {x.quantity}
                </span>{" "}
                ({x.type_medition}){" "}
                {x.quantity < lowStockLimit && ( // Condicional para mostrar el mensaje
                <span style={{ color: "red", marginLeft: "10px" }}>
                  ¡Stock bajo!
                </span>
                )}
              </Col>
              <Col span={6}>
                <Button
                size="small"
                type="primary"
                onClick={() =>
                  Modal.info({
                  title: `Historial de ${x.name}`,
                  icon: <HistoryOutlined />,
                  width: 800,
                  content: (
                    <>
                    {console.log(x)}
                    <Row style={{ marginTop: `20px` }}>
                      <Col span={24}>
                      <Table
                        bordered
                        size="small"
                        dataSource={x.history_residue}
                        columns={[
                        {
                          title: `Fecha`,
                          dataIndex: `created`,
                          render: (x) => (
                          <>
                            {x.slice(0, 10)} {x.slice(11, 16)} hrs
                          </>
                          ),
                        },
                        {
                          title: `Cantidad`,
                          dataIndex: `quantity`,
                          render: (r) => (
                          <>
                            <b>{r} </b> <br />
                          </>
                          ),
                        },
                        {
                          title: `Usuario`,
                          dataIndex: `user`,
                          render: (user) => (
                          <Row>
                            {console.log(user)}
                            <Col>{user && user.email}</Col>
                          </Row>
                          ),
                        },
                        {
                          title: `Procedencía`,
                          dataIndex: `user`,
                          render: (user) => (
                          <Row>
                            <Col>
                            {user && (
                              <>
                              {user.type_user === `ADM`
                                ? `Administrador`
                                : `Bodega`}
                              </>
                            )}
                            </Col>
                          </Row>
                          ),
                        },
                        ]}
                      />
                      </Col>
                    </Row>
                    </>
                  ),
                  })
                }
                icon={<HistoryOutlined />}
                >
                Historial
                </Button>
              </Col>
              <Col span={1}>
                <Button
                icon={<PlusOutlined />}
                type="primary"
                shape="circle"
                size="small"
                style={{ marginRight: "20px" }}
                onClick={() => {
                  dispatch({
                    type: "select_to_add_rest",
                    payload: {
                      residue: { ...x },
                      add_quantity: true,
                      sus_quantity: false,
                    },
                  });
                }}
              ></Button>
            </Col>
            <Col span={1}>
              <Button
                icon={<MinusOutlined />}
                type="primary"
                shape="circle"
                size="small"
                style={{ marginRight: "20px" }}
                onClick={() => {
                  dispatch({
                    type: "select_to_add_rest",
                    payload: {
                      residue: { ...x },
                      add_quantity: false,
                      sus_quantity: true,
                    },
                  });
                }}
              ></Button>
            </Col>
          </Row>
        );
      },
    },
    {
      width: "10%",
      render: (x) => (
        <Row justify={"space-between"}>
          <Col span={24}>
            <Popconfirm
              title={"Estas seguro de eliminar el producto?"}
              onConfirm={() => deleteResidue(x)}
            >
              <Button
                style={{ marginBottom: "5px" }}
                type="primary"
                danger
                icon={<DeleteFilled />}
                size="small"
              >
                Eliminar
              </Button>{" "}
            </Popconfirm>
          </Col>
          <Col span={24}>
            <Button
              size="small"
              type="primary"
              onClick={() => selectResidue(x)}
              icon={<RightCircleFilled />}
            >
              Editar
            </Button>
          </Col>
        </Row>
      ),
    },
  ];

  useEffect(() => {
    getResidues();
  }, [state.list.countUpdate, state.list.page]);

  return (
    <Table
      dataSource={state.list.results}
      size="small"
      title={() => (
        <Row justify={"space-between"}>
          <Col>
            <b>Productos registrados: {state.list.count}</b>
          </Col>
          <Col>
            <Button
              style={{ backgroundColor: `#389e0d`, borderColor: `#389e0d` }}
              type={`primary`}
              size={`small`}
              icon={<FileExcelFilled />}
              onClick={downloadDataToExcel}
            >
              Descargar reporte(todos)
            </Button>
          </Col>
        </Row>
      )}
      bordered
      rowKey={(x) => x.id}
      pagination={{
        total: state.list.count,
        onChange: (page) => dispatch({ type: "change_page", page: page }),
      }}
      columns={columns}
    />
  );
};

export default List;
