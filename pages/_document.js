import Document, { Head, Main, NextScript } from "next/document";
// Import styled components ServerStyleSheet
import { ServerStyleSheet } from "styled-components";

class MyDocument extends Document {
  static getInitialProps(prop) {
    const isAdmin = prop.pathname.startsWith("/admin");

    const { renderPage } = prop;
    const sheet = new ServerStyleSheet();

    const page = renderPage(App => props =>
      sheet.collectStyles(<App {...props} />)
    );

    const styleTags = sheet.getStyleElement();

    return { ...page, styleTags, isAdmin };
  }

  render() {
    return (
      <html>
        <Head>
          {this.props.isAdmin && (
            <link
              rel="stylesheet"
              href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
            />
          )}
          {/* Step 5: Output the styles in the head  */}
          {this.props.styleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

export default MyDocument;
