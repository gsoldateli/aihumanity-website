import withAuth from "../components/Admin/withAuth";
const About = function About() {
  return (
    <div>
      <p>This is the about page</p>
    </div>
  );
};

export default withAuth(About);
