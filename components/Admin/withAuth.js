import Router from "next/router";
import { withCookie } from "next-cookie";

import authService from "../../services/auth";

const redirect = (context, target) => {
  if (context && context.res && context.res.writeHead) {
    context.res.writeHead(303, { Location: target });
    context.res.end();
  } else if (typeof window !== "undefined") {
    Router.replace(target);
  }
};

const withAuth = C => {
  const AuthComponent = props => <C {...props} />;

  AuthComponent.getInitialProps = async ctx => {
    const { cookie, ctxRest } = ctx;
    const { isAuthenticated } = authService(cookie);

    if (!isAuthenticated()) {
      redirect(ctx, "/admin/login");
    }

    let componentProps = {};
    if (C.getInitialProps) {
      componentProps = await C.getInitialProps(ctxRest);
    }

    return { ...componentProps };
  };

  return withCookie(AuthComponent);
};

export default withAuth;
