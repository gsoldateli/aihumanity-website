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
  Pagination,
  Form,
  Dropdown,
  Modal,
  Input,
  Select,
  Placeholder
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
    list: async params => {
      return await api.get(routeUri, { params });
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

const TableFooter = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
`;

const CrudListItem = ({ item, deleteAction }) => {
  const redirect = crudRedirect(useRouter());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <Table.Row>
      <Table.Cell collapsing>
        <Dropdown text="Ações">
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
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState("30");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [orderWay, setOrderWay] = useState("desc");
  const [orderBy, setOrderBy] = useState("updated_at");
  // const [filtersActive, setFilterActive] = useState(false);
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

  const loadItems = async () => {
    setLoading(true);

    const { data = null } = await api.list({
      page,
      limit,
      filter: searchText,
      orderWay,
      orderBy
    });

    if (data.data) {
      setItems(data.data);
      setTotalPages(data.last_page);
      setTotalItems(data.total);
      setPage(Math.min(data.last_page, page));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, [page, orderWay, orderBy, limit]);

  let Component;
  if (loading) {
    Component = () => (
      <div style={{ padding: "2rem 0" }}>
        <Placeholder fluid>
          <Placeholder.Paragraph>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Paragraph>
          <Placeholder.Paragraph>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Paragraph>
          <Placeholder.Paragraph>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Paragraph>
          <Placeholder.Paragraph>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Paragraph>
        </Placeholder>
      </div>
    );
  } else if (items && items.length > 0) {
    Component = () => (
      <>
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
        <TableFooter>
          <div>
            <Pagination
              boundaryRange={0}
              defaultActivePage={page}
              siblingRange={1}
              totalPages={totalPages}
              onPageChange={(e, { activePage }) => {
                setPage(activePage);
              }}
              style={{ alignSelf: "center" }}
            />
            <strong style={{ display: "inline-block", paddingLeft: "1rem" }}>
              {totalItems} registros encontrados.
            </strong>
          </div>
          <Form>
            <Form.Group widths="equal" style={{ marginBottom: "0" }}>
              <Form.Field
                control={Select}
                onChange={(e, data) => setOrderBy(data.value)}
                options={[
                  {
                    key: "updated_at",
                    value: "updated_at",
                    text: "Data Atualização"
                  },
                  { key: "name", value: "name", text: "Nome" },
                  {
                    key: "description",
                    value: "description",
                    text: "Descrição"
                  }
                ]}
                defaultValue={orderBy}
                label="Ordenar por:"
              />
              <Form.Field
                control={Select}
                onChange={(e, data) => setOrderWay(data.value)}
                options={[
                  { key: "asc", value: "asc", text: "ASC." },
                  { key: "desc", value: "desc", text: "DESC." }
                ]}
                defaultValue={orderWay}
                label="Ordem:"
              />
              <Form.Field
                control={Select}
                onChange={(e, data) => setLimit(data.value)}
                options={[
                  { key: "10", value: "10", text: "10" },
                  { key: "15", value: "15", text: "15" },
                  { key: "30", value: "30", text: "30" },
                  { key: "100", value: "100", text: "100" },
                  { key: "150", value: "150", text: "150" }
                ]}
                defaultValue={limit}
                label="Quantidade:"
              />
            </Form.Group>
          </Form>
        </TableFooter>
      </>
    );
  } else {
    Component = () => (
      <Segment placeholder>
        <Header icon>
          <Icon name="search" />
          Nenhum registro encontrado.
        </Header>
      </Segment>
    );
  }
  return (
    <>
      <div style={{ maxWidth: "300px" }}>
        <Input
          onChange={e => {
            setSearchText(e.currentTarget.value);
          }}
          value={searchText}
          fluid
          icon={{
            name: "search",
            circular: true,
            link: true,
            onClick: () => {
              loadItems();
            }
          }}
          placeholder="Buscar..."
        />
      </div>
      {/* <Accordion fluid styled>
        <Accordion.Title
          active={filtersActive}
          index={0}
          onClick={() => setFilterActive(!filtersActive)}
        >
          <Icon name="dropdown" />
          Filtros
        </Accordion.Title>
        <Accordion.Content active={filtersActive}>
          
        </Accordion.Content>
      </Accordion> */}

      <Component />
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
