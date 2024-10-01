import React, { useState, useContext } from "react";
import { Menu, Layout, Button, Row, Col, Affix } from "antd";
import logo from "../assets/img/logo.jpeg";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Users from "./Users";
import Waste from "./Waste";
import Clients from "./Clients";
import { AppContext } from "../App";

const { Header, Sider, Content } = Layout;

const Home = () => {
  const { dispatch, state } = useContext(AppContext);
  
  // Condicional para setear opción inicial basada en tipo de usuario
  const [option, setOption] = useState(state.user.type_user === "ADM" ? 0 : 1);

  return (
    <>
      <Affix>
        <Sider style={{ minHeight: "101vh" }}>
          <img src={logo} width={"90%"} alt="logo" />
          <Row justify={"center"} style={{ marginTop: "70px" }}>
            <Col span={23}>
              {state.user.type_user === "ADM" && (
                <Button
                  type="primary"
                  block={true}
                  style={{ marginBottom: "10px" }}
                  onClick={() => setOption(0)}
                >
                  Usuarios
                </Button>
              )}
              <Button
                type="primary"
                block={true}
                style={{ marginBottom: "10px" }}
                onClick={() => setOption(1)}
              >
                Productos
              </Button>
              <Button
                type="primary"
                block={true}
                style={{ marginBottom: "10px" }}
                onClick={() => setOption(2)}
              >
                Clientes
              </Button>
            </Col>
          </Row>
        </Sider>
      </Affix>
      <Layout>
        <Affix>
          <Header>
            <Row style={{ float: "right" }}>
              <Col
                style={{
                  color: "white",
                  marginRight: "10px",
                  fontSize: "15px",
                }}
              >
                <u>{state.user && state.user.email}</u>
              </Col>
              <Col
                style={{
                  color: "white",
                  marginRight: "10px",
                  fontSize: "15px",
                }}
              >
                ({state.user && state.user.dni})
              </Col>
              <Col>
                <Button
                  icon={<LogoutOutlined />}
                  onClick={() => dispatch({ type: "LOGOUT" })}
                >
                  Salir
                </Button>
              </Col>
            </Row>
          </Header>
        </Affix>
        <Content style={{ padding: "10px", minHeight: `90vh` }}>
          {option === 0 && <Users />}
          {option === 1 && <Waste />}
          {option === 2 && <Clients />}
        </Content>
      </Layout>
    </>
  );
};

export default Home;