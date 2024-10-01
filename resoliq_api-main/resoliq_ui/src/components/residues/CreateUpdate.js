import React, { useContext, useEffect } from "react";
import { Card, Form, Input, Button, Modal, notification, Tag, Select, InputNumber  } from "antd";
import { WasteContext } from "../../containers/Waste";
import {
  PlusCircleFilled,
  ClearOutlined,
  RetweetOutlined,
  MinusCircleFilled,
} from "@ant-design/icons";
import api from "../../api/endpoints";

const CreateUpdate = () => {
  const { state, dispatch } = useContext(WasteContext);
  const [form] = Form.useForm();

  function createOrClear() {
    if (state.select_to_edit) {
      dispatch({
        type: "select_to_edit",
        payload: { residue: null },
      });
      form.resetFields();
    } else {
      form.resetFields();
    }
  }

  async function createResidue(values) {
    await api.residues
      .create(values)
      .then(() => {
        dispatch({
          type: "update_list",
        });
        form.resetFields();
      })
      .catch((e) => {
        const errors = e.response.data;
        const errorList = Object.keys(errors).map((key) => errors[key]);
        Modal.error({
          title:
            "Errores al crear el nuevo Producto, revisa tus datos ingresados.",
          content: (
            <ul>
              {errorList.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ),
        });
      });
  }

  async function updateResidue(values) {
    if (state.add_quantity || state.sus_quantity) {
      if (state.add_quantity) {
        values.quantity =
          parseFloat(state.select_to_edit.quantity) +
          parseFloat(values.quantity);
        console.log(values.quantity);
        console.log(state.select_to_edit.quantity);
        const register = api.register_residues.create({
          residue: state.select_to_edit.id,
          quantity: values.quantity - state.select_to_edit.quantity,
        });
      } else {
        values.quantity =
          parseFloat(state.select_to_edit.quantity) -
          parseFloat(values.quantity);
        const register = api.register_residues.create({
          residue: state.select_to_edit.id,
          quantity: values.quantity - state.select_to_edit.quantity,
        });
      }
    }
    await api.residues
      .update(state.select_to_edit.id, values)
      .then(() => {
        dispatch({
          type: "update_list",
        });
        dispatch({ type: "select_to_edit", payload: { residue: null } });
        form.resetFields();
        notification.success({ message: "Producto actualizado correctamente." });
      })
      .catch((e) => {
        const errors = e.response.data;
        const errorList = Object.keys(errors).map((key) => errors[key]);
        Modal.error({
          title: "Errores al actualizar el Producto.",
          content: (
            <ul>
              {errorList.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ),
        });
      });
    if (values.password) {
      notification.success({ message: "Producto actualizado correctamente." });
      dispatch({ type: "select_to_edit", payload: { residue: null } });
      form.resetFields();
    }
  }

  function createOrUpdateResidue(values) {
    if (state.select_to_edit) {
      updateResidue(values);
    } else {
      createResidue(values);
    }
  }

  useEffect(() => {
    if (state.select_to_edit) {
      form.setFieldsValue(state.select_to_edit);
    }
    if (state.add_quantity || state.sus_quantity) {
      form.setFieldValue("quantity", parseFloat(0));
    }
  }, [state.select_to_edit]);

  return (
    <Card
      hoverable
      title={
        state.select_to_edit ? (
          <>
            {state.add_quantity || state.sus_quantity ? (
              state.add_quantity ? (
                `Agregar existencias a ${state.select_to_edit.name}`
              ) : (
                `Retirar existencias a ${state.select_to_edit.name}`
              )
            ) : (
              <Tag color="blue-inverse">
                Actualizando: {state.select_to_edit.name}
              </Tag>
            )}
          </>
        ) : (
          "Crear nuevo Producto"
        )
      }
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        labelWrap={true}
        onFinish={createOrUpdateResidue}
      >
        {!state.add_quantity && !state.sus_quantity && (
          <>
            <Form.Item
              label="Nombre"
              name="name"
              rules={[{ required: true, message: "Ingresa el nombre" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Medida"
              name="type_medition"
              rules={[{ required: true, message: "Ingresa la medida" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Precio"
              name="price"
              rules={[{ required: true, message: "Ingresa el precio" }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: "100%" }}
                placeholder="Ingresa el precio"
                formatter={(value) =>
                  ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value.replace(/\.\s?|(,*)/g, "")}
              />
            </Form.Item>

            <Form.Item
              label="Tipo de Producto"
              name="product_type"
              rules={[{ required: true, message: "Selecciona el tipo de producto" }]}
            >
              <Select placeholder="Selecciona el tipo de producto">
                <Select.Option value="frutas_verduras">Frutas y Verduras</Select.Option>
                <Select.Option value="Lacteos">Lácteos</Select.Option>
                <Select.Option value="carnes">Carnes</Select.Option>
                <Select.Option value="mariscos">Mariscos</Select.Option>
                <Select.Option value="panaderia">Panadería</Select.Option>
                <Select.Option value="bebidas">Bebidas</Select.Option>
                <Select.Option value="congelados">Congelados</Select.Option>
                <Select.Option value="enlatados">Enlatados</Select.Option>
                <Select.Option value="snacks">Snacks y Dulces</Select.Option>
                <Select.Option value="limpieza">Productos de Limpieza</Select.Option>
                <Select.Option value="cuidado_personal">Cuidado Personal</Select.Option>
                <Select.Option value="articulos_hogar">Artículos para el Hogar</Select.Option>
                <Select.Option value="productos_bebe">Productos para Bebés</Select.Option>
                <Select.Option value="productos_mascotas">Productos para Mascotas</Select.Option>
                <Select.Option value="granos">Granos y Cereales</Select.Option>
                <Select.Option value="condimentos">Condimentos y Salsas</Select.Option>
                <Select.Option value="pastas_arroces">Pastas y Arroces</Select.Option>
                <Select.Option value="especias">Especias</Select.Option>
                <Select.Option value="aceites">Aceites</Select.Option>
                <Select.Option value="productos_salud">Productos de Salud</Select.Option>
                <Select.Option value="alcohol">Bebidas Alcohólicas</Select.Option>
                <Select.Option value="comidas_preparadas">Comidas Preparadas</Select.Option>
                <Select.Option value="comida_rapida">Comida para mascotas</Select.Option>
                <Select.Option value="confiteria">Confitería</Select.Option>
                <Select.Option value="otros">Otros</Select.Option>
              </Select>
            </Form.Item>
          </>
        )}
        {(state.add_quantity || state.sus_quantity) && (
          <Form.Item
            label="Cantidad"
            name="quantity"
            rules={[{ required: true, message: "Ingresa la cantidad" }]}
          >
            <Input />
          </Form.Item>
        )}

        <Form.Item style={{ float: "right" }}>
          <Button
            htmlType="submit"
            type="primary"
            style={{
              marginRight: "10px",
            }}
            icon={
              state.select_to_edit ? (
                state.add_quantity || state.sus_quantity ? (
                  state.add_quantity ? (
                    <PlusCircleFilled />
                  ) : (
                    <MinusCircleFilled />
                  )
                ) : (
                  <RetweetOutlined />
                )
              ) : (
                <PlusCircleFilled />
              )
            }
          >
            {state.select_to_edit ? (
              <>
                {state.add_quantity || state.sus_quantity
                  ? state.add_quantity
                    ? `Agregar`
                    : `Retirar`
                  : `Actualizar`}
              </>
            ) : (
              "Crear"
            )}
          </Button>
          <Button
            onClick={createOrClear}
            icon={
              state.select_to_edit ? <PlusCircleFilled /> : <ClearOutlined />
            }
          >
            {state.select_to_edit ? "Crear nuevo" : "Limpiar"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateUpdate;
