import type { RouteObject } from 'react-router';
import AppLayout from './appLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { Search as GlobalSearch, config } from "./features/search";
import AccountObjectDetail from "./pages/AccountObjectDetailPage";
import Properties from './pages/Properties';
import { useSearchParams } from 'react-router';

function SearchPage() {
	const [searchParams] = useSearchParams();
	const scope = searchParams.get("scope");
	const restrictTo =
		scope === "accounts" || scope === "contacts"
			? { kind: "sobject" as const, key: scope }
			: undefined;

	return (
		<GlobalSearch
			config={config}
			restrictTo={restrictTo}
			searchPlaceholder={`Search ${scope ?? "everything"}...`}
			title="Search"
		/>
	);
}

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: { showInNavigation: true, label: "Home" }
      },
      {
        path: "accounts/:recordId",
        element: <AccountObjectDetail />
      },
      {
        path: "properties",
        element: <Properties />,
        handle: {
          showInNavigation: true,
          label: "Properties",
        },
      },
      {
        path: '*',
        element: <NotFound />
      },
    ]
  }
];
