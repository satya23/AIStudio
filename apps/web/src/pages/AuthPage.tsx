import { Link } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';

export const AuthPage = ({ mode }: { mode: 'login' | 'signup' }) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-6 py-12">
    <div className="w-full max-w-2xl rounded-3xl bg-white px-10 py-12 shadow-2xl">
      <h1 className="text-center text-3xl font-semibold text-slate-900">
        {mode === 'login' ? 'Sign in to Modelia' : 'Create your Modelia ID'}
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        {mode === 'login'
          ? 'Continue your fashion explorations with one secure ID.'
          : 'Sync prompts, uploads, and overload retries across devices.'}
      </p>

      <div className="mt-10">
        <AuthForm mode={mode} />
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        {mode === 'login' ? (
          <>
            Need an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 underline-offset-4 hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 underline-offset-4 hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  </div>
);

