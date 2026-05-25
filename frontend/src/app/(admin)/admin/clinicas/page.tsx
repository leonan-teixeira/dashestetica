'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listClinicas, desativarClinica, reativarClinica } from '@/lib/adminApi';
import { logout } from '@/lib/auth';
import type { Clinica } from '@/types/api';

export default function AdminClinicasPage() {
  const router = useRouter();
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listClinicas({ search: search || undefined, page });
      setClinicas(res.data);
      setTotal(res.meta.total);
      setLastPage(res.meta.last_page);
    } catch {
      // Unauthorized — clear cookies and redirect
      document.cookie = 'app_authed=; path=/; max-age=0';
      document.cookie = 'app_admin=; path=/; max-age=0';
      router.replace('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [search, page, router]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(clinica: Clinica) {
    setActionLoading(clinica.id);
    try {
      if (clinica.ativo) {
        await desativarClinica(clinica.id);
      } else {
        await reativarClinica(clinica.id);
      }
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/admin/login');
  }

  function statusBadge(c: Clinica) {
    if (!c.ativo) return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">Inativa</span>;
    if (!c.assinatura_ativa) return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Expirada</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Ativa</span>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-sm font-bold">A</div>
          <h1 className="text-lg font-semibold text-gray-900">Painel Admin</h1>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
          Sair
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Clínicas</h2>
            <p className="text-sm text-gray-500 mt-0.5">{total} clínica{total !== 1 ? 's' : ''} cadastrada{total !== 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/admin/clinicas/nova"
            className="px-4 py-2 bg-brand-gradient text-white text-sm font-medium rounded-lg"
          >
            + Nova clínica
          </Link>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Carregando...</div>
          ) : clinicas.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">Nenhuma clínica encontrada.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Clínica</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Usuário</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Plano</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Assinatura até</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clinicas.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.nome}</div>
                      <div className="text-xs text-gray-500">{c.email_contato}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.usuario?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-gray-700">{c.plano}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.assinatura_fim
                        ? new Date(c.assinatura_fim + 'T00:00:00').toLocaleDateString('pt-BR')
                        : '∞ Sem limite'}
                    </td>
                    <td className="px-4 py-3">{statusBadge(c)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/clinicas/${c.id}`}
                          className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleToggle(c)}
                          disabled={actionLoading === c.id}
                          className={`px-3 py-1 text-xs rounded-lg disabled:opacity-50 ${
                            c.ativo
                              ? 'border border-red-200 text-red-600 hover:bg-red-50'
                              : 'border border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {actionLoading === c.id ? '...' : c.ativo ? 'Desativar' : 'Reativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {lastPage > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">{page} / {lastPage}</span>
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
