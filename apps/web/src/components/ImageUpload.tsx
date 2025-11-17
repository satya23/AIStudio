type ImageUploadProps = {
  previewUrl: string | null;
  onFileChange: (file: File | null, previewUrl: string | null) => void;
  disabled?: boolean;
  error?: string | null;
  onError?: (message: string | null) => void;
};

export const ImageUpload = ({ previewUrl, onFileChange, disabled, error, onError }: ImageUploadProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onFileChange(null, null);
      onError?.(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onFileChange(null, null);
      onError?.('File is too large. Please choose one under 10MB.');
      return;
    }

    onError?.(null);
    const nextPreview = URL.createObjectURL(file);
    onFileChange(file, nextPreview);
  };

  return (
    <div>
      <label htmlFor="image-upload" className="block text-sm font-medium text-slate-700">
        Base image (JPEG/PNG, 10MB max)
      </label>
      <div className="mt-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-6">
        <input
          id="image-upload"
          name="image-upload"
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleChange}
          disabled={disabled}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-medium file:text-indigo-700"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="mt-4 max-h-60 w-full rounded-lg object-cover shadow-md"
          />
        )}
      </div>
    </div>
  );
};

