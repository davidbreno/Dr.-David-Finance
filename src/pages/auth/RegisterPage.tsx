import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const schema = z
  .object({
    name: z.string().min(3, "Informe seu nome completo"),
    email: z.string().email("E-mail invalido"),
    password: z.string().min(6, "Minimo de 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme a senha"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas nao conferem",
  });

type RegisterFormValues = z.infer<typeof schema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.name },
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="w-full max-w-md rounded-[40px] bg-[var(--color-surface)] p-8 shadow-card">
      <div className="mb-6 flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Crie sua conta
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Cadastre-se para comecar a organizar suas financas.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">Nome</label>
          <input
            type="text"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
            placeholder="Seu nome completo"
            {...register("name")}
          />
          {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
        </div>

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
            placeholder="Crie uma senha"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-xs text-red-500">{errors.password.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">
            Confirmar senha
          </label>
          <input
            type="password"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
            placeholder="Repita a senha"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>
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
          <UserPlus className="h-4 w-4" />
          {loading ? "Criando..." : "Cadastrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
        Ja possui conta?{" "}
        <Link to="/auth/login" className="font-semibold text-[var(--color-accent)]">
          Fazer login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
