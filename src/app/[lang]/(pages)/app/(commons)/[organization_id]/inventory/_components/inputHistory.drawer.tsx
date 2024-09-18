"use client";

import { useDictionary } from "@/app/context/dictionaryContext";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getAllocations } from "@/repository/inventory.repository";
import { ProductEntry, ProductSchema } from "@/types/product.types";
import { formatDate } from "@/utils/formatDate";
import { usePathname } from "next/navigation";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { MdError } from "react-icons/md";

type Props = {
    productType: ProductSchema;
    openState: boolean;
    setOpenState: Dispatch<SetStateAction<boolean>>;
};

const InputHistory = ({ productType, openState, setOpenState }: Props): ReactNode => {
    const dict = useDictionary();
    const pathname = usePathname();

    const [data, setData] = useState<ProductEntry[] | []>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    const locale = pathname.split("/")[1] as "en" | "es" | "pt";

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            try {
                if (openState) {
                    const response = await getAllocations(productType.id, 0, 9999);
                    setData(response.data.data);
                }
            } catch (err) {
                setError(true);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [openState]);

    return (
        <Sheet open={openState} onOpenChange={setOpenState}>
            <SheetContent className="py-4 px-4 w-[600px] lg:w-full">
                <SheetHeader>
                    <SheetTitle>
                        {dict.commons.inventory.inputHistory.productEntryHistory}
                    </SheetTitle>
                </SheetHeader>
                <div className="w-full h-max p-4 border border-relif-orange-200 border-dotted rounded-md mt-[10px] flex flex-col gap-1">
                    <h1 className="text-slate-900 text-sm font-bold">{productType.name}</h1>
                    <span className="text-slate-500 text-xs font-medium">{productType.brand}</span>
                </div>
                <div className="w-full h-[calc(100vh-152px)] border mt-[10px] rounded-md overflow-x-hidden overflow-y-scroll p-2">
                    {isLoading && (
                        <h2 className="p-4 text-relif-orange-400 font-medium text-sm">
                            {dict.commons.inventory.list.loading}
                        </h2>
                    )}

                    {!isLoading && error && (
                        <span className="text-sm text-red-600 font-medium flex items-center gap-1 p-4">
                            <MdError />
                            {dict.commons.inventory.list.error}
                        </span>
                    )}

                    {!isLoading && !error && (
                        <>
                            {data?.map(entry => (
                                <div className="w-full h-max p-4 border-b-[1px]">
                                    <div className="flex gap-2 items-center">
                                        {entry?.type === "ENTRANCE" ? (
                                            <span>
                                                <Badge className="text-sm bg-green-600">{`+${entry?.quantity}`}</Badge>
                                            </span>
                                        ) : (
                                            <Badge className="text-sm bg-red-600">{`-${entry?.quantity}`}</Badge>
                                        )}

                                        <span className="text-slate-900 text-sm font-bold">
                                            {formatDate(entry?.created_at, locale || "en")}
                                        </span>
                                    </div>

                                    {entry?.type === "REALLOCATION" ? (
                                        <div className="flex flex-col gap-1 mt-2">
                                            <span className="text-slate-500 text-xs font-medium">
                                                <strong>
                                                    {dict.commons.inventory.inputHistory.to}
                                                </strong>{" "}
                                                {entry?.to.id}
                                            </span>
                                            <span className="text-slate-500 text-xs font-medium">
                                                <strong>
                                                    {dict.commons.inventory.inputHistory.from}
                                                </strong>{" "}
                                                {entry?.from.id}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 text-xs font-medium">
                                            <strong>
                                                {dict.commons.inventory.inputHistory.locale}
                                            </strong>{" "}
                                            {entry?.to.id}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export { InputHistory };
