import { useState } from "react";
import { useRouter } from "next/router";
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
            File Permissions
          </Menu.Item>
          <Menu.Item as="a">Share on Social</Menu.Item>
          <Menu.Item as="a">Share by E-mail</Menu.Item>
          <Menu.Item as="a">Edit Permissions</Menu.Item>
          <Menu.Item as="a">Delete Permanently</Menu.Item>
        </Sidebar>

        <Sidebar.Pusher
          dimmed={sidebarVisible}
          onClick={() => sidebarVisible && setSidebarVisible(false)}
        >
          <Segment basic>
            <Menu>
              <Menu.Item onClick={() => setSidebarVisible(!sidebarVisible)}>
                {sidebarVisible ? "Fechar" : "Abrir"}
                {" - "}
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
            <Header as="h3">Application Content</Header>
            <Image src="https://react.semantic-ui.com/images/wireframe/paragraph.png" />
            <br />
            <Image src="https://react.semantic-ui.com/images/wireframe/paragraph.png" />
            <br />
            <Image src="https://react.semantic-ui.com/images/wireframe/paragraph.png" />
            <br />
            <Image src="https://react.semantic-ui.com/images/wireframe/paragraph.png" />
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </ToastProvider>
  );
};

export default AdminLayout;
