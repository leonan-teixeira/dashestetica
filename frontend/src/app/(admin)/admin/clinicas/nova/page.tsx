'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClinica } from '@/lib/adminApi';

export default function NovaClinicaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    nome: '',
    email_contato: '',
    telefone: '',
    cnpj: '',
    plano: 'basico',
    assinatura_inicio: new Date().toISOString().split('T')[0],
    assinatura_fim: '',
    usuario_nome: '',
    usuario_senha: '',
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await createClinica({
        ...form,
        telefone: form.telefone || undefined,
        cnpj: form.cnpj || undefined,
        assinatura_fim: form.assinatura_fim || undefined,
      });
      router.replace('/admin/clinicas');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      if (e.response?.data?.errors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(e.response.data.errors)) {
          flat[k] = v[0];
        }
        setErrors(flat);
      } else {
        setErrors({ geral: e.response?.data?.message ?? 'Erro ao criar clínica.' });
      }
    } finally {
      setLoading(false);
    }
  }

  function field(label: string, name: string, type = 'text', required = false) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          value={(form as Record<string, string>)[name]}
          onChange={(e) => set(name, e.target.value)}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-sm font-bold">A</div>
        <Link href="/admin/clinicas" className="text-sm text-gray-500 hover:text-gray-700">← Clínicas</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">Nova clínica</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Dados da clínica</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field('Nome', 'nome', 'text', true)}
              {field('E-mail / login', 'email_contato', 'email', true)}
              {field('Telefone', 'telefone')}
              {field('CNPJ', 'cnpj')}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Assinatura</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
                <select
                  value={form.plano}
                  onChange={(e) => set('plano', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="basico">Básico</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              {field('Início', 'assinatura_inicio', 'date', true)}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expira em</label>
                <input
                  type="date"
                  value={form.assinatura_fim}
                  onChange={(e) => set('assinatura_fim', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Sem limite"
                />
                <p className="text-xs text-gray-400 mt-1">Deixe vazio para sem limite.</p>
                {errors.assinatura_fim && <p className="text-xs text-red-600 mt-1">{errors.assinatura_fim}</p>}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Usuário administrador da clínica</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field('Nome do usuário', 'usuario_nome', 'text', true)}
              {field('Senha', 'usuario_senha', 'password', true)}
            </div>
            <p className="text-xs text-gray-400 mt-3">O login será feito com o e-mail da clínica e esta senha.</p>
          </section>

          {errors.geral && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{errors.geral}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-gradient text-white text-sm font-medium rounded-lg disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar clínica'}
            </button>
            <Link
              href="/admin/clinicas"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
