"use client";

import { useDictionary } from "@/app/context/dictionaryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getMe, signIn } from "@/repository/auth.repository";
import { saveToLocalStorage } from "@/utils/localStorage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

const SignInForm = (): ReactNode => {
    const { toast } = useToast();
    const router = useRouter();
    const dict = useDictionary();

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: any): Promise<void> => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData: FormData = new FormData(e.target);

            // @ts-ignore
            const data: {
                email: string;
                password: string;
            } = Object.fromEntries(formData);

            const { user } = await signIn(data.email, data.password);
            const responseData = await getMe();
            saveToLocalStorage("r_ud", responseData.data);

            const LANGUAGES = {
                english: "en",
                portuguese: "pt",
                spanish: "es",
            };

            if (responseData.data.platform_role === "RELIF_MEMBER") {
                router.push(
                    `/${LANGUAGES[responseData.data.preferences.language as keyof typeof LANGUAGES] || "en"}/app/admin/organizations`
                );
                return;
            }

            if (!responseData.data.organization_id) {
                router.push(
                    `/${LANGUAGES[responseData.data.preferences.language as keyof typeof LANGUAGES] || "en"}/app/entry`
                );
                return;
            }

            router.push(
                `/${LANGUAGES[responseData.data.preferences.language as keyof typeof LANGUAGES] || "en"}/app/${responseData.data.organization_id}`
            );
        } catch (err) {
            console.log(err);
            setIsLoading(false);
            toast({
                title: dict.root.toastErrorTitle,
                description: dict.root.toastErrorDescription,
                variant: "destructive",
            });
        }
    };

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div>
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="email">{dict.root.email}</Label>
                        <Input id="email" name="email" type="email" required />
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">{dict.root.password}</Label>
                            <Button variant="link" className="p-0 h-max no-underline" asChild>
                                <Link href="/forgot-password">{dict.root.forgotPassword}</Link>
                            </Button>
                        </div>
                        <Input id="password" name="password" type="password" required />
                    </div>
                </div>

                <div className="w-full flex flex-col items-center">
                    <Button
                        type="submit"
                        variant="default"
                        className="mt-[43px] w-full"
                        disabled={isLoading}
                    >
                        {!isLoading ? dict.root.btnSignIn : dict.root.loading}
                    </Button>
                    <span className="text-sm text-slate-900">
                        {dict.root.needAnAccount}
                        <Button variant="link" asChild>
                            <Link href="/signup">{dict.root.signUpHere}</Link>
                        </Button>
                    </span>
                </div>
            </div>
            {/* <div className="w-full relative flex justify-center mb-[17px]">
                <span className="w-full border-b-[1px] border-slate-200 absolute top-[10px]" />
                <span className="w-max text-sm text-slate-900 flex justify-center px-[10px] bg-white z-10">
                    or
                </span>
            </div>
            <Button variant="outline" className="w-full flex items-center gap-3">
                <FcGoogle size={18} />
                Sign in with Google
            </Button> */}
        </form>
    );
};

export { SignInForm };
