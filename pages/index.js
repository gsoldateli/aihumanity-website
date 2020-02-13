import styled from "styled-components";
import Link from "next/link";

const Title = styled.h1`
  color: red;
`;

export default function Index() {
  return (
    <div>
      <Title>Hello Next.jszzz {process.env.BACKEND_API_URI}</Title>
      <Link href="/about">
        <h1>GO TO ADMIN PAGE</h1>
      </Link>
    </div>
  );
}
