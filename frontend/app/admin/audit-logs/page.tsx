"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Shield,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";
import { fetchAuditLogs, type AuditLog, type AuditLogMeta } from "@/lib/api";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-green-100 text-green-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
};

const METHOD_OPTIONS = [
  { value: "", label: "All Methods" },
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "PATCH", label: "PATCH" },
  { value: "DELETE", label: "DELETE" },
];

function statusColor(code: number | null): string {
  if (!code) return "text-gray-500";
  if (code < 300) return "text-green-600 font-semibold";
  if (code < 400) return "text-blue-600 font-semibold";
  if (code < 500) return "text-yellow-600 font-semibold";
  return "text-red-600 font-semibold";
}

function parseUA(ua: string | null): string {
  if (!ua) return "-";
  if (/mobile/i.test(ua)) return "📱 Mobile";
  if (/tablet/i.test(ua)) return "📋 Tablet";
  if (/curl|postman|axios|python|go-http/i.test(ua)) return "⚙️ API Client";
  return "🖥️ Desktop";
}

function DetailModal({
  log,
  onClose,
}: {
  log: AuditLog;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Log Detail #{log.id}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Timestamp</p>
              <p className="font-medium">{new Date(log.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Method</p>
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${METHOD_COLORS[log.method] || "bg-gray-100 text-gray-700"}`}>
                {log.method}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span className={statusColor(log.status_code)}>{log.status_code ?? "-"}</span>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs text-gray-500 mb-1">Path</p>
              <p className="font-mono text-xs break-all bg-gray-50 rounded p-2">{log.path}</p>
            </div>
            {log.frontend_url && (
              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs text-gray-500 mb-1">Frontend URL</p>
                <p className="font-mono text-xs break-all bg-gray-50 rounded p-2">{log.frontend_url}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1">IP</p>
              <p className="font-mono text-xs">{log.ip ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Device</p>
              <p>{parseUA(log.user_agent)}</p>
            </div>
          </div>

          {/* User */}
          <div className="rounded-lg border p-4 bg-indigo-50">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">User</p>
            {log.user_name || log.user_email ? (
              <div className="space-y-1">
                {log.user_name && <p><span className="text-gray-500">Name:</span> {log.user_name}</p>}
                {log.user_email && <p><span className="text-gray-500">Email:</span> {log.user_email}</p>}
                {log.user_id && <p className="font-mono text-xs text-gray-400">{log.user_id}</p>}
              </div>
            ) : (
              <p className="text-gray-500 italic">Anonymous / Unauthenticated</p>
            )}
          </div>

          {/* User Agent */}
          {log.user_agent && (
            <div>
              <p className="text-xs text-gray-500 mb-1">User Agent</p>
              <p className="text-xs text-gray-600 break-all bg-gray-50 rounded p-2">{log.user_agent}</p>
            </div>
          )}

          {/* Request Body */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Request Body</p>
            {log.req_body ? (
              <pre className="text-xs bg-gray-900 text-green-300 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(log.req_body, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-400 text-xs italic">Empty</p>
            )}
          </div>

          {/* Response Body */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Response Body</p>
            {log.res_body ? (
              <pre className="text-xs bg-gray-900 text-blue-300 rounded-lg p-4 overflow-x-auto max-h-48 whitespace-pre-wrap">
                {JSON.stringify(log.res_body, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-400 text-xs italic">Empty</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuditLogsPage() {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } = useAuthStore();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<AuditLogMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filters
  const [userEmail, setUserEmail] = useState("");
  const [method, setMethod] = useState("");
  const [pathSearch, setPathSearch] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!hasInitialized) initializeFromStorage();
  }, [hasInitialized, initializeFromStorage]);

  const load = useCallback(async () => {
    if (!hasInitialized || !isLoggedIn || !user?.is_admin) return;
    setLoading(true);
    try {
      const result = await fetchAuditLogs({
        user_email: userEmail || undefined,
        method: method || undefined,
        path: pathSearch || undefined,
        status_code: statusCode || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit: 100,
      });
      setLogs(result.data);
      setMeta(result.meta);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [hasInitialized, isLoggedIn, user?.is_admin, userEmail, method, pathSearch, statusCode, from, to, page]);

  useEffect(() => {
    if (!hasInitialized) return;
    if (!isLoggedIn || !user?.is_admin) {
      router.push("/admin-login");
      return;
    }
    void load();
  }, [hasInitialized, isLoggedIn, user?.is_admin, router, load]);

  const handleSearch = () => {
    setPage(1);
    void load();
  };

  const handleClear = () => {
    setUserEmail("");
    setMethod("");
    setPathSearch("");
    setStatusCode("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedLog && (
        <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}

      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-indigo-600" />
                  Audit Logs
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">Full API request &amp; response history</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {meta && (
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                  {meta.total.toLocaleString()} records
                </span>
              )}
              <Button disabled={loading} variant="outline" onClick={() => load()}>
                <RefreshCw />Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-4">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <input
                type="text"
                placeholder="User email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <Combobox
                value={METHOD_OPTIONS.find((o) => o.value === method) || METHOD_OPTIONS[0]}
                onValueChange={(val: any) => {
                  setMethod(val ? val.value : "");
                  setPage(1);
                }}
              >
                <ComboboxInput placeholder="Select Method" />
                <ComboboxContent>
                  <ComboboxEmpty>No options.</ComboboxEmpty>
                  <ComboboxList>
                    {METHOD_OPTIONS.map((option) => (
                      <ComboboxItem key={option.value} value={option}>
                        {option.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <input
                type="text"
                placeholder="Path contains..."
                value={pathSearch}
                onChange={(e) => setPathSearch(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                type="number"
                placeholder="Status code"
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={handleSearch} className="gap-1">
                <Search className="h-3.5 w-3.5" /> Search
              </Button>
              <Button size="sm" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-gray-400">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center text-gray-400">No audit logs found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="p-3">Time</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Path</th>
                      <th className="p-3">Frontend URL</th>
                      <th className="p-3">IP</th>
                      <th className="p-3">Device</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-3">
                          {log.user_email ? (
                            <div>
                              <p className="font-medium text-gray-900 text-xs">{log.user_name || "—"}</p>
                              <p className="text-gray-400 text-xs">{log.user_email}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Anonymous</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`rounded px-2 py-0.5 text-xs font-bold ${METHOD_COLORS[log.method] || "bg-gray-100 text-gray-700"}`}>
                            {log.method}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs text-gray-700 max-w-[220px] truncate" title={log.path}>
                          {log.path}
                        </td>
                        <td className="p-3 text-xs text-gray-500 max-w-[150px] truncate" title={log.frontend_url ?? ""}>
                          {log.frontend_url ? (
                            <span title={log.frontend_url}>{log.frontend_url}</span>
                          ) : "—"}
                        </td>
                        <td className="p-3 font-mono text-xs text-gray-500">{log.ip ?? "—"}</td>
                        <td className="p-3 text-xs">{parseUA(log.user_agent)}</td>
                        <td className="p-3">
                          <span className={`text-sm ${statusColor(log.status_code)}`}>
                            {log.status_code ?? "—"}
                          </span>
                        </td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 h-7 text-xs"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-3 w-3" /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {meta.page} of {meta.total_pages} &nbsp;·&nbsp; {meta.total.toLocaleString()} total records
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= meta.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
