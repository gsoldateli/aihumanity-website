import Head from "next/head";
import { useRouter } from "next/router";
import {
  Button,
  Form,
  Input,
  Container,
  Segment,
  Header,
  Icon
} from "semantic-ui-react";
import { useForm } from "react-hook-form";

import authService from "../../services/auth";
import api from "../../services/api";

const LoginForm = () => {
  const router = useRouter();
  const { register, handleSubmit, errors, formState } = useForm();
  const { login } = authService();
  const submitLogin = async data => {
    console.log({ api });
    const {
      data: { access_token: accessToken }
    } = await api.post("/auth/login", { ...data });
    console.log({ accessToken });
    if (accessToken) {
      login(accessToken);
      router.push("/admin/");
    }
  };

  return (
    <Segment placeholder style={{ minHeight: "100vh" }}>
      <Header icon>
        <Icon name="user outline" />
        Acesso restrito ao administrador
      </Header>
      <Form
        onSubmit={handleSubmit(submitLogin)}
        loading={formState.isSubmitting}
      >
        <Head>
          <title>Admin - Login</title>
        </Head>
        <Form.Field
          control={Input}
          error={
            errors.user
              ? {
                  content: errors.user.message,
                  pointing: "below"
                }
              : null
          }
          label="Usuário"
        >
          <input
            placeholder="Digite seu usuário"
            name="email"
            type="email"
            ref={register({ required: "Preencha o seu email" })}
          />
        </Form.Field>
        <Form.Field
          control={Input}
          error={
            errors.password
              ? {
                  content: errors.password.message,
                  pointing: "below"
                }
              : null
          }
          label="Senha"
        >
          <input
            ref={register({ required: "Preencha sua senha por favor" })}
            type="password"
            placeholder="Digite sua senha"
            name="password"
          />
        </Form.Field>
        <Button primary type="submit">
          Fazer login
        </Button>
      </Form>
    </Segment>
  );
};

export default LoginForm;
