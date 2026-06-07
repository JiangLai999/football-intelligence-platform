import { DemoFixtureAdapter, type FixtureAdapter } from "@/lib/server/connectors/fixtures-adapter";
import { DemoOddsAdapter, type OddsAdapter } from "@/lib/server/connectors/odds-adapter";

export type ProviderDescriptor = {
  key: string;
  category: "fixtures" | "odds";
  provider: FixtureAdapter | OddsAdapter;
  status: "demo" | "planned" | "disabled";
};

const registry: ProviderDescriptor[] = [
  {
    key: "demo-fixtures",
    category: "fixtures",
    provider: new DemoFixtureAdapter(),
    status: "demo"
  },
  {
    key: "demo-odds",
    category: "odds",
    provider: new DemoOddsAdapter(),
    status: "demo"
  }
];

export function getProviders() {
  return registry;
}

export function getProvidersByCategory(category: ProviderDescriptor["category"]) {
  return registry.filter((item) => item.category === category);
}
