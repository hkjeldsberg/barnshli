import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage(): React.JSX.Element {
  return <LoginForm />;
}
