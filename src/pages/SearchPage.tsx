import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  FileText,
  Shield,
  Briefcase,
  Calendar,
  User,
  ArrowRight,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';
import { DocumentResponse } from '../types';
import { documentService } from '../services/documentService';
import { useDebounce } from '../hooks/useDebounce';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import DocumentCard from '../components/documents/DocumentCard';
import DocumentTable from '../components/documents/DocumentTable';
import Button from '../components/common/Button';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  const [results, setResults] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm || !searchTerm.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      const data = await documentService.searchDocuments(searchTerm.trim());
      setResults(data);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj.message || 'Search execution failed on backend server.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setSearchParams({ q: debouncedQuery.trim() }, { replace: true });
      performSearch(debouncedQuery);
    } else {
      setSearchParams({}, { replace: true });
      setResults([]);
      setHasSearched(false);
    }
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Search className="w-6 h-6 text-cyan-400" />
          <span>Forensic Search Engine</span>
        </h2>
        <p className="text-xs text-slate-400">
          Query digital evidence records across document titles and case reference numbers.
        </p>
      </div>

      {/* Search Bar Container */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by case number (e.g. CASE-2026) or document title (e.g. Forensic Report)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-[#0d1320] text-sm text-slate-100 placeholder:text-slate-500 pl-12 pr-12 py-3.5 rounded-xl border border-slate-700/80 hover:border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            Quick Terms:
          </span>
          {['CASE-', 'Forensic', 'Report', 'Evidence', 'Investigation'].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setQuery(term)}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-cyan-300 font-mono text-[11px] transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {isLoading ? (
        <LoadingSpinner message="Scanning database index for matches..." />
      ) : errorMsg ? (
        <div className="p-6 bg-rose-950/20 border border-rose-800/60 rounded-xl text-center">
          <p className="text-sm font-semibold text-rose-300">Search Failed</p>
          <p className="text-xs text-slate-400 mt-1">{errorMsg}</p>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <EmptyState
          title={`No Documents Found for "${query}"`}
          description="Try adjusting your search query or verifying the case number and document title spelling."
        />
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Discovered <strong className="text-cyan-400">{results.length}</strong> matching evidence records for &quot;{query}&quot;
            </span>
          </div>

          <DocumentTable documents={results} />
        </div>
      ) : (
        <div className="p-12 text-center bg-[#111827]/40 border border-dashed border-slate-800 rounded-2xl">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Forensic Index Ready</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Type keywords above to query the Spring Boot backend document search API in real-time.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
