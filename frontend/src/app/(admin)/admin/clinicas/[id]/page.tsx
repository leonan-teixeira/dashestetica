'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getClinica, updateClinica } from '@/lib/adminApi';
import type { Clinica } from '@/types/api';

export default function EditarClinicaPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinica, setClinica] = useState<Clinica | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    nome: '',
    email_contato: '',
    telefone: '',
    cnpj: '',
    plano: 'basico',
    assinatura_inicio: '',
    assinatura_fim: '',
    ativo: true,
  });

  useEffect(() => {
    getClinica(id)
      .then((c) => {
        setClinica(c);
        setForm({
          nome: c.nome,
          email_contato: c.email_contato ?? '',
          telefone: c.telefone ?? '',
          cnpj: c.cnpj ?? '',
          plano: c.plano,
          assinatura_inicio: c.assinatura_inicio ?? '',
          assinatura_fim: c.assinatura_fim ?? '',
          ativo: c.ativo,
        });
      })
      .catch(() => router.replace('/admin/clinicas'))
      .finally(() => setLoading(false));
  }, [id, router]);

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      await updateClinica(id, {
        ...form,
        telefone: form.telefone || undefined,
        cnpj: form.cnpj || undefined,
        assinatura_inicio: form.assinatura_inicio || undefined,
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
        setErrors({ geral: e.response?.data?.message ?? 'Erro ao salvar.' });
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500 text-sm">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-sm font-bold">A</div>
        <Link href="/admin/clinicas" className="text-sm text-gray-500 hover:text-gray-700">← Clínicas</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">{clinica?.nome}</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Dados da clínica</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['nome', 'email_contato', 'telefone', 'cnpj'] as const).map((name) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {name === 'email_contato' ? 'E-mail' : name === 'cnpj' ? 'CNPJ' : name.replace('_', ' ')}
                  </label>
                  <input
                    type={name === 'email_contato' ? 'email' : 'text'}
                    value={form[name]}
                    onChange={(e) => set(name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name]}</p>}
                </div>
              ))}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                <input
                  type="date"
                  value={form.assinatura_inicio}
                  onChange={(e) => set('assinatura_inicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expira em</label>
                <input
                  type="date"
                  value={form.assinatura_fim}
                  onChange={(e) => set('assinatura_fim', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">Vazio = sem limite.</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Status</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => set('ativo', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600"
              />
              <span className="text-sm text-gray-700">Clínica ativa</span>
            </label>
          </section>

          {clinica?.usuario && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Usuário da clínica</h2>
              <p className="text-sm text-gray-700">{clinica.usuario.name}</p>
              <p className="text-xs text-gray-500">{clinica.usuario.email}</p>
            </section>
          )}

          {errors.geral && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{errors.geral}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-gradient text-white text-sm font-medium rounded-lg disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
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
