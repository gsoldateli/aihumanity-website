import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Header, Icon, Image, Menu, Segment, Sidebar } from "semantic-ui-react";
import { ToastProvider } from "react-toast-notifications";
import authService from "../../services/auth";
const AdminLayout = ({ children }) => {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  return (
    <ToastProvider autoDismissTimeout={3500}>
      <Sidebar.Pushable as={Segment} style={{ minHeight: "100vh" }}>
        <Sidebar
          as={Menu}
          animation="push"
          direction="left"
          inverted
          vertical
          visible={sidebarVisible}
        >
          <Menu.Item as="a" header>
            Módulos
          </Menu.Item>
          <Link
            as="a"
            href="/admin/product-category"
            as="/admin/product-category"
          >
            <Menu.Item as="a">Categorias</Menu.Item>
          </Link>
          <Link
            as="a"
            href="/admin/product-catalog"
            as="/admin/product-catalog"
          >
            <Menu.Item as="a">Catálogos</Menu.Item>
          </Link>
        </Sidebar>

        <Sidebar.Pusher
          dimmed={sidebarVisible}
          onClick={() => sidebarVisible && setSidebarVisible(false)}
          style={{ minHeight: "100vh" }}
        >
          <Segment basic>
            <Menu>
              <Menu.Item onClick={() => setSidebarVisible(!sidebarVisible)}>
                {sidebarVisible ? "Fechar" : "Abrir"}

                {sidebarVisible ? (
                  <Icon name="ellipsis vertical" />
                ) : (
                  <Icon name="ellipsis horizontal" />
                )}
              </Menu.Item>
              <Menu.Menu position="right">
                <Menu.Item
                  name="sair"
                  onClick={() => {
                    const { logout } = authService();
                    logout();
                    router.replace("/admin/login");
                  }}
                >
                  Sair
                </Menu.Item>
              </Menu.Menu>
            </Menu>
            {children}
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </ToastProvider>
  );
};

export default AdminLayout;
