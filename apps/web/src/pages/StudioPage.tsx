import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUpload } from '../components/ImageUpload';
import { PromptInput } from '../components/PromptInput';
import { StyleSelect } from '../components/StyleSelect';
import { RecentGenerations } from '../components/RecentGenerations';
import { StatusBanner } from '../components/StatusBanner';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { Generation } from '../types';

const MAX_RETRIES = 3;

const normalizeGeneration = (generation: Generation): Generation => ({
  ...generation,
  imageUrl: generation.imageUrl.startsWith('http') ? generation.imageUrl : `${api.baseUrl}${generation.imageUrl}`,
});

export const StudioPage = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Minimalist');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [history, setHistory] = useState<Generation[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const remainingRetries = Math.max(0, MAX_RETRIES - retryCount);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    try {
      const items = await api.fetchGenerations(token);
      setHistory(items.map(normalizeGeneration));
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const canGenerate = useMemo(() => prompt.length >= 3 && Boolean(imageFile) && !isGenerating, [prompt, imageFile, isGenerating]);

  const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setImageFile(file);
    setImagePreview(previewUrl);
    setImageError(file ? null : 'Please provide an image to continue.');
  };

  const runGeneration = useCallback(
    async (attempt = retryCount) => {
      if (!token || !imageFile) {
        setImageError('Please upload an image to generate.');
        return;
      }

      const controller = new AbortController();
      setAbortController(controller);

      setIsGenerating(true);
      setStatusMessage('Modelia is sketching your look…');
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const result = await api.createGeneration({
          token,
          prompt,
          style,
          imageFile,
          signal: controller.signal,
        });

        const completed = normalizeGeneration(result);
        setHistory((prev) => [completed, ...prev].slice(0, 5));
        setImagePreview(`${completed.imageUrl}?t=${Date.now()}`);
        setStatusMessage(null);
        setSuccessMessage('✨ Generation completed');
        setRetryCount(0);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          setStatusMessage('Generation aborted.');
          return;
        }
        const message = error instanceof Error ? error.message : 'Failed to generate. Please try again.';
        setErrorMessage(message);
        if (message.includes('Model overloaded') && attempt < MAX_RETRIES) {
          const attemptsLeft = MAX_RETRIES - attempt;
          setStatusMessage(
            `Model overloaded. You can retry ${attemptsLeft} more ${attemptsLeft === 1 ? 'time' : 'times'}.`,
          );
        } else {
          setStatusMessage(null);
        }
      } finally {
        setIsGenerating(false);
        setAbortController(null);
      }
    },
    [token, imageFile, prompt, style, retryCount],
  );

  const handleGenerate = async () => {
    setRetryCount(0);
    await runGeneration(0);
  };

  const handleRetry = async () => {
    if (retryCount >= MAX_RETRIES) return;
    const nextAttempt = retryCount + 1;
    setRetryCount(nextAttempt);
    await runGeneration(nextAttempt);
  };

  const handleAbort = () => {
    abortController?.abort();
  };

  const handleSelectHistory = (generation: Generation) => {
    setPrompt(generation.prompt);
    setStyle(generation.style);
    setImagePreview(generation.imageUrl);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const backgroundClass = darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50';

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-indigo-500">Modelia AI Studio</p>
            <h1 className="text-xl font-semibold text-slate-900">{user ? `Hi, ${user.email}` : 'Studio'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {darkMode ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[2fr,_1fr]">
        <section className="space-y-6 rounded-3xl bg-white p-6 shadow-lg" aria-label="Generation workspace">
          {statusMessage && <StatusBanner status="info" message={statusMessage} />}
          {errorMessage && <StatusBanner status="error" message={errorMessage} />}
          {successMessage && <StatusBanner status="success" message={successMessage} />}

          <ImageUpload
            previewUrl={imagePreview}
            onFileChange={handleImageChange}
            disabled={isGenerating}
            error={imageError}
            onError={setImageError}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <PromptInput value={prompt} onChange={setPrompt} disabled={isGenerating} />
            <StyleSelect value={style} onChange={setStyle} disabled={isGenerating} />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              Generate look
            </button>
            <button
              type="button"
              onClick={handleAbort}
              disabled={!isGenerating}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Abort
            </button>
            <button
              type="button"
              onClick={handleRetry}
              disabled={retryCount >= MAX_RETRIES || !errorMessage?.includes('Model overloaded')}
              className="rounded-full border border-indigo-200 px-5 py-3 text-sm font-medium text-indigo-600 hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Retry ({remainingRetries} left)
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <RecentGenerations items={history} onSelect={handleSelectHistory} />
        </aside>
      </main>
    </div>
  );
};

