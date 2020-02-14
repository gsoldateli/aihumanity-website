import Head from "next/head";
import withAuth from "../../components/Admin/withAuth";
import AdminLayout from "../../components/Admin/Layout";
import Crud from "../../components/Admin/Crud";
const Admin = props => {
  return (
    <AdminLayout>
      <div>
        <Crud />
      </div>
    </AdminLayout>
  );
};
export default withAuth(Admin);
