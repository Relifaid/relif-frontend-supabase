"use client";

import { useDictionary } from "@/app/context/dictionaryContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { signUp } from "@/repository/auth.repository";
import { getTimezone } from "@/utils/getTimezone";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Creatable from "react-select/creatable";
import { ActionMeta, OnChangeValue } from "react-select";
import { roles } from "@/utils/roles";
import { cn } from "@/lib/utils";

interface RoleOption {
    value: string;
    label: string;
}

const Form = (): ReactNode => {
    const { toast } = useToast();
    const dict = useDictionary();
    const router = useRouter();
    const params = useParams();

    const [checkState, setCheckState] = useState<boolean>(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [signupSuccess, setSignupSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>("");

    const lang = params.lang as keyof typeof roles;
    const englishRoles = roles.en;
    const translatedRoles = roles[lang] || roles.en;

    const roleOptions: RoleOption[] = englishRoles.map((role: string, index: number) => ({
        value: role,
        label: translatedRoles[index],
    }));

    const handleSubmit = async (e: any): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData: FormData = new FormData(e.target);

            // @ts-ignore
            const data: {
                firstName: string;
                lastName: string;
                role: string;
                countryCode: string;
                phone: string;
                email: string;
                password: string;
                confirmPassword: string;
            } = Object.fromEntries(formData);

            data.role = selectedRole || data.role;

            if (data.password !== data.confirmPassword) {
                toast({
                    title: dict.signup.toastErrorTitle,
                    description: dict.signup.toastErrorPasswordsDescription,
                    variant: "destructive",
                });
                return;
            }

            const timezone = getTimezone();

            const token = await signUp({
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                password: data.password,
                phones: [phone],
                role: data.role,
                preferences: {
                    language: "english",
                    timezone,
                },
            });

            localStorage.setItem("r_to", token);

            toast({
                title: dict.signup.toastSuccessTitle,
                description: "You can now log in with your new account.",
                variant: "success",
            });
            router.push(`/${params.lang}/app/entry`);
        } catch (err: any) {
            const errorMessage =
                err.message === "signup.emailAlreadyExists"
                    ? dict.signup.emailAlreadyExists
                    : dict.signup.toastErrorGenericDescription;

            toast({
                title: dict.signup.toastErrorTitle,
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="border-b-[1px] border-dashed border-slate-200 pb-2 font-medium text-sm text-relif-orange-200 mb-6">
                {dict.signup.yourPersonalData}
            </h2>
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                    <Label htmlFor="firstName">{dict.signup.firstName} *</Label>
                    <Input id="firstName" name="firstName" type="text" required />
                </div>

                <div className="flex flex-col gap-3">
                    <Label htmlFor="lastName">{dict.signup.lastName} *</Label>
                    <Input id="lastName" name="lastName" type="text" required />
                </div>

                <div className="flex flex-col gap-3">
                    <Label htmlFor="role">{dict.signup.role} *</Label>
                    <Creatable
                        id="role"
                        name="role"
                        options={roleOptions}
                        onChange={(selectedOption: OnChangeValue<RoleOption, false>) =>
                            setSelectedRole(selectedOption?.value || null)
                        }
                        placeholder={dict.signup.rolePlaceholder}
                        isClearable
                        required
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                height: "40px",
                                minHeight: "40px",
                                width: "100%",
                                borderRadius: "0.375rem",
                                borderWidth: "1px",
                                borderColor: state.isFocused ? "#E5855B" : "#e2e8f0",
                                boxShadow: state.isFocused ? "0 0 0 1px #E5855B" : "none",
                                fontSize: "0.8rem",
                                "&:hover": {
                                    borderColor: state.isFocused ? "#E5855B" : "#e2e8f0",
                                },
                            }),
                            input: base => ({
                                ...base,
                                margin: "0",
                                padding: "0",
                                color: "#0f172a",
                                fontSize: "0.8rem",
                            }),
                            valueContainer: base => ({
                                ...base,
                                padding: "0 0.75rem",
                                gap: "0.25rem",
                            }),
                            placeholder: base => ({
                                ...base,
                                color: "#94a3b8",
                                fontSize: "0.8rem",
                            }),
                            singleValue: base => ({
                                ...base,
                                color: "#0f172a",
                                fontSize: "0.8rem",
                            }),
                        }}
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <Label htmlFor="phone">{dict.signup.phone} *</Label>
                    <PhoneInput
                        country={"us"}
                        value={phone}
                        onChange={(value: string) => setPhone(value)}
                        containerClass="w-full"
                        inputStyle={{
                            height: "40px",
                            width: "100%",
                            borderColor: "#e2e8f0",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                        }}
                        buttonStyle={{
                            borderColor: "#e2e8f0",
                            borderRadius: "0.375rem 0 0 0.375rem",
                        }}
                        inputProps={{
                            name: "phone",
                            required: true,
                        }}
                    />
                </div>
            </div>

            <h2 className="border-b-[1px] border-dashed border-slate-200 pb-2 font-medium text-sm text-relif-orange-200 mt-10 mb-6">
                {dict.signup.yourCredentials}
            </h2>
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                    <Label htmlFor="email">{dict.signup.email} *</Label>
                    <Input id="email" name="email" type="email" required />
                </div>

                <div className="flex flex-col gap-3">
                    <Label htmlFor="password">{dict.signup.password} *</Label>
                    <Input id="password" name="password" type="password" required minLength={8} />
                </div>

                <div className="flex flex-col gap-3">
                    <Label htmlFor="confirmPassword">{dict.signup.confirmPassword} *</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                    />
                </div>

                <div className="items-top flex space-x-2">
                    <Checkbox
                        id="terms"
                        onCheckedChange={(checked: boolean) => setCheckState(checked)}
                        checked={checkState}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="terms"
                            className="text-sm text-slate-900 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {dict.signup.checkboxLabel}
                        </label>
                        <p className="text-sm text-slate-600">
                            {dict.signup.checkboxDescription}{" "}
                            <Link
                                href="/terms/terms-of-service"
                                className="underline hover:text-relif-orange-200 underline-offset-4"
                            >
                                {dict.signup.terms}
                            </Link>{" "}
                            {dict.signup.and}{" "}
                            <Link
                                href="/terms/privacy-policy"
                                className="underline hover:text-relif-orange-200 underline-offset-4"
                            >
                                {dict.signup.privacyPolicy}
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col items-center">
                <Button
                    type="submit"
                    variant="default"
                    className="mt-[43px] w-full"
                    disabled={!checkState || loading}
                >
                    {loading ? "Signing Up..." : dict.signup.btnSignUp}
                </Button>
                <span className="text-sm text-gray-900">
                    {dict.signup.alreadyHaveAnAccount}
                    <Button variant="link" asChild>
                        <Link href="/">{dict.signup.login}</Link>
                    </Button>
                </span>
            </div>
        </form>
    );
};

export { Form };
