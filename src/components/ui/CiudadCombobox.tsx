import { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

const ciudades = [
  "Ciudad de México",
  "Guadalajara",
  "Monterrey",
  "Puebla",
  "Toluca",
  "Tijuana",
  "León",
  "Juárez",
  "Torreón",
  "Querétaro",
  "Mérida",
  "San Luis Potosí",
  "Aguascalientes",
  "Cancún",
  "Culiacán",
  "Acapulco",
  "Puerto Vallarta",
  "Morelia",
  "Saltillo",
  "Chihuahua",
  "Hermosillo",
  "Veracruz",
  "Villahermosa",
  "Mazatlán",
  "Ensenada",
  "Colima",
  "La Paz",
  "Campeche",
  "Cuernavaca",
  "Tepic",
  "Oaxaca",
];

interface CiudadComboboxProps {
  value: string;
  onChange: (value: string | null) => void
  label?: string;
}

export default function CiudadCombobox({
  value,
  onChange,
  label,
}: CiudadComboboxProps) {
  const [query, setQuery] = useState("");

  const filteredCiudades =
    query === ""
      ? ciudades
      : ciudades.filter((ciudad) =>
        ciudad.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#0E0E2C] mb-1">
          {label}
        </label>
      )}
      <Combobox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <Combobox.Input
            className="w-full px-4 py-4 border rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-[#0E0E2C] placeholder-[#6B7280] border-[#E5E7EB] focus:border-[#9ae600] focus:ring-[#9ae600]"
            displayValue={(ciudad: string) => ciudad}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Selecciona o escribe una ciudad"
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {filteredCiudades.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  No se encontró ninguna ciudad.
                </div>
              ) : (
                filteredCiudades.map((ciudad) => (
                  <Combobox.Option
                    key={ciudad}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active
                        ? "bg-[#9ae600]/20 text-[#0E0E2C]"
                        : "text-gray-900"
                      }`
                    }
                    value={ciudad}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? "font-medium" : "font-normal"
                            }`}
                        >
                          {ciudad}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-[#9ae600]" : "text-[#9ae600]"
                              }`}
                          >
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}
