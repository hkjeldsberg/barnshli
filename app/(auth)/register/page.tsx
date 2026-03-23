import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage(): React.JSX.Element {
  return <RegisterForm />;
}
