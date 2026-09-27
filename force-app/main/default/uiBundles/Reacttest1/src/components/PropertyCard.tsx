// src/components/PropertyCard.tsx
type PropertyCardProps = {
  name: string;
  city: string;
  rent: number;
};

export function PropertyCard({ name, city, rent }: PropertyCardProps) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-sm text-gray-500">{city}</p>
      <p className="mt-2 font-medium">${rent.toLocaleString()}/mo</p>
    </div>
  );
}