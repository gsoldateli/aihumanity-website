import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Form,
  Button,
  Input,
  TextArea,
  Table,
  Dropdown
} from "semantic-ui-react";
import AdminLayout from "../../../components/Admin/Layout";
import Crud, { CrudList } from "../../../components/Admin/Crud";
import withAuth from "../../../components/Admin/withAuth";

const ProductCatalogForm = props => {
  const {
    data = {},
    onSubmit = data => console.error("onSubmit not provided", data)
  } = props;

  const {} = props;

  const form = useForm({
    defaultValues: data
  });

  const {
    register,

    handleSubmit,
    errors,
    formState: { isSubmitting },
    control
  } = form;

  return (
    <Form onSubmit={handleSubmit(onSubmit(form))} loading={isSubmitting}>
      <Form.Field
        control={Input}
        error={
          errors.name
            ? {
                content: errors.name.message,
                pointing: "below"
              }
            : null
        }
        label="Nome do catálogo"
      >
        <input
          ref={register({ required: "Nome do catálogo deve ser informado." })}
          name="name"
          placeholder="Nome do catálogo"
        />
      </Form.Field>
      <Form.Field>
        <label>Descrição do catálogo</label>

        <Controller as={<TextArea />} name="description" control={control} />
      </Form.Field>

      <Button positive type="submit">
        {data.id ? "Atualizar" : "Cadastrar"}
      </Button>
    </Form>
  );
};

const ProductCatalogList = ({ api }) => {
  return (
    <CrudList
      api={api}
      columns={["Nome", "Descrição"]}
      renderItem={item => {
        return (
          <>
            <Table.Cell>{item.name}</Table.Cell>
            <Table.Cell>{item.description}</Table.Cell>
          </>
        );
      }}
      extraItemActions={item => (
        <>
          <Dropdown.Item
            text={`Alert ${item.id}`}
            onClick={() => alert(item.id)}
          />
        </>
      )}
      orderByOptions={[
        { key: "name", value: "name", text: "Nome" },
        { key: "description", value: "description", text: "Descrição" }
      ]}
    />
  );
};

const ProductCategoryCrud = () => {
  return (
    <AdminLayout>
      <Crud
        headerIcon="list alternate outline"
        title="Catálogo de produtos"
        subtitle="Gerencie catálogos de produtos"
        FormComponent={ProductCatalogForm}
        ListComponent={ProductCatalogList}
        resourceEndpoint="product-catalog"
      />
    </AdminLayout>
  );
};

export default withAuth(ProductCategoryCrud);
