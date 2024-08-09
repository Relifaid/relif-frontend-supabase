"use client";

import { useDictionary } from "@/app/context/dictionaryContext";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { findAllOrganizations } from "@/repository/organization.repository";
import { OrganizationSchema } from "@/types/organization.types";
import { UserSchema } from "@/types/user.types";
import { getFromLocalStorage } from "@/utils/localStorage";
import { ReactNode, useEffect, useState } from "react";
import { MdError } from "react-icons/md";

import { Card } from "./card.layout";

const OrganizationsList = (): ReactNode => {
    const dict = useDictionary();

    const [organizations, setOrganizations] = useState<{
        count: number;
        data: OrganizationSchema[];
    } | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const LIMIT = 40;

    const getOrganizationList = async () => {
        try {
            const currentUser: UserSchema = await getFromLocalStorage("r_ud");

            if (currentUser.organization_id) {
                const response = await findAllOrganizations(offset, LIMIT);
                setOrganizations(response.data);
            } else {
                throw new Error();
            }
        } catch {
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        getOrganizationList();
    }, [offset]);

    const totalPages = organizations ? Math.ceil(organizations.count / LIMIT) : 0;
    const currentPage = offset / LIMIT + 1;

    const handlePageChange = (newPage: number) => {
        setOffset((newPage - 1) * LIMIT);
    };

    return (
        <div className="h-[calc(100vh-172px)] w-full rounded-lg border-[1px] border-slate-200 flex flex-col justify-between overflow-hidden">
            {isLoading && (
                <h2 className="p-4 text-relif-orange-400 font-medium text-sm">
                    {dict.admin.organizations.list.loading}
                </h2>
            )}

            {!isLoading && error && (
                <span className="text-sm text-red-600 font-medium flex items-center gap-1 p-4">
                    <MdError />
                    {dict.admin.organizations.list.error}
                </span>
            )}

            {!isLoading && !error && organizations && organizations.data.length <= 0 && (
                <span className="text-sm text-slate-900 font-medium p-4">
                    {dict.admin.organizations.list.noHousingsFound}
                </span>
            )}

            {!isLoading && !error && organizations && organizations.data.length > 0 && (
                <>
                    <ul className="w-full h-full flex flex-col gap-[1px] overflow-y-scroll overflow-x-hidden">
                        {organizations?.data.map(organization => (
                            <Card
                                key={organization.id}
                                {...organization}
                                refreshList={getOrganizationList}
                            />
                        ))}
                    </ul>
                    <div className="w-full h-max border-t-[1px] border-slate-200 p-2">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        // disabled={currentPage === 1}
                                    />
                                </PaginationItem>
                                {Array.from({ length: totalPages }).map((_, index) => (
                                    <PaginationItem key={index}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(index + 1)}
                                            isActive={index + 1 === currentPage}
                                        >
                                            {index + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        // disabled={currentPage === totalPages}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </>
            )}
        </div>
    );
};

export { OrganizationsList };
