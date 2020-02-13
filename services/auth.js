import cookiejs from "js-cookie";
const TOKEN_KEY = "jwt-mao-doce-key";

const authService = (cookie = cookiejs) => ({
  isAuthenticated: () => {
    console.log({
      isAuth: cookie.get(TOKEN_KEY),
      pass: typeof cookie.get(TOKEN_KEY) !== "undefined"
    });
    return typeof cookie.get(TOKEN_KEY) !== "undefined";
  },
  getToken: () => cookie.get(TOKEN_KEY),
  login: token => {
    // console.log(cookie.get(TOKEN_KEY));
    cookie.set(TOKEN_KEY, token);
  },
  logout: () => {
    cookie.remove(TOKEN_KEY);
  }
});

export default authService;
