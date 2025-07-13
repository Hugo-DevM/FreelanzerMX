import { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

const estados = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];

interface EstadoComboboxProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function EstadoCombobox({
  value,
  onChange,
  label,
}: EstadoComboboxProps) {
  const [query, setQuery] = useState("");

  const filteredEstados =
    query === ""
      ? estados
      : estados.filter((estado) =>
          estado.toLowerCase().includes(query.toLowerCase())
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
            displayValue={(estado: string) => estado}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Selecciona o escribe un estado"
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
              {filteredEstados.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  No se encontró ningún estado.
                </div>
              ) : (
                filteredEstados.map((estado) => (
                  <Combobox.Option
                    key={estado}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active
                          ? "bg-[#9ae600]/20 text-[#0E0E2C]"
                          : "text-gray-900"
                      }`
                    }
                    value={estado}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {estado}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-[#9ae600]" : "text-[#9ae600]"
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
