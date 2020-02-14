import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form, Button, Checkbox, Input, TextArea } from "semantic-ui-react";
import AdminLayout from "../../../components/Admin/Layout";
import Crud from "../../../components/Admin/Crud";

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
        <input ref={register} name="name" placeholder="Nome da categoria" />
      </Form.Field>
      <Form.Field>
        <label>Descrição da categoria</label>

        <Controller as={<TextArea />} name="description" control={control} />
      </Form.Field>

      <Button type="submit">Submit</Button>
    </Form>
  );
};

const ProductCategoryCrud = () => {
  return (
    <AdminLayout>
      <Crud
        FormComponent={ProductCategoryForm}
        resourceEndpoint="product-category"
      />
    </AdminLayout>
  );
};

export default ProductCategoryCrud;
