import React from "react";
import { FaFacebookF, FaGoogle, FaTwitter, FaGithub } from 'react-icons/fa';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { LanguageContext } from "@/App";
import { LoginForm } from "@/components/login-form";
import { useContext } from "react";
import { Link } from "wouter";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function Login() {
  const { t } = useContext(LanguageContext);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t.login.title}</h1>
        <LanguageSwitcher />
      </div>

      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>{t.login.formTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center">
            <p>{t.login.noAccount}{' '}
              <Link href="/register">
                <a className="text-primary hover:underline">
                  {t.login.registerNow}
                </a>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}