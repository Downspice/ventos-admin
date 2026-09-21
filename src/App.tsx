import { ApolloProvider } from "@apollo/client/react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { client } from "./lib/apollo";
import { captureTokensFromUrl, getAccessToken } from "./lib/auth-storage";
import { AdminShell } from "./components/AdminShell";
import { RequireAccess } from "./components/RequireAccess";
import LoginPage from "./pages/LoginPage";
import OverviewPage from "./pages/OverviewPage";
import EmployeesPage from "./pages/EmployeesPage";
import RolesPage from "./pages/RolesPage";
import AuditPage from "./pages/AuditPage";
import ReportsPage from "./pages/ReportsPage";
import ImportExportPage from "./pages/ImportExportPage";
import SettingsPage from "./pages/SettingsPage";
import FraudPage from "./pages/FraudPage";
import FinancePage from "./pages/FinancePage";
import LoyaltyPage from "./pages/LoyaltyPage";
import CommissionsPage from "./pages/CommissionsPage";
import MediaPage from "./pages/MediaPage";
import RegistersPage from "./pages/RegistersPage";
import SalesPage from "./pages/SalesPage";

captureTokensFromUrl();

function Protected({ children }: { children: React.ReactNode }) {
  if (!getAccessToken()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <Protected>
                <AdminShell />
              </Protected>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route
              path="employees"
              element={
                <RequireAccess permission="employees.read">
                  <EmployeesPage />
                </RequireAccess>
              }
            />
            <Route
              path="roles"
              element={
                <RequireAccess permission="roles.read">
                  <RolesPage />
                </RequireAccess>
              }
            />
            <Route
              path="audit"
              element={
                <RequireAccess permission="audit.read">
                  <AuditPage />
                </RequireAccess>
              }
            />
            <Route
              path="fraud"
              element={
                <RequireAccess permission="audit.read">
                  <FraudPage />
                </RequireAccess>
              }
            />
            <Route
              path="reports"
              element={
                <RequireAccess permission="reports.sales.read">
                  <ReportsPage />
                </RequireAccess>
              }
            />
            <Route
              path="sales"
              element={
                <RequireAccess permission="sales.read">
                  <SalesPage />
                </RequireAccess>
              }
            />
            <Route
              path="registers"
              element={
                <RequireAccess permission="sales.read">
                  <RegistersPage />
                </RequireAccess>
              }
            />
            <Route
              path="finance"
              element={
                <RequireAccess permission="reports.financial.read">
                  <FinancePage />
                </RequireAccess>
              }
            />
            <Route path="loyalty" element={<LoyaltyPage />} />
            <Route
              path="commissions"
              element={
                <RequireAccess permission="employees.read">
                  <CommissionsPage />
                </RequireAccess>
              }
            />
            <Route
              path="settings"
              element={
                <RequireAccess permission="settings.read">
                  <SettingsPage />
                </RequireAccess>
              }
            />
            <Route
              path="import-export"
              element={
                <RequireAccess permission="import.export">
                  <ImportExportPage />
                </RequireAccess>
              }
            />
            <Route
              path="media"
              element={
                <RequireAccess permission="media.read">
                  <MediaPage />
                </RequireAccess>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}
