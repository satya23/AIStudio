type StatusBannerProps = {
  status?: 'info' | 'error' | 'success';
  message: string;
};

const styles = {
  info: 'border-indigo-200 bg-indigo-50 text-indigo-900',
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

export const StatusBanner = ({ status = 'info', message }: StatusBannerProps) => (
  <div role="status" aria-live="polite" className={`rounded-md border px-4 py-2 text-sm ${styles[status]}`}>
    {message}
  </div>
);

