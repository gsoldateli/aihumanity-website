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
  Dropdown
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

const CrudList = ({ api }) => {
  const redirect = crudRedirect(useRouter());
  const [filtersActive, setFilterActive] = useState(false);
  const [items, setItems] = useState(null);

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
      <Table celled compact definition>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Nome</Table.HeaderCell>
            <Table.HeaderCell>Descrição</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items &&
            items.length > 0 &&
            items.map(item => (
              <Table.Row>
                <Table.Cell collapsing>
                  <Menu compact>
                    <Dropdown
                      text="Ações"
                      options={[
                        {
                          key: 1,
                          text: "Editar",
                          value: 1,
                          onClick: () =>
                            redirect({ action: ACTION_EDIT, id: item.id }, [
                              ACTION_EDIT,
                              item.id
                            ])
                        },
                        { key: 2, text: "Deletar", value: 2 }
                      ]}
                      simple
                      item
                    />
                  </Menu>
                </Table.Cell>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>{item.description}</Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
    </>
  );
};

const Crud = ({ FormComponent, resourceEndpoint }) => {
  const router = useRouter();

  const basePath = getBasePath(router);
  const pageApi = crudApi(resourceEndpoint);

  let action;
  let id;

  if (router.query.params) {
    action = router.query.params[0];
    id = router.query.params[1];
  } else {
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
          <Link
            href={`${basePath}?action=${ACTION_NEW}`}
            as={`${basePath}/${ACTION_NEW}`}
          >
            <Button primary style={{ alignSelf: "center" }}>
              <Icon name="add" />
              Adicionar
            </Button>
          </Link>
        </HeaderWrapper>
      </Header>
      <Component />
    </Segment>
  );
};

export default Crud;
