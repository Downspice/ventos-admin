import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { getAccessToken } from "./auth-storage";

export function resolveApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");

  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://ventos-backend.vercel.app";
  }

  return "http://127.0.0.1:4000";
}

export const apiUrl = resolveApiUrl();

const httpLink = new HttpLink({ uri: `${apiUrl}/graphql` });

const authLink = new ApolloLink((operation, forward) => {
  const token = getAccessToken();
  operation.setContext(({ headers = {} }) => ({
    headers: { ...headers, authorization: token ? `Bearer ${token}` : "" },
  }));
  return forward(operation);
});

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

export const MY_ACCESS = gql`
  query MyAccess {
    myAccess {
      permissions
    }
    me {
      id
      email
      name
      avatarUrl
    }
    business {
      id
      name
      currency
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export const ROLES = gql`
  query Roles {
    roles {
      id
      name
      permissions
      isSystem
    }
  }
`;

export const EMPLOYEES = gql`
  query Employees {
    employees {
      id
      firstName
      lastName
      email
      phone
      roleIds
      isActive
      avatarUrl
    }
  }
`;

export const AUDIT = gql`
  query Audit {
    auditLogs(limit: 100) {
      id
      action
      entityType
      entityId
      ipAddress
      metadata
      createdAt
    }
  }
`;
