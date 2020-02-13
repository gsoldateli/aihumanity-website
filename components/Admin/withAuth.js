import Router from "next/router";
import { withCookie } from "next-cookie";

import authService from "../../services/auth";

const redirect = (context, target) => {
  if (context.res) {
    // server
    // 303: "See other"
    context.res.writeHead(303, { Location: target });
    context.res.end();
  } else {
    // In the browser, we just pretend like this never even happened ;)
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
