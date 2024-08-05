"use client";

import { HousingSchema } from "@/types/housing.types";
import { formatDate } from "@/utils/formatDate";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";

type Props = HousingSchema;

const HousingCard = (data: Props): ReactNode => {
    const pathname = usePathname();
    const locale = pathname.split("/")[1] as "en" | "pt" | "es";

    return (
        <li className="w-full h-max flex flex-wrap justify-between p-4 border-[1px] border-slate-200 rounded-md cursor-pointer hover:bg-slate-50/70">
            <div className="flex flex-col">
                <span className="text-sm text-slate-900 font-bold">{data.name}</span>
                <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <FaMapMarkerAlt />
                    {`${data?.address.address_line_1}, ${data?.address.address_line_2} - ${data?.address.city}, ${data?.address.district} | ${data?.address.zip_code} - ${data?.address.country}`}
                </span>

                <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    {/* TODO: BACKEND */}
                    <FaPeopleGroup /> -- beneficiaries
                </span>
            </div>
            <div className="flex flex-col items-end justify-between">
                <span className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    Created at {formatDate(data.created_at, locale || "en")}
                </span>
            </div>
        </li>
    );
};

export { HousingCard };
