import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fbf6ec',
            border: '1px solid #ddcfb8',
            color: '#2c2118',
            fontFamily: '"Hanken Grotesk", sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
}
