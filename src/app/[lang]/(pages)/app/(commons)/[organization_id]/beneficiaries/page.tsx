import { Input } from "@/components/ui/input";
import { ReactNode } from "react";
import { MdSearch } from "react-icons/md";
import { BeneficiaryList } from "./_components/list.layout";
import { Toolbar } from "./_components/toolbar.layout";

export default function Page(): ReactNode {
    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-end gap-4 justify-between">
                <div className="flex items-center gap-3">
                    <MdSearch className="text-slate-400 text-2xl" />
                    <Input type="text" placeholder="Search" className="w-[300px]" />
                </div>
                <Toolbar />
            </div>
            <BeneficiaryList />
        </div>
    );
}
