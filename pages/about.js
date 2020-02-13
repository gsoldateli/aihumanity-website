import withAuth from "../components/Admin/withAuth";
const About = function About() {
  return (
    <div>
      <p>This is the about page</p>
    </div>
  );
};

About.getInitialProps = () => {
  console.log("PROPSABOUT");
  return { a: 1 };
};

export default withAuth(About);
