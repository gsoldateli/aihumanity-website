import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useToasts } from "react-toast-notifications";
import Link from "next/link";
import api from "../../../services/api";
import {
  Header,
  Icon,
  Segment,
  Button,
  Table,
  Checkbox,
  Accordion,
  Menu,
  Dropdown,
  Modal
} from "semantic-ui-react";
import styled from "styled-components";

const ACTION_NEW = "new";
const ACTION_EDIT = "edit";
const ACTION_LIST = "list";
const ACTION_EXTRA = "extra";

const getBasePath = router => {
  const { pathname } = router;
  return (
    pathname
      .split("/")
      // Removes [...slug]
      .filter(part => !part.startsWith("["))
      .join("/")
  );
};

const buildQueryString = params => {
  return Object.keys(params)
    .map(key => key + "=" + params[key])
    .join("&");
};

const crudRedirect = router => (parameters, as) => {
  const asArray = as
    ? as
    : Object.keys(parameters).map(function(key) {
        return parameters[key];
      });
  router.push(
    `${getBasePath(router)}?${buildQueryString(parameters)}`,
    `${getBasePath(router)}/${asArray.join("/")}`
  );
};

const parseServerErrors = errors => {
  return Object.keys(errors).map(field => ({
    name: field,
    type: "required",
    message: errors[field][0]
  }));
};

const crudApi = routeUri => {
  return {
    store: params => {
      return api.post(routeUri, params);
    },
    update: async ({ id, params }) => {
      return await api.put(`${routeUri}/${id}`, params);
    },
    show: async id => {
      return await api.get(`${routeUri}/${id}`);
    },
    delete: async id => {
      return await api.delete(`${routeUri}/${id}`);
    },
    list: async filters => {
      return await api.get(routeUri, { params: { filters } });
    },
    post: api.post,
    get: api.get
  };
};

const withNew = (FormComponent, { api }) => props => {
  const { addToast } = useToasts();

  const redirect = crudRedirect(useRouter());

  const onSubmit = form => async data => {
    let response = null;
    try {
      response = await api.store(data);
    } catch ({
      response: {
        data: { errors }
      }
    }) {
      form.setError(parseServerErrors(errors));
    }

    if (response && response.data) {
      addToast("Registro criado com sucesso!", {
        appearance: "success",
        autoDismiss: true
      });
      redirect({ action: ACTION_LIST });
    }
  };

  return <FormComponent {...props} onSubmit={onSubmit} />;
};

const withUpdate = (FormComponent, { api, id = null }) => props => {
  const { addToast } = useToasts();
  const [data, setData] = useState(null);
  const redirect = crudRedirect(useRouter());
  useEffect(() => {
    const loadRegister = async () => {
      const response = await api.show(id);

      if (response && response.data) {
        setData(response.data);
      }
    };

    loadRegister();
  }, []);

  if (!data) return <h1>LOADING....</h1>;

  const onSubmit = form => async data => {
    let success = null;
    try {
      success = await api.update({ id, params: data });
    } catch ({
      response: {
        data: { errors }
      }
    }) {
      form.setError(parseServerErrors(errors));
    }

    if (success) {
      addToast("Registro atualizado com sucesso!", {
        appearance: "success",
        autoDismiss: true
      });

      redirect({ action: ACTION_LIST });
    }
  };

  return <FormComponent {...props} data={data} onSubmit={onSubmit} />;
};

const HeaderWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
`;

const CrudListItem = ({ item, deleteAction }) => {
  const redirect = crudRedirect(useRouter());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <Table.Row>
      <Table.Cell collapsing>
        <Dropdown text="File">
          <Dropdown.Menu>
            <Dropdown.Item
              text="Editar"
              onClick={() =>
                redirect({ action: ACTION_EDIT, id: item.id }, [
                  ACTION_EDIT,
                  item.id
                ])
              }
            />
            <Modal
              open={deleteModalOpen}
              trigger={
                <Dropdown.Item
                  onClick={() => setDeleteModalOpen(true)}
                  text="Remover"
                />
              }
              basic
              size="small"
              dimmer="blurring"
            >
              <Header
                icon="warning sign"
                content="Deseja mesmo remover este registro?"
              />
              <Modal.Content>
                <p>Uma vez removido, não poderá ser recuperado novamente.</p>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  onClick={() => setDeleteModalOpen(false)}
                  basic
                  color="red"
                  inverted
                >
                  <Icon name="remove" key="done" /> Não quero
                </Button>
                <Button
                  color="green"
                  inverted
                  onClick={async () => {
                    await deleteAction(item.id);
                    setDeleteModalOpen(false);
                  }}
                >
                  <Icon name="checkmark" /> Sim, quero.
                </Button>
              </Modal.Actions>
            </Modal>
          </Dropdown.Menu>
        </Dropdown>
      </Table.Cell>
      <Table.Cell>{item.name}</Table.Cell>
      <Table.Cell>{item.description}</Table.Cell>
    </Table.Row>
  );
};

const CrudList = ({ api }) => {
  const { addToast } = useToasts();
  const [filtersActive, setFilterActive] = useState(false);
  const [items, setItems] = useState(null);

  const deleteAction = async id => {
    try {
      const response = await api.delete(id);

      setItems(items.filter(item => item.id !== id));
      addToast(response.data.message, {
        appearance: "success",
        autoDismiss: true
      });
    } catch ({ response: { data } }) {
      addToast(data.message, {
        appearance: "error"
      });
    }
  };

  useEffect(() => {
    const loadItems = async () => {
      const response = await api.list();

      if (response && response.data) {
        setItems(response.data);
      }
    };

    loadItems();
  }, []);

  if (!items) return <h1>Loading List....</h1>;

  return (
    <>
      <Accordion fluid styled>
        <Accordion.Title
          active={filtersActive}
          index={0}
          onClick={() => setFilterActive(!filtersActive)}
        >
          <Icon name="dropdown" />
          Filtros
        </Accordion.Title>
        <Accordion.Content active={filtersActive}>
          <p>
            A dog is a type of domesticated animal. Known for its loyalty and
            faithfulness, it can be found as a welcome guest in many households
            across the world.
          </p>
        </Accordion.Content>
      </Accordion>
      {items && items.length > 0 ? (
        <Table celled compact definition>
          <Table.Header fullWidth>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell>Nome</Table.HeaderCell>
              <Table.HeaderCell>Descrição</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map(item => (
              <CrudListItem
                key={item.id}
                item={item}
                deleteAction={deleteAction}
              />
            ))}
          </Table.Body>
        </Table>
      ) : (
        <Segment placeholder>
          <Header icon>
            <Icon name="search" />
            Nenhum registro encontrado.
          </Header>
        </Segment>
      )}
    </>
  );
};

const Crud = ({ FormComponent, resourceEndpoint }) => {
  const router = useRouter();

  const basePath = getBasePath(router);
  const pageApi = crudApi(resourceEndpoint);

  let action;
  let id;

  // if params come from server side
  if (router.query.params) {
    action = router.query.params[0];
    id = router.query.params[1];
  } else {
    // params come from client side
    id = router.query.id || null;
    action = router.query.action || null;
  }

  let Component = <h1>List</h1>;
  switch (action) {
    case ACTION_NEW:
      Component = withNew(FormComponent, { api: pageApi });
      break;
    case ACTION_EDIT:
      Component = withUpdate(FormComponent, { api: pageApi, id });
      break;
    default:
      Component = () => <CrudList api={pageApi} />;
  }

  return (
    <Segment>
      <Header as="h2" dividing>
        <HeaderWrapper>
          <div>
            <Icon name="settings" />
            <Header.Content>
              Categoria de produtos
              <Header.Subheader>
                Gerencie as categorias dos produtos
              </Header.Subheader>
            </Header.Content>
          </div>
          {action === ACTION_LIST ? (
            <Link
              href={`${basePath}?action=${ACTION_NEW}`}
              as={`${basePath}/${ACTION_NEW}`}
            >
              <Button positive style={{ alignSelf: "center" }}>
                <Icon name="add" />
                Adicionar
              </Button>
            </Link>
          ) : (
            <Link
              href={`${basePath}?action=${ACTION_LIST}`}
              as={`${basePath}/${ACTION_LIST}`}
            >
              <Button primary style={{ alignSelf: "center" }}>
                <Icon name="undo" />
                Voltar
              </Button>
            </Link>
          )}
        </HeaderWrapper>
      </Header>
      <Component />
    </Segment>
  );
};

export default Crud;
