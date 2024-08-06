"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpdateOrganizationTypeRequestSchema } from "@/types/requests.types";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { MdCheck, MdClose, MdMail, MdPhone } from "react-icons/md";
import { SlOptions } from "react-icons/sl";
import { AcceptModal } from "./accept.modal";
import { RejectModal } from "./reject.modal";

type Props = UpdateOrganizationTypeRequestSchema & {
    refreshList: () => void;
};

const Card = ({ refreshList, ...data }: Props): ReactNode => {
    const pathname = usePathname();
    const locale = pathname.split("/")[1] as "en" | "pt" | "es";

    const [acceptDialogOpenState, setAcceptDialogOpenState] = useState(false);
    const [rejectDialogOpenState, setRejectDialogOpenState] = useState(false);
    const [countryCode, phone] = data?.creator.phones[0].split("_");

    const statusColor =
        data.status === "ACCEPTED"
            ? "bg-green-500 text-white hover:bg-green-600"
            : data.status === "REJECTED"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-yellow-400 text-slate-900 hover:bg-yellow-600";

    return (
        <>
            <li className="w-full h-max p-4 border-b-[1px] border-slate-200 flex justify-between cursor-pointer hover:bg-slate-50/70">
                <div className="flex flex-col">
                    <span className="text-sm text-slate-900 font-bold">
                        {data?.organization.name}
                    </span>
                    <span className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <FaUser />
                        {data?.creator.first_name} {data.creator.last_name}
                    </span>
                    <span className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <MdMail />
                        {data?.creator.email}
                    </span>
                    <span className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <MdPhone />
                        {`${countryCode} ${phone}`}
                    </span>
                    <span className="mt-3">
                        <Badge className={statusColor}>{data.status}</Badge>
                    </span>
                </div>
                <div className="flex flex-col items-end justify-between">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="icon" className="w-7 h-7 p-0">
                                <SlOptions className="text-sm" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <Link href={`/app/admin/organizations/${data?.organization_id}`}>
                                    View organization
                                </Link>
                            </DropdownMenuItem>
                            {data.status !== "ACCEPTED" && data.status !== "REJECTED" && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setAcceptDialogOpenState(true)}
                                    >
                                        <span className="flex items-center gap-2">
                                            <MdCheck className="text-xs" />
                                            Accept request
                                        </span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setRejectDialogOpenState(true)}
                                    >
                                        <span className="flex items-center gap-2">
                                            <MdClose className="text-xs" />
                                            Reject request
                                        </span>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            Requested at {formatDate(data?.created_at, locale || "en")}
                        </span>
                    </div>
                </div>
            </li>

            <AcceptModal
                refreshList={refreshList}
                request={data}
                acceptDialogOpenState={acceptDialogOpenState}
                setAcceptDialogOpenState={setAcceptDialogOpenState}
            />

            <RejectModal
                refreshList={refreshList}
                request={data}
                rejectDialogOpenState={rejectDialogOpenState}
                setRejectDialogOpenState={setRejectDialogOpenState}
            />
        </>
    );
};

export { Card };
