import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const schema = z.object({
  email: z.string().email("Informe um e-mail valido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof schema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate("/");
  };

  return (
    <div className="w-full max-w-md rounded-[40px] bg-[var(--color-surface)] p-8 shadow-card">
      <div className="mb-6 flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Acesse o Finance David
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Entre com suas credenciais para acessar o painel financeiro.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">E-mail</label>
          <input
            type="email"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
            placeholder="seuemail@empresa.com"
            {...register("email")}
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">Senha</label>
          <input
            type="password"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
            placeholder="Digite sua senha"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-xs text-red-500">{errors.password.message}</span>
          )}
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogIn className="h-4 w-4" />
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
        Ainda nao possui conta?{" "}
        <Link to="/auth/register" className="font-semibold text-[var(--color-accent)]">
          Criar acesso
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
