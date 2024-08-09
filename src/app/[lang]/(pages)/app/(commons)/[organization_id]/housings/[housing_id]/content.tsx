"use client";

import { useDictionary } from "@/app/context/dictionaryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { getHousingById } from "@/repository/housing.repository";
import { HousingSchema } from "@/types/housing.types";
import { formatDate } from "@/utils/formatDate";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { FaBoxesPacking, FaHouseChimneyUser } from "react-icons/fa6";
import { MdError, MdSearch, MdSpaceDashboard } from "react-icons/md";

import { BeneficiaryList } from "./_beneficiaries/list.layout";
import { SpaceList } from "./_spaces/list.layout";
import { Toolbar } from "./toolbar.layout";

const Content = ({ housingId }: { housingId: string }): ReactNode => {
    const pathname = usePathname();
    const dict = useDictionary();
    const locale = pathname.split("/")[1] as "en" | "pt" | "es";

    const [data, setData] = useState<HousingSchema | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);

        (async () => {
            try {
                if (housingId) {
                    const response = await getHousingById(housingId);
                    setData(response.data);
                } else {
                    throw new Error();
                }
            } catch {
                setError(true);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (isLoading)
        return (
            <h2 className="p-4 text-relif-orange-400 font-medium text-sm">
                {dict.housingOverview.loading}
            </h2>
        );

    if (!isLoading && error)
        return (
            <span className="text-sm text-red-600 font-medium flex items-center gap-1 p-4">
                <MdError />
                {dict.housingOverview.error}
            </span>
        );

    if (data) {
        return (
            <div className="p-2 w-full h-max flex flex-col gap-2">
                <div className="w-full h-max p-4 rounded-lg border border-dashed border-relif-orange-200">
                    <div className="flex flex-col w-full">
                        <Toolbar housing={data} />
                        <h1 className="text-slate-900 font-bold text-2xl mt-6 pb-6 flex items-center gap-4">
                            <FaHouseChimneyUser />
                            {data?.name}
                        </h1>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <FaMapMarkerAlt />
                            {`${data?.address.address_line_1}, ${data?.address.address_line_2} - ${data?.address.city}, ${data?.address.district} | ${data?.address.zip_code} - ${data?.address.country}`}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            {dict.housingOverview.createdAt}{" "}
                            {formatDate(data?.created_at, locale || "en")}
                        </span>
                    </div>
                </div>

                <div className="w-full grid grid-cols-3 gap-2 lg:flex lg:flex-col">
                    <div className="flex flex-col gap-2">
                        <div className="w-ful h-max p-4 rounded-lg bg-relif-orange-500 flex justify-between">
                            <div className="flex flex-col w-full">
                                <h2 className="text-white font-bold text-base">
                                    {dict.housingOverview.overviewTitle}
                                </h2>
                                <div className="mt-2 pt-2 border-t-[1px] border-relif-orange-400 w-full flex flex-col gap-1">
                                    <span className="text-white text-sm flex items-center gap-2">
                                        <FaUsers /> {data.occupied_vacancies}{" "}
                                        {dict.housingOverview.beneficiaries},{" "}
                                        {data.total_vacancies - data.occupied_vacancies}{" "}
                                        {dict.housingOverview.bedsAvailable}
                                    </span>
                                    <span className="text-white text-sm flex items-center gap-2">
                                        <MdSpaceDashboard /> {data.occupied_vacancies}{" "}
                                        {dict.housingOverview.of} {data.total_vacancies}{" "}
                                        {dict.housingOverview.spacesOccupied}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <SpaceList housingId={housingId} />
                    </div>

                    <BeneficiaryList housingId={housingId} />

                    <div className="flex flex-col gap-2 w-full h-max grow border border-slate-200 rounded-lg p-2">
                        <div className="w-full flex flex-wrap items-center gap-2 justify-between">
                            <h3 className="text-relif-orange-200 font-bold flex items-center gap-2">
                                <FaBoxesPacking />
                                {dict.housingOverview.inventoryTitle}
                            </h3>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                {dict.housingOverview.btnManage}
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <MdSearch className="text-slate-400 text-2xl" />
                            <Input
                                type="text"
                                placeholder={dict.housingOverview.searchInventoryPlaceholder}
                                className="w-full h-8"
                            />
                        </div>
                        <div className="w-full h-[calc(100vh-459px)] border border-slate-200 rounded-md overflow-hidden">
                            <div className="w-full h-full overflow-x-hidden overflow-y-scroll">
                                {/* <InventoryCard /> */}
                            </div>
                        </div>
                        <div className="w-full h-max border-t-[1px] border-slate-200 p-2">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href="#" />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink href="#">1</PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext href="#" />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <div />;
};

export { Content };
