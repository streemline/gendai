
import { RegisterForm } from "@/components/register-form";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function Register() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Work Time Tracking</h1>
          <p className="text-sm text-gray-600">GENDAI s.r.o.</p>
        </div>
        <LanguageSwitcher />
      </div>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Create an account</h2>
        <RegisterForm />
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login">
              <a className="text-blue-600 hover:underline">Log in</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
