// src/pages/Properties.tsx
import { PropertyCard } from "../components/PropertyCard";

export default function Properties() {
  return (
    <div className="grid gap-4 p-6 md:grid-cols-3">
      <PropertyCard name="Sunset Villa" city="Pune" rent={1800} />
    </div>
  );
}