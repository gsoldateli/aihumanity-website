import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useToasts } from "react-toast-notifications";
import Link from "next/link";
import api from "../../../services/api";
import { Header, Icon, Segment, Button } from "semantic-ui-react";
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

const crudRedirect = router => action => {
  router.push(`${getBasePath(router)}/${ACTION_LIST}`);
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
      redirect(ACTION_LIST);
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

      redirect(ACTION_LIST);
    }
  };

  return <FormComponent {...props} data={data} onSubmit={onSubmit} />;
};

const HeaderWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
`;

const Crud = ({ FormComponent, resourceEndpoint }) => {
  const router = useRouter();
  const basePath = getBasePath(router);
  const pageApi = crudApi(resourceEndpoint);
  const [action, id] = router.query.params || [];
  let Component = <h1>List</h1>;
  switch (action) {
    case ACTION_NEW:
      Component = withNew(FormComponent, { api: pageApi });
      break;
    case ACTION_EDIT:
      Component = withUpdate(FormComponent, { api: pageApi, id });
      break;
    default:
      Component = () => <h1>LISTAGEM</h1>;
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
          <Link href={`${basePath}/${ACTION_NEW}`}>
            <Button primary style={{ alignSelf: "center" }}>
              <Icon name="add" />
              Adicionar
            </Button>
          </Link>
        </HeaderWrapper>
      </Header>
      <h2>
        {action} - {id}
      </h2>
      <Component />
    </Segment>
  );
};

export default Crud;
