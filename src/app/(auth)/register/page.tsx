import { FormRegister } from "@/components/Register/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at 65% 35%, #ffffff 0%, #eff6ff 50%, #bfdbfe 100%)",
      }}
    >
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="font-bold text-blue-500 text-lg tracking-tight">
          Ar-IF
        </span>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          Já tem uma conta?
          <Button variant="outline" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-bold leading-tight">
              Crie sua <br />
              <span className="text-blue-500">conta agora.</span>
            </CardTitle>
            <CardDescription>
              Cadastre-se para gerenciar a climatização do seu campus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormRegister />
          </CardContent>
        </Card>
      </main>

      <div className="flex justify-center gap-2 pb-8">
        <div className="w-2 h-2 rounded-full bg-blue-200" />
        <div className="w-2 h-2 rounded-full bg-blue-300" />
        <div className="w-2 h-2 rounded-full bg-blue-200" />
      </div>
    </div>
  );
}
