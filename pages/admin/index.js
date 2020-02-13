import Head from "next/head";
import withAuth from "../../components/Admin/withAuth";
import AdminLayout from "../../components/Admin/Layout";
const Admin = props => {
  return (
    <AdminLayout>
      <div>
        <Head>
          <title>Admin Home</title>
        </Head>
        <h1>HOME</h1>
      </div>
    </AdminLayout>
  );
};
export default withAuth(Admin);
