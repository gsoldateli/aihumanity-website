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

const ProductCategoryForm = props => {
  const {
    data = {},
    onSubmit = data => console.error("onSubmit not provided", data)
  } = props;
  const [termsChecked, setTermsChecked] = useState(false);
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
        label="Nome da categoria"
      >
        <input
          ref={register({ required: "Campo nome é obrigatório." })}
          name="name"
          placeholder="Nome da categoria"
        />
      </Form.Field>
      <Form.Field>
        <label>Descrição da categoria</label>

        <Controller as={<TextArea />} name="description" control={control} />
      </Form.Field>

      <Button type="submit">Submit</Button>
    </Form>
  );
};

const ProductCategoryList = ({ api }) => {
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
    />
  );
};

const ProductCategoryCrud = () => {
  return (
    <AdminLayout>
      <Crud
        title="Categorias de produto"
        subtitle="Gerencie aqui as categorias de produtos"
        FormComponent={ProductCategoryForm}
        ListComponent={ProductCategoryList}
        resourceEndpoint="product-category"
      />
    </AdminLayout>
  );
};

export default withAuth(ProductCategoryCrud);
